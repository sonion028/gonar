# @tonar/vue-kit

`@tonar/vue-kit` 是 Tonar 的 Vue 3 组件包，当前提供权限渲染组件能力。

`@tonar/vue-kit` is Tonar's Vue 3 component package, currently focused on permission-based rendering.

- ✅ 支持 Vue 3+
- ✅ TypeScript 类型支持
- ✅ 仅支持 ESM（不支持 CommonJS）
- ✅ 支持 Tree-shaking

## 📦 Installation / 安装

```bash
npm install @tonar/vue-kit@latest
pnpm add @tonar/vue-kit
yarn add @tonar/vue-kit
```

## 🚀 Usage / 使用方法

```vue
<script setup lang="ts">
import { SoAuthority } from '@tonar/vue-kit';

const userPermissions = ['dashboard:view', 'dashboard:edit'];
</script>

<template>
  <SoAuthority
    :user-permissions="userPermissions"
    required-permissions="dashboard:view"
  >
    <button>Search</button>
  </SoAuthority>
</template>
```

## 🧩 Components / 组件

- `SoAuthority`：权限渲染组件，根据用户权限和组件所需权限决定是否渲染默认插槽
- `SoAuthority` 支持字符串、数字、字符串数组、数字数组作为权限值
- `SoAuthority` 也支持通过函数自定义权限判断逻辑

## 📖 Custom permission check / 自定义权限判断

```vue
<script setup lang="ts">
import { SoAuthority } from '@tonar/vue-kit';

const userPermissions = ['admin'];
const requiredPermissions = (
  permissions: string | number | string[] | number[]
) => Array.isArray(permissions) && permissions.includes('admin');
</script>

<template>
  <SoAuthority
    :user-permissions="userPermissions"
    :required-permissions="requiredPermissions"
  >
    <span>Only admins can see this.</span>
  </SoAuthority>
</template>
```

## 📝 License / 许可证

MIT © Sonion

欢迎 [Pull Requests](https://github.com/sonion028/gonar/pulls) 和 [Issues](https://github.com/sonion028/gonar/issues)  
源码仓库：[https://github.com/sonion028/gonar](https://github.com/sonion028/gonar)
