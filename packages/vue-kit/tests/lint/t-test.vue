<!--
  Legacy vue correctness lint probes (merged Options API + <script setup>).
  For comprehensive rule coverage, probes are now split into separate .vue files:
  - options-api-probes.vue (Options API with defineComponent)
  - script-setup-probes.vue (<script setup> probes)
  - composition-api-await.vue (async setup probes)
  - destroyed-lifecycle.vue (no-deprecated-destroyed-lifecycle)
  - vue-config-keycodes.vue (no-deprecated-vue-config-keycodes)
  - reserved-component-names.vue (no-reserved-component-names)
  - prefer-import-from-vue.vue (prefer-import-from-vue)
  - this-in-route-enter.vue (no-this-in-before-route-enter)
  - slots-as-functions.vue (require-slots-as-functions)
  - script-setup-export.vue (no-export-in-script-setup)
-->

<script>
import { defineComponent } from 'vue';

/**
 * 规则错误：vue/no-deprecated-data-object-declaration
 */
export const DeprecatedDataObjectProbe = defineComponent({
  data: { value: 1 },
});

/**
 * 规则错误：vue/no-deprecated-delete-set
 */
export const DeprecatedDeleteSetProbe = defineComponent({
  mounted() {
    const obj = {};
    this.$set(obj, 'key', 'value');
    this.$delete(obj, 'key');
  },
});

/**
 * 规则错误：vue/no-deprecated-model-definition
 */
export const DeprecatedModelProbe = defineComponent({
  model: { prop: 'value', event: 'input' },
});

/**
 * 规则错误：vue/no-deprecated-props-default-this
 */
export const DeprecatedPropsDefaultThisProbe = defineComponent({
  props: {
    a: String,
    b: {
      default() {
        return this.a;
      },
    },
  },
});

/**
 * 规则错误：vue/no-deprecated-events-api
 */
export const DeprecatedEventsApiProbe = defineComponent({
  mounted() {
    this.$on('event', () => {});
    this.$off('event');
    this.$once('event', () => {});
  },
});

/**
 * 规则错误：vue/no-reserved-keys
 */
export const ReservedKeysProbe = defineComponent({
  props: ['$data'],
});

/**
 * 规则错误：vue/no-reserved-props
 */
export const ReservedPropsProbe = defineComponent({
  props: { ref: String, key: String, is: String },
});

/**
 * 规则错误：vue/require-prop-type-constructor
 */
export const RequirePropTypesConstructorProbe = defineComponent({
  props: { myProp: 'Number', anotherType: ['Number', 'String'] },
});

/**
 * 规则错误：vue/return-in-emits-validator
 */
export const ReturnInEmitsValidatorProbe = defineComponent({
  emits: {
    foo() {
      /* missing return */
    },
  },
});

/**
 * 规则错误：vue/no-side-effects-in-computed-properties
 */
export const SideEffectsInComputedProbe = defineComponent({
  data() {
    return { value: 1 };
  },
  computed: {
    doubled() {
      this.value++;
      return this.value;
    },
  },
});

/**
 * 规则错误：vue/no-shared-component-data
 */
export const SharedComponentDataProbe = defineComponent({
  data: { value: 1 },
});

/**
 * 规则错误：vue/no-dupe-keys
 */
export const DupeKeysProbe = defineComponent({
  data() {
    return { value: 1 };
  },
  methods: {
    value() {
      return 2;
    },
  },
});

/**
 * 规则错误：vue/no-computed-properties-in-data
 */
export const ComputedInDataProbe = defineComponent({
  computed: {
    value() {
      return 1;
    },
  },
  data() {
    return { copy: this.value };
  },
});

/**
 * 规则错误：vue/require-render-return
 */
export const RequireRenderReturnProbe = defineComponent({
  render() {
    const value = 1;
    void value;
  },
});

/**
 * 规则错误：vue/return-in-computed-property
 */
export const ReturnInComputedProbe = defineComponent({
  computed: {
    value() {
      const local = 1;
      void local;
    },
  },
});
</script>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * 规则错误：vue/no-async-in-computed-properties
 */
const _probeNoAsyncComputed = computed(async () => 1);

/**
 * 规则错误：vue/valid-define-props
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _probeValidDefineProps = defineProps('value');

/**
 * 规则错误：vue/valid-define-emits
 */
defineEmits('change');

/**
 * 规则错误：vue/valid-define-options
 */
const def = { name: 'Foo' };
defineOptions(def);
defineOptions();
</script>

<template>
  <div>legacy merged probes</div>
</template>
