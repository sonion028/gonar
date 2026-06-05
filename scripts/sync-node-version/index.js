/* global process */
import { syncNodeVersion } from './sync.js';
import { getPackagesArgValue, getProjectPaths } from './util.js';

// const projectPaths = getProjectPaths(
//   process.cwd(),
//   getPackagesArgValue(process.argv)
// );

// for (const projectPath of projectPaths) {
//   syncNodeVersion(projectPath);
// }
syncNodeVersion(process.cwd());
