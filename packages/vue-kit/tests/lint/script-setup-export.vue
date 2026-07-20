<!--
  Probe for vue/no-export-in-script-setup
  This rule fires when there's an export statement inside <script setup>.
  We need a separate file because this file itself uses <script setup>.
-->

<script setup lang="ts">
export const foo = 'bar';
</script>

<template>
  <div>export probe</div>
</template>
