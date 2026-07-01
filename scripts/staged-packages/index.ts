import { relative } from 'node:path';

// 转相对路径
const toRelativePath = (file: string) =>
  relative(process.cwd(), file).replaceAll('\\', '/');

// 相对路径列表 和 获取子包路径
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

// 生成tsc检查命令
export const getStagedPackagesTscCmd = (files: string[]) => {
  const commands: string[] = [];
  const { subPackagePaths } = getSubPackagePaths(files);
  if (!subPackagePaths.size) return commands;
  const paths = [...subPackagePaths];
  // 单个子包不支持大括号写法
  const filters = `"./${paths.length === 1 ? paths[0] : `{${paths.join(',')}}`}"`;
  // 使用turbo跑子包typecheck命令，能先构建依赖子包，不用别名类型检查也正常
  commands.push(`pnpm --filter ${filters} exec turbo run typecheck`);
  return commands;
};
