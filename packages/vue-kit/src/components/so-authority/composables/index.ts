import { computed } from 'vue';
import { isNil } from '@tonar/utils';

type PermissionValue = string | number | bigint;
type PermissionType = PermissionValue | PermissionValue[];

/**
 * @author sonion
 * @description 检查是否为合法权限值
 * @param val - 待检查的值
 */
const isPermissionValue = (val: unknown): val is PermissionValue =>
  typeof val === 'string' ||
  typeof val === 'bigint' ||
  (typeof val === 'number' && Number.isFinite(val));

/**
 * @author sonion
 * @description 权限类型检查
 * @param {unknown} val - 权限
 * @returns {boolean} - 类型是否有错误
 */
const isPermissionType = (val: unknown): val is PermissionType =>
  isPermissionValue(val) ||
  (Array.isArray(val) && val.every(isPermissionValue));

// 类型守卫
const isArray = (val: PermissionType): val is PermissionValue[] =>
  Array.isArray(val);

/**
 * @author sonion
 * @description 验证是否具有权限
 * @param {PermissionType} userPermissions - 用户具有的权限 不怎么改变
 * @param {PermissionType} requiredPermissions - 组件所需权限 常改变，每个组件需要的权限不一样
 * @returns {boolean} - 是否具有权限
 */
const permissionVerify = (
  userPermissions: PermissionType,
  requiredPermissions: PermissionType
) => {
  if (!isPermissionType(requiredPermissions))
    throw new TypeError(
      `组件所需权限类型错误: 应该为 String、Number、BigInt 或 String[]、Number[]、BigInt[]`
    );
  if (!isPermissionType(userPermissions))
    throw new TypeError(
      `用户权限类型错误: 应该为 String、Number、BigInt 或 String[]、Number[]、BigInt[]`
    );

  const isRequiredArray = isArray(requiredPermissions);
  const isUserArray = isArray(userPermissions);

  if (isRequiredArray && !isUserArray) {
    // 需要权限是数组，用户权限不是数组，就不可能有权限了
    return false;
  }
  if (!isRequiredArray && isUserArray) {
    return userPermissions.includes(requiredPermissions);
  }
  if (isRequiredArray && isUserArray) {
    // 都是数组了
    return requiredPermissions.every((item) => userPermissions.includes(item));
  }
  return Object.is(userPermissions, requiredPermissions);
};

export type AuthorityProps = {
  requiredPermissions:
    | PermissionType
    | ((userPermissions: PermissionType) => boolean);
  userPermissions: PermissionType;
};
/**
 * @author sonion
 * @description 验证是否有具有权限
 * @param {object} props - 组件props
 * @param {PermissionType} props.requiredPermissions - 组件所需权限 常改变，每个组件需要的权限不一样
 * @param {PermissionType} props.userPermissions - 用户具有的权限 不怎么改变
 * @returns {boolean} - 是否具有权限
 */
export const usePermission = (props: AuthorityProps) => {
  const isPermission = computed(() => {
    if (typeof props.requiredPermissions === 'function') {
      return props.requiredPermissions(props.userPermissions);
    }

    if (isNil(props.requiredPermissions) || isNil(props.userPermissions))
      return false;

    return permissionVerify(props.userPermissions, props.requiredPermissions);
  }); // 是否有权限

  return [isPermission] as const;
};
