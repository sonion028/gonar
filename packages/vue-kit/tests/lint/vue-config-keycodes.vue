<!--
  Probe for vue/no-deprecated-vue-config-keycodes.
  Requires: Vue.config.keyCodes assignment in <script>.
-->

<script>
import Vue from 'vue';

Vue.config.keyCodes = { f1: 112 };
</script>

<template>
  <div>deprecated-vue-config-keycodes probe</div>
</template>
