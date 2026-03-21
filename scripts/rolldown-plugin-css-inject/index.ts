/**
 * rolldown-plugin-css-inject
 *
 * 完全独立，不依赖任何外部插件的共享状态。
 *
 * 核心逻辑：
 *   renderChunk 里检查 chunk.moduleIds，只要有 CSS 扩展名的模块 id，
 *   就说明这个 chunk 直接包含了 CSS，注入对应的 import 语句。
 *
 *   不递归遍历依赖——CSS stub 模块由 rolldown 分配到引用它的 JS 所在的 chunk，
 *   所以平铺检查 chunk.moduleIds 就足够了。
 *
 * 与 cssPlugin 的唯一约定（纯字符串规则）：
 *   entry chunk  → cssFileName = chunk.name + '.css'
 *   非 entry chunk → cssFileName = chunk.fileName 后缀换 .css
 */

import path from 'node:path';
import type { Plugin } from 'rolldown';

export interface CSSInjectPluginOptions {
  /**
   * CSS 文件所在的相对子目录。
   * 必须与 cssPlugin 的 cssDir 保持一致，否则注入的 import 路径会指向错误位置。
   * @default 'css'
   */
  cssDir?: string;
  /**
   * CSS 扩展名列表，需与 cssPlugin 处理的扩展名一致。
   * @default ['.css', '.scss', '.sass', '.less']
   */
  cssExtensions?: string[];
  /** @default 'es' */
  format?: 'es' | 'cjs';
}

const DEFAULT_CSS_EXTS = ['.css', '.scss', '.sass', '.less'];
const slash = (p: string) => p.replace(/\\/g, '/');

/**
 *
 * @param options
 */
export function cssInjectPlugin(options: CSSInjectPluginOptions = {}): Plugin {
  const {
    cssDir = 'css',
    cssExtensions = DEFAULT_CSS_EXTS,
    format = 'es',
  } = options;

  const isCSSId = (id: string) =>
    cssExtensions.some((ext) => id.split('?')[0].toLowerCase().endsWith(ext));

  return {
    name: 'css-inject-plugin',

    renderChunk(code, chunk) {
      // 平铺检查：这个 chunk 直接拥有 CSS 模块吗？
      const hasCSSModule = chunk.moduleIds.some((id) => isCSSId(id));
      if (!hasCSSModule) return null;

      // 与 cssPlugin 约定的命名规则
      const baseName =
        chunk.isEntry && chunk.name
          ? `${chunk.name}.css`
          : path.basename(chunk.fileName).replace(/\.[cm]?[jt]s$/, '.css');
      const cssFileName = cssDir ? `${cssDir}/${baseName}` : baseName;

      const jsDir = path.dirname(chunk.fileName);
      const rel = slash(path.relative(jsDir, cssFileName));
      const importPath = rel.startsWith('.') ? rel : `./${rel}`;

      const importStmt =
        format === 'cjs'
          ? `require('${importPath}');\n`
          : `import '${importPath}';\n`;

      return {
        code: importStmt + code,
        map: null,
      };
    },
  };
}

export default cssInjectPlugin;
