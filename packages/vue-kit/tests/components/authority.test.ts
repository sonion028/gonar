import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { reactive } from 'vue';

import SoAuthority from '../../src/components/so-authority';
import {
  usePermission,
  type AuthorityProps,
} from '../../src/components/so-authority/composables';

describe('usePermission', () => {
  it('matches scalar and array permissions', () => {
    expect(
      usePermission({
        userPermissions: 'admin',
        requiredPermissions: 'admin',
      })[0].value
    ).toBe(true);
    expect(
      usePermission({
        userPermissions: 'user',
        requiredPermissions: 'admin',
      })[0].value
    ).toBe(false);
    expect(
      usePermission({
        userPermissions: ['read', 'write'],
        requiredPermissions: 'read',
      })[0].value
    ).toBe(true);
    expect(
      usePermission({
        userPermissions: ['read'],
        requiredPermissions: ['read', 'write'],
      })[0].value
    ).toBe(false);
  });

  it('supports function permissions and reacts to prop changes', () => {
    const props = reactive({
      userPermissions: ['read'] as string[],
      requiredPermissions: (permissions: AuthorityProps['userPermissions']) =>
        Array.isArray(permissions) && permissions.includes('write'),
    });
    const [isPermission] = usePermission(props);

    expect(isPermission.value).toBe(false);
    props.userPermissions = ['read', 'write'];
    expect(isPermission.value).toBe(true);
  });

  it('compares empty required permission arrays as no permission required', () => {
    expect(
      usePermission({ userPermissions: [], requiredPermissions: ['read'] })[0]
        .value
    ).toBe(false);
    expect(
      usePermission({ userPermissions: ['read'], requiredPermissions: [] })[0]
        .value
    ).toBe(true);
    expect(
      usePermission({ userPermissions: [], requiredPermissions: [] })[0].value
    ).toBe(true);
  });

  it('[defect-probing] treats numeric zero as a valid permission value', () => {
    expect(
      usePermission({ userPermissions: 0, requiredPermissions: 0 })[0].value
    ).toBe(true);
  });

  it('returns false for uninitialized permissions', () => {
    expect(
      usePermission({
        userPermissions: null as unknown as AuthorityProps['userPermissions'],
        requiredPermissions: 'read',
      })[0].value
    ).toBe(false);
    expect(
      usePermission({
        userPermissions: ['read'],
        requiredPermissions:
          undefined as unknown as AuthorityProps['requiredPermissions'],
      })[0].value
    ).toBe(false);
  });

  it('throws for unsupported non-empty permission values', () => {
    expect(
      () =>
        usePermission({
          userPermissions: NaN,
          requiredPermissions: 'read',
        })[0].value
    ).toThrow(TypeError);
  });
});

describe('SoAuthority', () => {
  it('renders slot content when permission passes', () => {
    const wrapper = mount(SoAuthority, {
      props: {
        userPermissions: ['read', 'write'],
        requiredPermissions: ['read'],
      },
      slots: {
        default: '<span data-test="allowed">Allowed</span>',
      },
    });

    expect(wrapper.find('[data-test="allowed"]').exists()).toBe(true);
  });

  it('does not render slot content when permission fails', () => {
    const wrapper = mount(SoAuthority, {
      props: {
        userPermissions: ['read'],
        requiredPermissions: ['write'],
      },
      slots: {
        default: '<span data-test="allowed">Allowed</span>',
      },
    });

    expect(wrapper.find('[data-test="allowed"]').exists()).toBe(false);
  });

  it('passes permission state and user permissions to the default slot', () => {
    const slot = vi.fn(
      ({ isPermission, userPermissions }) =>
        `${isPermission}:${(userPermissions as string[]).join(',')}`
    );

    mount(SoAuthority, {
      props: {
        userPermissions: ['read'],
        requiredPermissions: 'read',
      },
      slots: {
        default: slot,
      },
    });

    expect(slot).toHaveBeenCalledWith(
      expect.objectContaining({
        isPermission: true,
        userPermissions: ['read'],
      })
    );
  });
});
