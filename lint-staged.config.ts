/**
 * lint-staged 会将匹配到的文件路径追加到命令末尾。
 * 使用 `sh -c '...' --` 后，追加的文件路径可通过脚本内的 `$@` 获取。
 * 从 staged 文件中提取受影响的 packages/apps 子包，并按首次出现顺序去重后逐包执行 tsc。
 */
const subPackagesTsc = `sh -c 'printf "%s\\n" "$@" | grep -Eo "(packages|apps)/[^/]+" | awk "!seen[\\$0]++" | xargs -I{} pnpm --filter "./{}" exec tsc --noEmit' --`;
export default {
  // 仅检查受影响的子包
  '{packages,apps}/**/*.{ts,tsx,vue}': subPackagesTsc,
  // tsc 检查只能整个包，不能只检查某个文件
  'src/**/*.{ts,tsx,vue}': () => ['tsc --noEmit'],
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue}': 'eslint --fix',
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue,css,scss,less,md,mdx,html,json,yml,yaml}':
    ['oxfmt', 'cspell lint'],
};
