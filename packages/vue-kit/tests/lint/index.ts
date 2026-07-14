/*
 * correctness lint probes: generated intentionally with lint violations.
 * 每个函数对应一条规则。
 */

import { defineComponent, nextTick, onMounted, watch, defineExpose, defineEmits, defineOptions, defineProps } from 'vue';
import { ref } from '@vue/reactivity';
declare const Vue: any;

/**
 * 规则错误：vue/no-arrow-functions-in-watch
 */
export function lint_probe_vue_no_arrow_functions_in_watch() {
  defineComponent({ watch: { value: () => undefined } });
}

/**
 * 规则错误：vue/no-async-in-computed-properties
 */
export function lint_probe_vue_no_async_in_computed_properties() {
  defineComponent({ computed: { async value() { return 1; } } });
}

/**
 * 规则错误：vue/no-computed-properties-in-data
 */
export function lint_probe_vue_no_computed_properties_in_data() {
  defineComponent({ computed: { value() { return 1; } }, data() { return { copy: this.value }; } });
}

/**
 * 规则错误：vue/no-deprecated-data-object-declaration
 */
export function lint_probe_vue_no_deprecated_data_object_declaration() {
  defineComponent({ data: { value: 1 } });
}

/**
 * 规则错误：vue/no-deprecated-delete-set
 */
export function lint_probe_vue_no_deprecated_delete_set() {
  Vue.delete({}, 'value');
}

/**
 * 规则错误：vue/no-deprecated-destroyed-lifecycle
 */
export function lint_probe_vue_no_deprecated_destroyed_lifecycle() {
  defineComponent({ destroyed() {} });
}

/**
 * 规则错误：vue/no-deprecated-events-api
 */
export function lint_probe_vue_no_deprecated_events_api() {
  defineComponent({ mounted() { this.$on('event', () => undefined); } });
}

/**
 * 规则错误：vue/no-deprecated-model-definition
 */
export function lint_probe_vue_no_deprecated_model_definition() {
  defineComponent({ model: { prop: 'value', event: 'input' } });
}

/**
 * 规则错误：vue/no-deprecated-props-default-this
 */
export function lint_probe_vue_no_deprecated_props_default_this() {
  defineComponent({ props: { value: { default() { return this.other; } } } });
}

/**
 * 规则错误：vue/no-deprecated-vue-config-keycodes
 */
export function lint_probe_vue_no_deprecated_vue_config_keycodes() {
  Vue.config.keyCodes = { f1: 112 };
}

/**
 * 规则错误：vue/no-dupe-keys
 */
export function lint_probe_vue_no_dupe_keys() {
  defineComponent({ data() { return { value: 1 }; }, methods: { value() { return 2; } } });
}

/**
 * 规则错误：vue/no-export-in-script-setup
 */
export function lint_probe_vue_no_export_in_script_setup() {
  const noExportInScriptSetupProbe = 1;
  void noExportInScriptSetupProbe;
}

/**
 * 规则错误：vue/no-expose-after-await
 */
export function lint_probe_vue_no_expose_after_await() {
  async function inner() { await Promise.resolve(); defineExpose({}); }
  void inner;
}

/**
 * 规则错误：vue/no-lifecycle-after-await
 */
export function lint_probe_vue_no_lifecycle_after_await() {
  async function inner() { await Promise.resolve(); onMounted(() => undefined); }
  void inner;
}

/**
 * 规则错误：vue/no-reserved-component-names
 */
export function lint_probe_vue_no_reserved_component_names() {
  defineComponent({ components: { slot: {} } });
}

/**
 * 规则错误：vue/no-reserved-keys
 */
export function lint_probe_vue_no_reserved_keys() {
  defineComponent({ data() { return { $el: 1 }; } });
}

/**
 * 规则错误：vue/no-reserved-props
 */
export function lint_probe_vue_no_reserved_props() {
  defineComponent({ props: { key: String } });
}

/**
 * 规则错误：vue/no-shared-component-data
 */
export function lint_probe_vue_no_shared_component_data() {
  defineComponent({ data: { value: 1 } });
}

/**
 * 规则错误：vue/no-side-effects-in-computed-properties
 */
export function lint_probe_vue_no_side_effects_in_computed_properties() {
  defineComponent({ data() { return { value: 1 }; }, computed: { doubled() { this.value++; return this.value; } } });
}

/**
 * 规则错误：vue/no-this-in-before-route-enter
 */
export function lint_probe_vue_no_this_in_before_route_enter() {
  defineComponent({ beforeRouteEnter() { return this.value; } });
}

/**
 * 规则错误：vue/no-watch-after-await
 */
export function lint_probe_vue_no_watch_after_await() {
  async function inner() { await Promise.resolve(); watch(ref(1), () => undefined); }
  void inner;
}

/**
 * 规则错误：vue/prefer-import-from-vue
 */
export function lint_probe_vue_prefer_import_from_vue() {
  void ref(1);
}

/**
 * 规则错误：vue/require-prop-type-constructor
 */
export function lint_probe_vue_require_prop_type_constructor() {
  defineComponent({ props: { value: 'String' } });
}

/**
 * 规则错误：vue/require-render-return
 */
export function lint_probe_vue_require_render_return() {
  defineComponent({ render() { const value = 1; void value; } });
}

/**
 * 规则错误：vue/require-slots-as-functions
 */
export function lint_probe_vue_require_slots_as_functions() {
  defineComponent({ mounted() { return this.$slots.default; } });
}

/**
 * 规则错误：vue/return-in-computed-property
 */
export function lint_probe_vue_return_in_computed_property() {
  defineComponent({ computed: { value() { const local = 1; void local; } } });
}

/**
 * 规则错误：vue/return-in-emits-validator
 */
export function lint_probe_vue_return_in_emits_validator() {
  defineComponent({ emits: { change(value) { void value; } } });
}

/**
 * 规则错误：vue/valid-define-emits
 */
export function lint_probe_vue_valid_define_emits() {
  defineEmits('change');
}

/**
 * 规则错误：vue/valid-define-options
 */
export function lint_probe_vue_valid_define_options() {
  defineOptions({ props: { value: String } });
}

/**
 * 规则错误：vue/valid-define-props
 */
export function lint_probe_vue_valid_define_props() {
  defineProps('value');
}

/**
 * 规则错误：vue/valid-next-tick
 */
export function lint_probe_vue_valid_next_tick() {
  nextTick('not-a-function');
}

