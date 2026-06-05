import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  expandStarPackagePaths,
  getDirectChildDirectoryPaths,
  getProjectPaths,
  hasPackageJson,
  resolvePackagePaths,
} from '../../scripts/sync-node-version/util.js';

const tempDirectories: string[] = [];

const createTempWorkspace = () => {
  const workspacePath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'sync-node-version-')
  );
  tempDirectories.push(workspacePath);

  return workspacePath;
};

const writeJson = (filePath: string, value: unknown) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value), 'utf8');
};

afterEach(() => {
  for (const tempDirectory of tempDirectories.splice(0)) {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
});

describe('sync-node-version package path helpers', () => {
  it('getDirectChildDirectoryPaths should only return direct child directories', () => {
    const workspacePath = createTempWorkspace();
    const appsPath = path.join(workspacePath, 'apps');

    fs.mkdirSync(path.join(appsPath, 'vue/nested'), { recursive: true });
    fs.mkdirSync(path.join(appsPath, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(appsPath, 'README.md'), 'readme');

    expect(getDirectChildDirectoryPaths(appsPath)).toEqual([
      path.join(appsPath, 'docs'),
      path.join(appsPath, 'vue'),
    ]);
  });

  it('hasPackageJson should check whether package.json exists under a directory', () => {
    const workspacePath = createTempWorkspace();
    const packagePath = path.join(workspacePath, 'apps/vue');
    const nonPackagePath = path.join(workspacePath, 'apps/docs');

    writeJson(path.join(packagePath, 'package.json'), { name: '@gonar/vue' });
    fs.mkdirSync(nonPackagePath, { recursive: true });

    expect(hasPackageJson(packagePath)).toBe(true);
    expect(hasPackageJson(nonPackagePath)).toBe(false);
  });

  it('expandStarPackagePaths should expand star paths by reading each star level directly', () => {
    const workspacePath = createTempWorkspace();

    writeJson(
      path.join(workspacePath, 'apps/vue/examples/basic/package.json'),
      {
        name: '@gonar/vue-basic',
      }
    );
    writeJson(
      path.join(workspacePath, 'apps/react/examples/basic/package.json'),
      {
        name: '@gonar/react-basic',
      }
    );
    writeJson(
      path.join(workspacePath, 'apps/vue/examples/advanced/package.json'),
      {
        name: '@gonar/vue-advanced',
      }
    );
    writeJson(path.join(workspacePath, 'packages/core/package.json'), {
      name: '@gonar/core',
    });

    expect(expandStarPackagePaths(workspacePath, 'apps/*/examples/*')).toEqual([
      path.join(workspacePath, 'apps/react/examples/basic'),
      path.join(workspacePath, 'apps/vue/examples/advanced'),
      path.join(workspacePath, 'apps/vue/examples/basic'),
    ]);
  });

  it('getProjectPaths should only include current cwd when packages option is empty', () => {
    const workspacePath = createTempWorkspace();

    expect(getProjectPaths(workspacePath)).toEqual([workspacePath]);
  });

  it('getProjectPaths should include current cwd before package paths when packages option is provided', () => {
    const workspacePath = createTempWorkspace();

    writeJson(path.join(workspacePath, 'package.json'), { private: true });
    writeJson(path.join(workspacePath, 'apps/vue/package.json'), {
      name: '@gonar/vue',
    });

    expect(getProjectPaths(workspacePath, 'apps/vue')).toEqual([
      workspacePath,
      path.join(workspacePath, 'apps/vue'),
    ]);
  });

  it('resolvePackagePaths should support exact relative package paths', () => {
    const workspacePath = createTempWorkspace();

    writeJson(path.join(workspacePath, 'apps/vue/package.json'), {
      name: '@gonar/vue',
    });
    writeJson(path.join(workspacePath, 'apps/docs/package.json'), {
      name: '@gonar/docs',
    });

    expect(resolvePackagePaths(workspacePath, 'apps/vue')).toEqual([
      path.join(workspacePath, 'apps/vue'),
    ]);
  });

  it('resolvePackagePaths should support star glob package paths', () => {
    const workspacePath = createTempWorkspace();

    writeJson(path.join(workspacePath, 'apps/vue/package.json'), {
      name: '@gonar/vue',
    });
    writeJson(path.join(workspacePath, 'apps/docs/package.json'), {
      name: '@gonar/docs',
    });
    writeJson(path.join(workspacePath, 'packages/react/package.json'), {
      name: '@gonar/react',
    });

    expect(resolvePackagePaths(workspacePath, 'apps/*')).toEqual([
      path.join(workspacePath, 'apps/docs'),
      path.join(workspacePath, 'apps/vue'),
    ]);
  });

  it('resolvePackagePaths should support brace glob package paths', () => {
    const workspacePath = createTempWorkspace();

    writeJson(path.join(workspacePath, 'apps/vue/package.json'), {
      name: '@gonar/vue',
    });
    writeJson(path.join(workspacePath, 'packages/react/package.json'), {
      name: '@gonar/react',
    });
    writeJson(path.join(workspacePath, 'examples/demo/package.json'), {
      name: '@gonar/demo',
    });

    expect(resolvePackagePaths(workspacePath, '{apps,packages}/*')).toEqual([
      path.join(workspacePath, 'apps/vue'),
      path.join(workspacePath, 'packages/react'),
    ]);
  });

  it('resolvePackagePaths should remove expanded paths without package.json', () => {
    const workspacePath = createTempWorkspace();

    writeJson(path.join(workspacePath, 'apps/vue/package.json'), {
      name: '@gonar/vue',
    });
    fs.mkdirSync(path.join(workspacePath, 'apps/docs'), { recursive: true });

    expect(resolvePackagePaths(workspacePath, 'apps/*')).toEqual([
      path.join(workspacePath, 'apps/vue'),
    ]);
  });
});
