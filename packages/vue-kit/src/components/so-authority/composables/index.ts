import { computed } from 'vue';

type PermissionType = string | number | string[] | number[];

/**
 * 检查是否为空数组
 * @param val - 待检查的值
 */
const isEmptyArray = (val: unknown) => Array.isArray(val) && !val.length;

/**
/**
 * @author sonion
 * @description 权限类型检查
 * @param {unknown} val - 权限
 * @returns {boolean} - 类型是否有错误
 */
const isPermissionType = (val: unknown): val is PermissionType =>
  typeof val === 'string' ||
  typeof val === 'number' ||
  (Array.isArray(val) && !!val?.length);

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
      `组件所需权限类型错误: 应该为 String、Number 或 String[]`
    );
  if (!isPermissionType(userPermissions))
    throw new TypeError(`用户权限类型错误: 应该为 String、Number 或 String[]`);

  const isRequiredArray = Array.isArray(requiredPermissions);
  const isUserArray = Array.isArray(userPermissions);
  if (isRequiredArray && !isUserArray) {
    // 需要权限是数组，用户权限不是数组，就不可能有权限了
    return false;
  }
  if (!isRequiredArray && isUserArray) {
    return (userPermissions as Array<string | number>).includes(
      requiredPermissions
    );
  }
  if (!isRequiredArray && !isUserArray) {
    return Object.is(userPermissions, requiredPermissions);
  }
  // 只能都是数组了
  return (requiredPermissions as Array<string | number>).every((item) =>
    (userPermissions as Array<string | number>).includes(item)
  );
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

    if (
      !props.requiredPermissions ||
      !props.userPermissions ||
      isEmptyArray(props.requiredPermissions) ||
      isEmptyArray(props.userPermissions)
    )
      return false;

    return permissionVerify(props.userPermissions, props.requiredPermissions);
  }); // 是否有权限

  return [isPermission] as const;
};
