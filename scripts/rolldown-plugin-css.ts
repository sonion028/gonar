/**
 
- rolldown-plugin-css
- 
- A Rolldown plugin that handles CSS with:
- - Pluggable preprocessors (pass your own sass / less instance)
- - LightningCSS transform (syntax lowering, vendor prefixing, nesting, etc.)
- - CSS Modules (for *.module.css / *.module.{preprocessor-ext})
- - Per-entry CSS output: each entry chunk gets its own .css file containing
- only the styles reachable from that entry’s module graph.
- 
- Pipeline (per file):
- .scss/.sass  ──► preprocessors.scss.process()  ──► plain CSS + sourceMap
- .less        ──► preprocessors.less.process()  ──► plain CSS + sourceMap
- .css         ──────────────────────────────────────► (skip preprocess)
- ```
                                                ↓
  ```
- ```
                                    lightningcss.transform()
  ```
- ```
                                    (cssModules for *.module.*)
  ```
- ```
                                                ↓
  ```
- ```
                     CSS Modules : return JS proxy { local → scoped }
  ```
- ```
                     Normal CSS  : store in cssChunks map, return stub JS
  ```
- 
- generateBundle phase:
- For each entry chunk, walk its moduleIds to collect the CSS files it
- (transitively) imported, concatenate them in import order, and emit
- one “<entry-name>.css” asset per entry.
- 
- References / inspiration:
- - @tsdown/css  (https://github.com/rolldown/tsdown/tree/main/packages/css)
- - Vite css.ts  (https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/css.ts)
- - LightningCSS transform API  (https://lightningcss.dev/docs.html)
 */

import path from 'node:path'
import type { Plugin, NormalizedOutputOptions, OutputBundle, OutputChunk } from 'rolldown'
import { transform, Features, type TransformOptions } from 'lightningcss'
// import type { BrowserVersion } from 'lightningcss'

// ─── Preprocessor Interface ───────────────────────────────────────────────────

/**
 
- Result returned by a preprocessor’s `process()` call.
 */
  export interface PreprocessorResult {
  /** Plain CSS string after compilation */
  css: string
  /**
  - Optional source map JSON string linking compiled CSS back to the source.
  - When provided it is forwarded to LightningCSS as `inputSourceMap` so the
  - final map traces all the way back to the original source file.
   */
    map?: string
    }

/**
 
- Adapter interface for a CSS preprocessor.
- 
- You implement this once per language and pass it via `preprocessors`.
- The plugin calls `process()` for every file whose extension matches
- one of the keys in the `preprocessors` map.
- 
- @example Sass adapter
- ```ts
 
  ```
- import * as sass from ‘sass’
- 
- const sassPreprocessor: Preprocessor = {
- extensions: [’.scss’, ‘.sass’],
- async process(code, id) {
- ```
  const result = sass.compileString(code, {
  ```
- ```
    syntax: id.endsWith('.sass') ? 'indented' : 'scss',
  ```
- ```
    sourceMap: true,
  ```
- ```
    sourceMapIncludeSources: true,
  ```
- ```
    url: new URL(`file://${id}`),
  ```
- ```
    loadPaths: [path.dirname(id), 'node_modules'],
  ```
- ```
  })
  ```
- ```
  return { css: result.css, map: result.sourceMap ? JSON.stringify(result.sourceMap) : undefined }
  ```
- },
- }
- ```
 
  ```
- 
- @example Less adapter
- ```ts
 
  ```
- import less from ‘less’
- 
- const lessPreprocessor: Preprocessor = {
- extensions: [’.less’],
- async process(code, id) {
- ```
  const result = await less.render(code, {
  ```
- ```
    filename: id,
  ```
- ```
    sourceMap: { sourceMapFileInline: false },
  ```
- ```
  })
  ```
- ```
  return { css: result.css, map: result.map }
  ```
- },
- }
- ```
 
  ```
 
 */
export interface Preprocessor {
/** File extensions handled by this preprocessor, e.g. [’.scss’, ‘.sass’] */
extensions: string[]
/**
 
- Compile `code` (source of `id`) to plain CSS.
- @param code  Raw source code of the file
- @param id    Absolute file path (no query string)
 */
  process(code: string, id: string): Promise<PreprocessorResult> | PreprocessorResult
  }

// ─── Plugin Options ───────────────────────────────────────────────────────────

export interface CSSPluginOptions {
/**
 
- Pluggable preprocessors, one per language.
- Each entry must declare which `extensions` it handles.
- 
- @example
- ```ts
 
  ```
- cssPlugin({ preprocessors: [sassPreprocessor, lessPreprocessor] })
- ```
 
  ```
 
 */
preprocessors?: Preprocessor[]

/**
 
- Browser targets for LightningCSS syntax lowering and vendor prefixing.
- Use `browserslistToTargets(browserslist('...'))` or build the object manually.
- @example { chrome: (100 << 16) | (0 << 8) }
 */
  targets?: Record<string, unknown>

/**
 
- LightningCSS draft features to transform/lower.
- @default Features.Nesting | Features.CustomMediaQueries
 */
  include?: number

/**
 
- Whether to minify the output CSS.
- @default false
 */
  minify?: boolean

/**
 
- CSS Modules scoped class name pattern.
- Supports `[hash]` and `[local]` tokens.
- @default `[hash]_[local]`
 */
  cssModulesPattern?: string
  }

// ─── Internal Types ───────────────────────────────────────────────────────────

