/// <reference types="node" />

import { relative } from 'node:path';

const toRelativePath = (file: string) =>
  relative(import.meta.dirname, file).replaceAll('\\', '/');

const getAffectedTypecheckCommands = (files: string[]) => {
  const commands: string[] = [];
  const packageFilters = new Set<string>();
  // 转相对路径
  const normalizedFiles = files.map(toRelativePath);
  // 是否在根src检查
  if (normalizedFiles.some((file) => file.startsWith('src/'))) {
    commands.push('tsc -p tsconfig.json --noEmit');
  }
  // 子包的检查
  for (const file of normalizedFiles) {
    const match = file.match(/^(packages|apps)\/([^/]+)\//);
    if (!match) continue;
    const [, scope, name] = match;
    packageFilters.add(`--filter ./${scope}/${name}`);
  }
  packageFilters.size &&
    commands.push(`pnpm ${[...packageFilters].join(' ')} exec tsc --noEmit`);
  return commands;
};

export default {
  // 仅检查受影响的子包；若命中根目录源码或关键配置，再补充根级 tsc
  '{src,packages,apps}/**/*.{ts,tsx,vue}': getAffectedTypecheckCommands,
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue}': ['eslint --fix'],
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue,css,scss,less,md,mdx,html,json,yml,yaml}':
    ['oxfmt', 'cspell lint'],
};
