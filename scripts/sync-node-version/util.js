import fs from 'node:fs';
import path from 'node:path';

const IGNORED_DIRECTORY_NAMES = new Set(['node_modules']);

/**
 * @author sonion
 * @description 将路径转换为 POSIX 路径
 * @param {string} targetPath 要转换的路径
 */
const toPosixPath = (targetPath) => targetPath.split(path.sep).join('/');

/**
 * @author sonion
 * @description 检查模式是否包含glob 特殊字符
 * @param {string} pattern 要检查的模式
 */
const hasMagicPattern = (pattern) => /[*{}]/.test(pattern);

/**
 * @author sonion
 * @description 展开glob 模式中的花括号
 * @param {string} pattern 要展开的模式
 */
const expandBracePattern = (pattern) => {
  const braceMatch = pattern.match(/^(.*)\{([^{}]+)\}(.*)$/);

  if (!braceMatch) {
    return [pattern];
  }

  const [, prefix, content, suffix] = braceMatch;

  return content
    .split(',')
    .flatMap((item) => expandBracePattern(`${prefix}${item}${suffix}`));
};

/**
 * @author sonion
 * @description 读取父级目录下的直接子目录路径
 * @param {string} parentPath 父级目录路径
 */
export const getDirectChildDirectoryPaths = (parentPath) => {
  if (!fs.existsSync(parentPath)) {
    return [];
  }

  return fs
    .readdirSync(parentPath, { withFileTypes: true })
    .filter(
      (directoryName) =>
        directoryName.isDirectory() &&
        !IGNORED_DIRECTORY_NAMES.has(directoryName.name)
    )
    .map((directoryName) => path.join(parentPath, directoryName.name))
    .sort();
};

/**
 * @author sonion
 * @description 检查目录下是否存在 package.json
 * @param {string} directoryPath 目录路径
 */
export const hasPackageJson = (directoryPath) =>
  fs.existsSync(path.join(directoryPath, 'package.json'));

/**
 * @author sonion
 * @description 检查路径片段是否匹配模式片段
 * @param {string} patternSegment 要检查的模式片段
 * @param {string} pathSegment 要检查的路径片段
 */
const matchSegment = (patternSegment, pathSegment) => {
  const pattern = [...patternSegment]
    .map((char) => {
      if (char === '*') {
        return '.*';
      }

      return char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
    })
    .join('');

  return new RegExp(`^${pattern}$`).test(pathSegment);
};

const normalizePackagePattern = (pattern) =>
  toPosixPath(pattern.trim()).replace(/^\.\//, '').replace(/\/$/, '');

/**
 * @author sonion
 * @description 补全包含 * 的子包路径
 * @param {string} rootPath 根目录路径
 * @param {string} packagePattern 子包路径模式
 */
export const expandStarPackagePaths = (rootPath, packagePattern) => {
  const segments = normalizePackagePattern(packagePattern)
    .split('/')
    .filter(Boolean);

  return segments
    .reduce(
      (currentPaths, segment) => {
        if (!hasMagicPattern(segment)) {
          return currentPaths.map((currentPath) =>
            path.join(currentPath, segment)
          );
        }

        return currentPaths.flatMap((currentPath) =>
          getDirectChildDirectoryPaths(currentPath).filter((childPath) =>
            matchSegment(segment, path.basename(childPath))
          )
        );
      },
      [rootPath]
    )
    .sort();
};

export const resolvePackagePaths = (rootPath, packagesPattern = '') => {
  const normalizedPatterns = expandBracePattern(packagesPattern)
    .map(normalizePackagePattern)
    .filter(Boolean);

  if (!normalizedPatterns.length) {
    return [];
  }

  return [
    ...new Set(
      normalizedPatterns.flatMap((packagePattern) =>
        expandStarPackagePaths(rootPath, packagePattern)
      )
    ),
  ]
    .filter(hasPackageJson)
    .sort();
};

export const getProjectPaths = (rootPath, packagesPattern) => [
  ...new Set([rootPath, ...resolvePackagePaths(rootPath, packagesPattern)]),
];

/**
 * @author sonion
 * @description 从命令行参数中提取 packages 选项的值
 * @param {string[]} argv 命令行参数数组
 */
export const getPackagesArgValue = (argv) => {
  const packagesArgIndex = argv.findIndex((arg) =>
    arg.startsWith('--packages=')
  );

  if (packagesArgIndex === -1) {
    return;
  }

  const packagesArg = argv[packagesArgIndex];

  if (!packagesArg.startsWith('--packages=')) {
    return;
  }

  return packagesArg.slice('--packages='.length);
};
