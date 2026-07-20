<!--
  Probe for vue/require-slots-as-functions.
  Requires plain export default with render function accessing $slots as object.
-->

<script>
export default {
  render(h) {
    const children = this.$slots.default.filter(() => true);
    return h('div', children);
  },
};
</script>

<template>
  <div>require-slots-as-functions probe</div>
</template>
