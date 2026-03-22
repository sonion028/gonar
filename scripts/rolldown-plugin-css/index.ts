import path from 'node:path';
import type { Plugin, NormalizedOutputOptions, OutputBundle } from 'rolldown';
import {
  transform,
  Features,
  type TransformOptions,
  type Targets,
  type CustomAtRules,
} from 'lightningcss';

export interface CSSPluginOptions {
  targets?: Targets;
  /** @default Features.Nesting | Features.CustomMediaQueries */
  include?: number;
  /** @default false */
  minify?: boolean;
  /** @default '[hash]_[local]' */
  cssModulesPattern?: string;
  /**
   * 注入的 import 语句格式，需与 output.format 保持一致。
   * @default 'es'
   */
  format?: 'cjs' | 'es';
  /**
   * CSS 文件输出到总输出目录下的相对子目录。
   * 设为空字符串 '' 则直接输出到根目录。
   * @default 'css'
   */
  cssDir?: string;
}

// ── Auto preprocessor loader ──────────────────────────────────────────────────

let _sass: typeof import('sass') | null | undefined;
let _less: typeof import('less') | null | undefined;

/**
 *
 */
async function loadSass(): Promise<typeof import('sass')> {
  if (_sass !== undefined) {
    if (_sass === null)
      throw new Error(
        '[css-plugin] No sass compiler found.\n' +
          'Install:  npm add -D sass-embedded   (recommended)\n' +
          '          npm add -D sass'
      );
    return _sass;
  }
  for (const pkg of ['sass-embedded', 'sass'] as const) {
    try {
      _sass = (await import(pkg)) as typeof import('sass');
      return _sass;
    } catch {
      /**/
    }
  }
  _sass = null;
  throw new Error(
    '[css-plugin] No sass compiler found. npm add -D sass-embedded'
  );
}

/**
 *
 */
async function loadLess(): Promise<typeof import('less')> {
  if (_less !== undefined) {
    if (_less === null)
      throw new Error('[css-plugin] less not installed. npm add -D less');
    return _less;
  }
  try {
    _less = await import('less');
    return _less;
  } catch {
    /**/
  }
  _less = null;
  throw new Error('[css-plugin] less not installed. npm add -D less');
}

// ── Regex ─────────────────────────────────────────────────────────────────────

const CSS_RE = /\.(css|scss|sass|less)$/i;
const SASS_RE = /\.(scss|sass)$/i;
const LESS_RE = /\.less$/i;
const CSS_MOD_RE = /\.module\.[a-z]+$/i;

const slash = (p: string) => p.replace(/\\/g, '/');

// ── Plugin ────────────────────────────────────────────────────────────────────

/**
 *
 * @param options
 */
export function cssPlugin(options: CSSPluginOptions = {}): Plugin {
  const {
    targets,
    include = Features.Nesting | Features.CustomMediaQueries,
    minify = false,
    cssModulesPattern = '[hash]_[local]',
    format = 'es',
    cssDir = 'css',
  } = options;

  const cssRecords = new Map<string, string>();

  return {
    name: 'css-plugin',

    async transform(code, id) {
      const cleanId = id.split('?')[0];
      if (!CSS_RE.test(cleanId)) return null;

      const isModule = CSS_MOD_RE.test(cleanId);

      let cssSource = code;
      let inputSourceMap: string | undefined;

      if (SASS_RE.test(cleanId)) {
        const sass = await loadSass();
        const r = sass.compileString(code, {
          syntax: cleanId.endsWith('.sass') ? 'indented' : 'scss',
          sourceMap: true,
          sourceMapIncludeSources: true,
          url: new URL(`file://${cleanId}`),
          loadPaths: [path.dirname(cleanId), 'node_modules'],
        });
        cssSource = r.css;
        if (r.sourceMap) inputSourceMap = JSON.stringify(r.sourceMap);
      } else if (LESS_RE.test(cleanId)) {
        const less = await loadLess();
        const r = await less.render(code, {
          filename: cleanId,
          sourceMap: { sourceMapFileInline: false },
          paths: [path.dirname(cleanId), 'node_modules'],
        });
        cssSource = r.css;
        if (r.map) inputSourceMap = r.map;
      }

      const filename = path.relative(process.cwd(), cleanId);
      const lcOpts: TransformOptions<CustomAtRules> = {
        filename,
        code: Buffer.from(cssSource),
        targets,
        include,
        minify,
        sourceMap: true,
        ...(inputSourceMap ? { inputSourceMap } : {}),
        ...(isModule ? { cssModules: { pattern: cssModulesPattern } } : {}),
      };

      const { code: out, exports: cssExports, map } = transform(lcOpts);
      cssRecords.set(cleanId, out.toString());

      if (isModule && cssExports) {
        const classMap: Record<string, string> = {};
        for (const [local, info] of Object.entries(cssExports))
          classMap[local] = (info as { name: string }).name;
        const sm = map
          ? `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(map.toString()).toString('base64')}`
          : '';
        return {
          code: `const classes = ${JSON.stringify(classMap, null, 2)};\nexport default classes;${sm}`,
          map: null,
          moduleSideEffects: true,
        };
      }

      return {
        code: `/* css-plugin: ${filename} */`,
        map: null,
        moduleSideEffects: true,
      };
    },

    generateBundle(_opts: NormalizedOutputOptions, bundle: OutputBundle) {
      if (cssRecords.size === 0) return;

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;

        const cssIds = Object.keys(chunk.modules).filter((id) =>
          cssRecords.has(id)
        );
        if (cssIds.length === 0) continue;
        const css = cssIds.map((id) => cssRecords.get(id)!).join('\n');

        const baseName = `${
          chunk.isEntry && chunk.name
            ? chunk.name
            : path.basename(chunk.fileName, path.extname(chunk.fileName))
        }.css`;
        const cssFileName = cssDir ? `${cssDir}/${baseName}` : baseName;
        this.emitFile({ type: 'asset', fileName: cssFileName, source: css });

        // 注入 import CSS 语句
        const jsDir = path.dirname(chunk.fileName);
        const rel = slash(path.relative(jsDir, cssFileName));
        const importPath = rel.startsWith('.') ? rel : `./${rel}`;
        const importStmt =
          format === 'cjs'
            ? `require('${importPath}');\n`
            : `import '${importPath}';\n`;
        chunk.code = importStmt + chunk.code;
      }
    },
  };
}

export { Features };
export type { Targets };
export default cssPlugin;
