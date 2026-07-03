import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SoTest from '../../src/components/so-test/so-test.vue';

describe('SoTest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders default text and initial count', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const wrapper = mount(SoTest);

    expect(wrapper.text()).toContain('Hello Vue 3!');
    expect(wrapper.text()).toContain('count: 0');
  });
});
