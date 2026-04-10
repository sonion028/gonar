/* global process */
import fs from 'node:fs';
import path from 'node:path';

// 读取 package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 提取 node 版本
const nodeVersion = packageJson.engines?.node;

if (!nodeVersion) {
  console.error('Error: No node version found in package.json engines');
  process.exit(1);
}

// 提取所有版本号（支持 >=、^、~、= 等前缀，以及 || 分隔）
// "^18.18.0 || >=21.1.0 || ~20.9.0||=25.16.0||22.0.9"
const versionPattern = /[>=<~^]*([0-9]+\.[0-9]+\.[0-9]+)/g;
const versions = [];
let match;

while ((match = versionPattern.exec(nodeVersion)) !== null) {
  versions.push(match[1]);
}

if (!versions.length) {
  console.error('Error: Could not parse node version:', nodeVersion);
  process.exit(1);
}

// 比较版本号，返回最大的
const compareVersions = (a, b) => {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const len = Math.min(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    if (partsA[i] > partsB[i]) return 1;
    if (partsA[i] < partsB[i]) return -1;
  }
  return 0;
};

// 获取最大版本号
const validVersion = versions.reduce((max, v) =>
  compareVersions(v, max) > 0 ? v : max
);

// 写入 .node-version 文件
const nodeVersionPath = path.join(process.cwd(), '.node-version');
fs.writeFileSync(nodeVersionPath, validVersion, 'utf8');
console.log(`✓ Node version synced: ${validVersion}`);
