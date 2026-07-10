import { getStagedPackagesTscCmd } from './scripts/staged-packages/index.ts';

export default {
  // 仅检查受影响的子包
  '{packages,apps}/**/*.{ts,tsx,vue}': getStagedPackagesTscCmd,
  '{packages,apps}/**/*.{js,jsx,ts,tsx,vue}': 'oxlint --fix',
  '{packages,apps}/**/*.{js,jsx,ts,tsx,vue,css,scss,less,md,mdx,html,json,yml,yaml}':
    ['oxfmt', 'cspell lint'],
};
