<!--
  Probe for vue/no-reserved-component-names.
  Requires: plain export default with name property in <script> block.
-->

<script>
export default {
  name: 'div',
};
</script>

<template>
  <div>reserved-component-names probe</div>
</template>
