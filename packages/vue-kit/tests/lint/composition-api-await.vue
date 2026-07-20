<!--
  correctness lint probes for vue rules that need async setup() composition API.
-->

<script>
import { defineComponent, onMounted, watch, nextTick, ref } from 'vue';

/**
 * 规则错误：vue/no-expose-after-await
 * expose called after await in setup.
 */
export const ExposeAfterAwaitProbe = defineComponent({
  async setup(_, { expose }) {
    await Promise.resolve();
    expose({});
  },
});

/**
 * 规则错误：vue/no-lifecycle-after-await
 * Lifecycle hook called after await in setup.
 */
export const LifecycleAfterAwaitProbe = defineComponent({
  async setup() {
    await Promise.resolve();
    onMounted(() => {});
  },
});

/**
 * 规则错误：vue/no-watch-after-await
 * watch called after await in setup.
 */
export const WatchAfterAwaitProbe = defineComponent({
  async setup() {
    await Promise.resolve();
    watch(ref(1), () => {});
  },
});

/**
 * 规则错误：vue/valid-next-tick
 * nextTick called without await in async context.
 */
export const ValidNextTickProbe = defineComponent({
  async mounted() {
    nextTick(); // must be awaited
  },
});
</script>

<template>
  <div>composition api await probes</div>
</template>
