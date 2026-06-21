<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
/**
 * @author sonion
 * @description 点击事件处理函数
 * @param {number} a - 一个数字
 */
const handleClick = (a: number) => {
  console.log(a);
  count.value++;
  return count.value;
};

console.log('SoTest', handleClick);
</script>
<template>
  <div>
    <h1>Hello Vue 3!</h1>
    <p>count: {{ count }}</p>
  </div>
</template>
