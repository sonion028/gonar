/// <reference types="node" />

import { relative } from 'node:path';

/**
 * @author sonion
 * @description 转换为相对路径
 * @param {string} file - 文件路径
 */
const toRelativePath = (file: string) =>
  relative(import.meta.dirname, file).replaceAll('\\', '/');

//
/**
 * @author sonion
 * @description 相对路径列表 和 获取子包路径
 * @param {string[]} files - 文件路径列表
 */
const getSubPackagePaths = (files: string[]) => {
  const relativePathFiles = files.map(toRelativePath);
  const subPackagePaths = relativePathFiles.reduce((pre, cur) => {
    const match = cur.match(/^(packages|apps)\/([^/]+)\//);
    match?.length && pre.add(`${match[1]}/${match[2]}`);
    return pre;
  }, new Set<string>());
  return {
    relativePathFiles,
    subPackagePaths,
  };
};

/**
 * @author sonion
 * @description 生成tsc检查命令
 * @param {string[]} files - 文件路径列表
 */
const getAffectedTypecheckCommands = (files: string[]) => {
  const commands: string[] = [];
  const { subPackagePaths } = getSubPackagePaths(files);
  if (!subPackagePaths.size) return commands;
  const paths = [...subPackagePaths];
  // 单个子包不支持大括号写法
  const filters = `"./${paths.length === 1 ? paths[0] : `{${paths.join(',')}}`}"`;
  commands.push(`pnpm --filter ${filters} exec tsc --noEmit`);
  return commands;
};

export default {
  // 仅检查受影响的子包
  '{packages,apps}/**/*.{ts,tsx,vue}': getAffectedTypecheckCommands,
  // tsc 检查只能整个包，不能只检查某个文件
  'src/**/*.{ts,tsx,vue}': () => ['tsc --noEmit'],
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue}': ['eslint --fix'],
  '{src,packages,apps}/**/*.{js,jsx,ts,tsx,vue,css,scss,less,md,mdx,html,json,yml,yaml}':
    ['oxfmt', 'cspell lint'],
};
