<!--
  Probe for vue/no-deprecated-destroyed-lifecycle.
  Requires: plain <script> with export default + defineComponent.
  NOTE: Cannot be in <script setup> block (export const triggers no-export-in-script-setup).
-->

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  destroyed() {},
  beforeDestroy() {},
});
</script>

<template>
  <div>deprecated-destroyed-lifecycle probe</div>
</template>
