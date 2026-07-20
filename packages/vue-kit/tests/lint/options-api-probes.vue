<!--
  Options API probes for vue correctness rules.
  Uses plain <script> with export default.
  NOTE: Some rules require plain `export default { ... }` objects,
  not defineComponent(), because the Vue SFC parser needs to recognize
  the component definition directly.
-->

<script>
/**
 * 规则错误：vue/no-arrow-functions-in-watch
 * Arrow function in watch option.
 * NOTE: Must use plain export default, not defineComponent.
 */
export default {
  watch: {
    foo: () => {},
  },
};

/**
 * 规则错误：vue/no-reserved-component-names
 * Component name collides with HTML element.
 * NOTE: Must use plain export default with name property.
 */
export const ReservedComponentNameProbe = {
  name: 'div',
};
</script>

<!-- Second script block for additional probes that work with defineComponent -->
<script setup lang="ts">
import { defineComponent } from 'vue';

/**
 * 规则错误：vue/no-deprecated-data-object-declaration
 * data as object instead of function.
 */
export const DeprecatedDataObjectProbe = defineComponent({
  data: { value: 1 },
});

/**
 * 规则错误：vue/no-deprecated-delete-set
 * this.$set / this.$delete are deprecated.
 */
export const DeprecatedDeleteSetProbe = defineComponent({
  mounted() {
    const obj = {};
    this.$set(obj, 'key', 'value');
    this.$delete(obj, 'key');
  },
});

/**
 * 规则错误：vue/no-deprecated-destroyed-lifecycle
 * destroyed / beforeDestroy hooks removed in Vue 3.
 */
export const DeprecatedDestroyedProbe = defineComponent({
  destroyed() {},
  beforeDestroy() {},
});

/**
 * 规则错误：vue/no-deprecated-model-definition
 * model option deprecated.
 */
export const DeprecatedModelProbe = defineComponent({
  model: { prop: 'value', event: 'input' },
});

/**
 * 规则错误：vue/no-deprecated-props-default-this
 * this in props default factory.
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
 * $on / $off / $once deprecated.
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
 * Prop name conflicts with Vue instance properties.
 */
export const ReservedKeysProbe = defineComponent({
  props: ['$data'],
});

/**
 * 规则错误：vue/no-reserved-props
 * Prop name is a reserved attribute.
 */
export const ReservedPropsProbe = defineComponent({
  props: {
    ref: String,
    key: String,
    is: String,
  },
});

/**
 * 规则错误：vue/no-this-in-before-route-enter
 * this not available in beforeRouteEnter.
 * NOTE: This probe is in a separate file (this-in-route-enter.vue) because
 * it requires plain export default with this.xxx() method call.
 */

/**
 * 规则错误：vue/require-prop-type-constructor
 * Prop type as string instead of Constructor.
 */
export const RequirePropTypesConstructorProbe = defineComponent({
  props: {
    myProp: 'Number',
    anotherType: ['Number', 'String'],
  },
});

/**
 * 规则错误：vue/require-slots-as-functions
 * Accessing $slots as object instead of function.
 * NOTE: This probe is in a separate file (slots-as-functions.vue) because
 * it requires plain export default with render function.
 */

/**
 * 规则错误：vue/return-in-emits-validator
 * Emits validator missing return.
 */
export const ReturnInEmitsValidatorProbe = defineComponent({
  emits: {
    foo() {
      // missing return
    },
  },
});

/**
 * 规则错误：vue/no-side-effects-in-computed-properties
 * Computed property with side effects.
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
 * Shared data object across instances.
 */
export const SharedComponentDataProbe = defineComponent({
  data: { value: 1 },
});

/**
 * 规则错误：vue/no-dupe-keys
 * Duplicate key in data/methods.
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
 * Referencing computed in data().
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
 * render function missing return.
 */
export const RequireRenderReturnProbe = defineComponent({
  render() {
    const value = 1;
    void value;
  },
});

/**
 * 规则错误：vue/return-in-computed-property
 * Computed property missing return.
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

<template>
  <div>options API probes (partial)</div>
</template>
