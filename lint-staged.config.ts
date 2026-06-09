import { getStagedPackagesTscCmd } from './scripts/staged-packages/index.ts';

export default {
  // 仅检查受影响的子包
  '{packages,apps}/**/*.{ts,tsx,vue}': getStagedPackagesTscCmd,
  // tsc 检查只能整个包，不能只检查某个文件
  'src/**/*.{ts,tsx,vue}': () => ['tsc --noEmit'],
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue}': ['eslint --fix'],
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue,css,scss,less,md,mdx,html,json,yml,yaml}':
    ['oxfmt', 'cspell lint'],
};
