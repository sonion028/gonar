import { type PropType, defineComponent } from 'vue';

import { usePermission, type AuthorityProps } from './composables';

export default defineComponent({
  name: 'so-authority',
  props: {
    /** 组件需要的权限 */
    requiredPermissions: {
      type: [String, Number, Array, Function] as PropType<
        AuthorityProps['requiredPermissions']
      >, // 如参数是组件时，调用参数传入用户权限，判断是否有权限
      required: true,
    },
    /** 用户具有的权限 */
    userPermissions: {
      type: [String, Number, Array] as PropType<
        AuthorityProps['userPermissions']
      >,
      required: true,
    },
  },
  setup(props, { slots }) {
    const [isPermission, permissionCheck] = usePermission(props);
    // 除了在setup函数返回函数，还能配置render项（函数），通过this拿变量
    return () => {
      return permissionCheck()
        ? slots.default?.({
            userPermissions: props.userPermissions,
            isPermission: isPermission.value,
          })
        : null;
    };
  },
});
