<!--
  Probe for vue/prefer-import-from-vue.
  Requires: importing from @vue/* instead of vue in <script setup>.
-->

<script setup lang="ts">
import { ref } from '@vue/reactivity';
</script>

<template>
  <div>prefer-import-from-vue probe</div>
</template>