/** Transformed CSS stored per absolute file id */
interface CSSRecord {
css: string
/** Whether this file is a CSS Module (its CSS still goes into the bundle) */
isModule: boolean
}

// ─── Regex helpers ────────────────────────────────────────────────────────────

/** Matches CSS Module files: *.module.{any-extension} */
const CSS_MODULE_RE = /.module.[a-z]+$/i

// ─── Plugin ───────────────────────────────────────────────────────────────────

/**
 *
 * @param options
 */
export function cssPlugin(options: CSSPluginOptions = {}): Plugin {
const {
preprocessors = [],
targets,
include = Features.Nesting | Features.CustomMediaQueries,
minify = false,
cssModulesPattern = '[hash]_[local]',
} = options

// Build a fast lookup: extension → Preprocessor
const extMap = new Map<string, Preprocessor>()
for (const pp of preprocessors) {
for (const ext of pp.extensions) {
// normalise: ensure leading dot, lowercase
const key = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
extMap.set(key, pp)
}
}

// Known extensions = native CSS + all preprocessor extensions
const handledExtensions = new Set(['.css', ...extMap.keys()])

/**
 
- Stores the LightningCSS-transformed CSS for every processed file.
- Keys are clean absolute file paths (no query strings).
- Insertion order is preserved → reflects the import order within each entry.
 */
  const cssRecords = new Map<string, CSSRecord>()

return {
name: 'css-plugin',

// ── Step 1: Transform each CSS / preprocessor file ─────────────────────
async transform(code: string, id: string) {
  const cleanId = id.split('?')[0]
  const ext = path.extname(cleanId).toLowerCase()

  if (!handledExtensions.has(ext)) return null

  const isModule = CSS_MODULE_RE.test(cleanId)

  // ── 1a. Preprocessor step ─────────────────────────────────────────────
  let cssSource = code
  let inputSourceMap: string | undefined

  const preprocessor = extMap.get(ext)
  if (preprocessor) {
    let result: PreprocessorResult
    try {
      result = await preprocessor.process(code, cleanId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      this.error(`[css-plugin] Preprocessor failed for "${cleanId}":\n${msg}`)
      return null
    }
    cssSource = result.css
    inputSourceMap = result.map
  }

  // ── 1b. LightningCSS transform ────────────────────────────────────────
  const filename = path.relative(process.cwd(), cleanId)

  const lcOptions: TransformOptions<{}> = {
    filename,
    code: Buffer.from(cssSource),
    targets,
    include,
    minify,
    sourceMap: true,
    ...(inputSourceMap ? { inputSourceMap } : {}),
    ...(isModule
      ? { cssModules: { pattern: cssModulesPattern } }
      : {}),
  }

  const { code: transformedCode, exports: cssExports, map } = transform(lcOptions)
  const transformedCSS = transformedCode.toString()

  // ── 1c. Store CSS for bundling ─────────────────────────────────────────
  // Even CSS Modules produce scoped CSS that must end up in the output.
  cssRecords.set(cleanId, { css: transformedCSS, isModule })

  // ── 1d. CSS Modules → return JS proxy ─────────────────────────────────
  if (isModule && cssExports) {
    const classMap: Record<string, string> = {}
    for (const [local, info] of Object.entries(cssExports)) {
      classMap[local] = (info as { name: string }).name
    }

    const smComment = map
      ? `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(map.toString()).toString('base64')}`
      : ''

    return {
      code: `const classes = ${JSON.stringify(classMap, null, 2)};\nexport default classes;${smComment}`,
      map: null,
      moduleSideEffects: false,
    }
  }

  // ── 1e. Plain CSS → return stub JS ────────────────────────────────────
  const smComment = map
    ? `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(map.toString()).toString('base64')}`
    : ''

  return {
    code: `/* css: ${filename} */${smComment}`,
    map: null,
    moduleSideEffects: 'no-treeshake',
  }
},

// ── Step 2: Emit one CSS asset per entry chunk ──────────────────────────
generateBundle(_outputOptions: NormalizedOutputOptions, bundle: OutputBundle) {
  if (cssRecords.size === 0) return

  /**
   * Collect all CSS module ids reachable from a given JS chunk by walking
   * its `moduleIds`. Rolldown populates `moduleIds` with every module
   * (including transitive dependencies) that ended up in that chunk.
   *
   * We iterate `cssRecords` in insertion order so that the concatenation
   * order matches the original import order.
   * @param chunk
   */
  function cssForChunk(chunk: OutputChunk): string {
    const chunkModuleSet = new Set(chunk.moduleIds)
    const parts: string[] = []
    for (const [cssId, record] of cssRecords) {
      if (chunkModuleSet.has(cssId)) {
        parts.push(record.css)
      }
    }
    return parts.join('\n')
  }

  for (const chunk of Object.values(bundle)) {
    // Only process entry chunks (isEntry === true)
    if (chunk.type !== 'chunk' || !chunk.isEntry) continue

    const css = cssForChunk(chunk)
    if (!css.trim()) continue

    // Derive the CSS filename from the chunk's name, e.g. "main" → "main.css"
    const cssFileName = chunk.name
      ? `${chunk.name}.css`
      : chunk.fileName.replace(/\.[cm]?js$/, '.css')

    this.emitFile({
      type: 'asset',
      fileName: cssFileName,
      source: css,
    })
  }
},

}
}

export default cssPlugin