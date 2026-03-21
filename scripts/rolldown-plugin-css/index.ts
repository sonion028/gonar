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
   * CSS 文件输出到总输出目录下的相对子目录。
   * 设为空字符串 '' 则直接输出到根目录。
   * @default 'css'
   * @example 'assets/css'  → dist/assets/css/components.css
   * @example ''            → dist/components.css
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
    cssDir = 'css',
  } = options;

  // CSS module id → transformed CSS string
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

        // 只看这个 chunk 直接拥有的 CSS 模块（平铺，不递归）。
        // rolldown 把 CSS stub 模块分配到引用它的 JS 所在的 chunk，
        // 所以 chunk.moduleIds 里出现 CSS id = 这个 chunk 直接包含了这段样式。
        const cssIds = chunk.moduleIds.filter((id) => cssRecords.has(id));
        if (cssIds.length === 0) continue;

        const css = cssIds.map((id) => cssRecords.get(id)!).join('\n');

        // CSS asset 与 JS chunk 一一对应。
        // 取 chunk 的基础名（不含目录、不含后缀）作为 CSS 文件名，
        // 统一放到 cssDir 目录下。
        //   entry chunk:     chunk.name             → "css/components.css"
        //   非 entry chunk:  chunk.fileName 的 basename → "css/components.Dzqt_Fdc.css"
        const baseName =
          chunk.isEntry && chunk.name
            ? `${chunk.name}.css`
            : path.basename(chunk.fileName).replace(/\.[cm]?[jt]s$/, '.css');
        const cssFileName = cssDir ? `${cssDir}/${baseName}` : baseName;

        this.emitFile({ type: 'asset', fileName: cssFileName, source: css });
      }
    },
  };
}

export { Features };
export type { Targets };
export default cssPlugin;
