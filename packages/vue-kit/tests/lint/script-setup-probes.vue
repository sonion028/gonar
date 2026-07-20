<!--
  <script setup> probes for vue correctness rules.
  Uses <script setup lang="ts"> syntax.
-->

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from 'vue';

/**
 * 规则错误：vue/no-async-in-computed-properties
 * Async function in computed getter.
 */
const _probeNoAsyncComputed = computed(async () => 1);

/**
 * 规则错误：vue/valid-define-props
 * defineProps called with string instead of object.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _probeValidDefineProps = defineProps('value');

/**
 * 规则错误：vue/valid-define-emits
 * defineEmits called with string instead of object.
 */
defineEmits('change');

/**
 * 规则错误：vue/valid-define-options
 * defineOptions called with variable or no arguments.
 */
const def = { name: 'Foo' };
defineOptions(def);
defineOptions();
</script>

<template>
  <div>script setup probes</div>
</template>
