<!--
  Probe for vue/no-this-in-before-route-enter.
  Requires plain export default with this.xxx() method call.
-->

<script>
export default {
  beforeRouteEnter() {
    this.greeting();
  },
};
</script>

<template>
  <div>this-in-route-enter probe</div>
</template>
