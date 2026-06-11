import { execSync } from 'node:child_process';

export const getPackagesPath = () => {
  const rootPath = process.cwd();
  try {
    const result = execSync('pnpm -r exec pwd', {
      encoding: 'utf-8',
      windowsHide: true,
    });
    // 将多行字符串按换行符分割成数组，并去除首尾空白
    const paths = result.trim().split('\n');
    paths.push(rootPath);
    return paths;
  } catch {
    // 如果不是 monorepo 会执行失败，会返回当前工作目录
    return [rootPath];
  }
};
