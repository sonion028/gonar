/**
 * 规则错误：typescript/triple-slash-reference
 */
/// <reference path="./missing.d.ts" />
export function lint_probe_typescript_triple_slash_reference() {
  void 'triple-slash reference must stay before the first statement';
}

/*
 * correctness lint probes: generated intentionally with lint violations.
 * 每个函数对应一条规则。
 */

import MissingDefaultProbe from '../../src/index';
import * as MissingNamespaceProbe from '../../src/index';
declare const value: any;
declare function callback(value: unknown): void;

/**
 * 规则错误：eslint/constructor-super
 */
export function lint_probe_eslint_constructor_super() {
  class Base {}
  class Probe extends Base {
    constructor() {}
  }
  void Probe;
}

/**
 * 规则错误：eslint/for-direction
 */
export function lint_probe_eslint_for_direction() {
  for (let index = 0; index < 2; index--) {
    void index;
  }
}

/**
 * 规则错误：eslint/getter-return
 */
export function lint_probe_eslint_getter_return() {
  class Probe {
    get value() {
      const local = 1;
      void local;
    }
  }
  void Probe;
}

/**
 * 规则错误：eslint/no-async-promise-executor
 */
export function lint_probe_eslint_no_async_promise_executor() {
  new Promise(async (resolve) => {
    resolve(await Promise.resolve(1));
  });
}

/**
 * 规则错误：eslint/no-caller
 */
export function lint_probe_eslint_no_caller() {
  function inner() {
    return arguments.callee;
  }
  void inner;
}

/**
 * 规则错误：eslint/no-class-assign
 */
export function lint_probe_eslint_no_class_assign() {
  class Probe {}
  Probe = 1;
  void Probe;
}

/**
 * 规则错误：eslint/no-compare-neg-zero
 */
export function lint_probe_eslint_no_compare_neg_zero() {
  const probe = 1 === -0;
  void probe;
}

/**
 * 规则错误：eslint/no-cond-assign
 */
export function lint_probe_eslint_no_cond_assign() {
  let probe = 0;
  if ((probe = 1)) {
    void probe;
  }
}

/**
 * 规则错误：eslint/no-const-assign
 */
export function lint_probe_eslint_no_const_assign() {
  const probe = 1;
  probe = 2;
}

/**
 * 规则错误：eslint/no-constant-binary-expression
 */
export function lint_probe_eslint_no_constant_binary_expression() {
  const probe = {} || 'fallback';
  void probe;
}

/**
 * 规则错误：eslint/no-constant-condition
 */
export function lint_probe_eslint_no_constant_condition() {
  if (true) {
    void 1;
  }
}

/**
 * 规则错误：eslint/no-control-regex
 */
export function lint_probe_eslint_no_control_regex() {
  const probe = /\x1f/;
  void probe;
}

/**
 * 规则错误：eslint/no-debugger
 */
export function lint_probe_eslint_no_debugger() {
  debugger;
}

/**
 * 规则错误：eslint/no-delete-var
 */
export function lint_probe_eslint_no_delete_var() {
  void 'no-delete-var needs sloppy script syntax; module fixtures cannot contain delete identifier';
}

/**
 * 规则错误：eslint/no-dupe-class-members
 */
export function lint_probe_eslint_no_dupe_class_members() {
  void 'no-dupe-class-members becomes a parser duplicate-name error in this TS fixture';
}

/**
 * 规则错误：eslint/no-dupe-else-if
 */
export function lint_probe_eslint_no_dupe_else_if() {
  const value = Math.random();
  if (value > 0.5) {
    void 1;
  } else if (value > 0.5) {
    void 2;
  }
}

/**
 * 规则错误：eslint/no-dupe-keys
 */
export function lint_probe_eslint_no_dupe_keys() {
  const probe = { value: 1, value: 2 };
  void probe;
}

/**
 * 规则错误：eslint/no-duplicate-case
 */
export function lint_probe_eslint_no_duplicate_case() {
  switch (Math.random()) {
    case 1:
      break;
    case 1:
      break;
  }
}

/**
 * 规则错误：eslint/no-empty-character-class
 */
export function lint_probe_eslint_no_empty_character_class() {
  const probe = /^abc[]/;
  void probe;
}

/**
 * 规则错误：eslint/no-empty-pattern
 */
export function lint_probe_eslint_no_empty_pattern() {
  const {} = { value: 1 };
}

/**
 * 规则错误：eslint/no-empty-static-block
 */
export function lint_probe_eslint_no_empty_static_block() {
  class Probe {
    static {}
  }
  void Probe;
}

/**
 * 规则错误：eslint/no-eval
 */
export function lint_probe_eslint_no_eval() {
  eval('1 + 1');
}

/**
 * 规则错误：eslint/no-ex-assign
 */
export function lint_probe_eslint_no_ex_assign() {
  try {
    throw new Error('probe');
  } catch (error) {
    error = 1;
  }
}

/**
 * 规则错误：eslint/no-extra-boolean-cast
 */
export function lint_probe_eslint_no_extra_boolean_cast() {
  const probe = Boolean(Boolean(1));
  void probe;
}

/**
 * 规则错误：eslint/no-func-assign
 */
export function lint_probe_eslint_no_func_assign() {
  function probe() {}
  probe = 1;
}

/**
 * 规则错误：eslint/no-global-assign
 */
export function lint_probe_eslint_no_global_assign() {
  undefined = 1;
}

/**
 * 规则错误：eslint/no-import-assign
 */
export function lint_probe_eslint_no_import_assign() {
  MissingNamespaceProbe.debounce = 1;
}

/**
 * 规则错误：eslint/no-invalid-regexp
 */
export function lint_probe_eslint_no_invalid_regexp() {
  RegExp('[');
}

/**
 * 规则错误：eslint/no-irregular-whitespace
 */
export function lint_probe_eslint_no_irregular_whitespace() {
  const probe = 'normal';
  void probe;
  const anotherProbe = 1;
  void anotherProbe;
}

/**
 * 规则错误：eslint/no-iterator
 */
export function lint_probe_eslint_no_iterator() {
  const probe = {}.__iterator__;
  void probe;
}

/**
 * 规则错误：eslint/no-loss-of-precision
 */
export function lint_probe_eslint_no_loss_of_precision() {
  const probe = 9007199254740993;
  void probe;
}

/**
 * 规则错误：eslint/no-misleading-character-class
 */
export function lint_probe_eslint_no_misleading_character_class() {
  const probe = /[👶🏻]/u;
  void probe;
}

/**
 * 规则错误：eslint/no-new-native-nonconstructor
 */
export function lint_probe_eslint_no_new_native_nonconstructor() {
  const probe = new Symbol('probe');
  void probe;
}

/**
 * 规则错误：eslint/no-nonoctal-decimal-escape
 */
export function lint_probe_eslint_no_nonoctal_decimal_escape() {
  void 'no-nonoctal-decimal-escape is a parse error in TS module fixture';
}

/**
 * 规则错误：eslint/no-obj-calls
 */
export function lint_probe_eslint_no_obj_calls() {
  const probe = Math();
  void probe;
}

/**
 * 规则错误：eslint/no-self-assign
 */
export function lint_probe_eslint_no_self_assign() {
  let probe = 1;
  probe = probe;
}

/**
 * 规则错误：eslint/no-setter-return
 */
export function lint_probe_eslint_no_setter_return() {
  const probe = {
    set value(input) {
      return input;
    },
  };
  void probe;
}

/**
 * 规则错误：eslint/no-shadow-restricted-names
 */
export function lint_probe_eslint_no_shadow_restricted_names() {
  function probe(undefined) {
    return undefined;
  }
  void probe;
}

/**
 * 规则错误：eslint/no-sparse-arrays
 */
export function lint_probe_eslint_no_sparse_arrays() {
  const probe = [1, , 3];
  void probe;
}

/**
 * 规则错误：eslint/no-this-before-super
 */
export function lint_probe_eslint_no_this_before_super() {
  class Base {}
  class Probe extends Base {
    constructor() {
      this.value = 1;
      super();
    }
  }
  void Probe;
}

/**
 * 规则错误：eslint/no-unassigned-vars
 */
export function lint_probe_eslint_no_unassigned_vars() {
  let probe;
  probe + 1;
}

/**
 * 规则错误：eslint/no-unreachable
 */
export function lint_probe_eslint_no_unreachable() {
  return 1;
  void 2;
}

/**
 * 规则错误：eslint/no-unsafe-finally
 */
export function lint_probe_eslint_no_unsafe_finally() {
  try {
    return 1;
  } finally {
    return 2;
  }
}

/**
 * 规则错误：eslint/no-unsafe-negation
 */
export function lint_probe_eslint_no_unsafe_negation() {
  const probe = (!1) in {};
  void probe;
}

/**
 * 规则错误：eslint/no-unsafe-optional-chaining
 */
export function lint_probe_eslint_no_unsafe_optional_chaining() {
  const probe = ({}?.missing)();
  void probe;
}

/**
 * 规则错误：eslint/no-unused-expressions
 */
export function lint_probe_eslint_no_unused_expressions() {
  1 + 1;
}

/**
 * 规则错误：eslint/no-unused-labels
 */
export function lint_probe_eslint_no_unused_labels() {
  unusedLabel: while (false) {
    break;
  }
}

/**
 * 规则错误：eslint/no-unused-private-class-members
 */
export function lint_probe_eslint_no_unused_private_class_members() {
  class Probe {
    #value = 1;
  }
  void Probe;
}

/**
 * 规则错误：eslint/no-unused-vars
 */
export function lint_probe_eslint_no_unused_vars() {
  const probe = 1;
}

/**
 * 规则错误：eslint/no-useless-backreference
 */
export function lint_probe_eslint_no_useless_backreference() {
  const probe = /\1(a)/;
  void probe;
}

/**
 * 规则错误：eslint/no-useless-catch
 */
export function lint_probe_eslint_no_useless_catch() {
  try {
    throw new Error('probe');
  } catch (error) {
    throw error;
  }
}

/**
 * 规则错误：eslint/no-useless-escape
 */
export function lint_probe_eslint_no_useless_escape() {
  const probe = /\#/;
  void probe;
}

/**
 * 规则错误：eslint/no-useless-rename
 */
export function lint_probe_eslint_no_useless_rename() {
  const input = { value: 1 };
  const { value: value } = input;
  void value;
}

/**
 * 规则错误：eslint/no-with
 */
export function lint_probe_eslint_no_with() {
  void 'no-with requires sloppy script syntax; module fixtures cannot contain with statement';
}

/**
 * 规则错误：eslint/require-yield
 */
export function lint_probe_eslint_require_yield() {
  function* probe() {
    return 1;
  }
  void probe;
}

/**
 * 规则错误：eslint/use-isnan
 */
export function lint_probe_eslint_use_isnan() {
  const probe = Number.NaN === Number.NaN;
  void probe;
}

/**
 * 规则错误：eslint/valid-typeof
 */
export function lint_probe_eslint_valid_typeof() {
  const probe = typeof value === 'strnig';
  void probe;
}

/**
 * 规则错误：import/default
 */
export function lint_probe_import_default() {
  void MissingDefaultProbe;
}

/**
 * 规则错误：import/namespace
 */
export function lint_probe_import_namespace() {
  MissingNamespaceProbe.notExported();
}

/**
 * 规则错误：jsdoc/check-property-names
 */
export function lint_probe_jsdoc_check_property_names() {
  /**
   * @typedef {object} Probe
   * @property {string} foo
   * @property {string} foo
   */
  const probe = {};
  void probe;
}

/**
 * 规则错误：jsdoc/check-tag-names
 */
export function lint_probe_jsdoc_check_tag_names() {
  /**
   * @invalidTag probe
   */
  const probe = 1;
  void probe;
}

/**
 * 规则错误：jsdoc/implements-on-classes
 */
export function lint_probe_jsdoc_implements_on_classes() {
  /** @implements {MissingInterface} */
  function probe() {}
  void probe;
}

/**
 * 规则错误：jsdoc/no-defaults
 */
export function lint_probe_jsdoc_no_defaults() {
  /**
   * @param {string} [value=default] probe
   */
  function probe(value) {
    return value;
  }
  void probe;
}

/**
 * 规则错误：jsdoc/require-property
 */
export function lint_probe_jsdoc_require_property() {
  /**
   * @typedef {object} Probe
   */
  const probe = {};
  void probe;
}

/**
 * 规则错误：jsdoc/require-property-description
 */
export function lint_probe_jsdoc_require_property_description() {
  /**
   * @typedef {object} Probe
   * @property {string} value
   */
  const probe = {};
  void probe;
}

/**
 * 规则错误：jsdoc/require-property-name
 */
export function lint_probe_jsdoc_require_property_name() {
  /**
   * @typedef {object} Probe
   * @property {string}
   */
  const probe = {};
  void probe;
}

/**
 * 规则错误：jsdoc/require-property-type
 */
export function lint_probe_jsdoc_require_property_type() {
  /**
   * @typedef {object} Probe
   * @property value probe
   */
  const probe = {};
  void probe;
}

/**
 * 规则错误：jsdoc/require-yields
 */
export function lint_probe_jsdoc_require_yields() {
  /** probe generator */
  function* probe() {
    yield 1;
  }
  void probe;
}

/**
 * 规则错误：oxc/bad-array-method-on-arguments
 */
export function lint_probe_oxc_bad_array_method_on_arguments() {
  function probe() {
    return arguments.map((value) => value);
  }
  void probe;
}

/**
 * 规则错误：oxc/bad-char-at-comparison
 */
export function lint_probe_oxc_bad_char_at_comparison() {
  const probe = 'abc'.charAt(0) === 'ab';
  void probe;
}

/**
 * 规则错误：oxc/bad-comparison-sequence
 */
export function lint_probe_oxc_bad_comparison_sequence() {
  const probe = 1 < 2 < 3;
  void probe;
}

/**
 * 规则错误：oxc/bad-min-max-func
 */
export function lint_probe_oxc_bad_min_max_func() {
  const probe = Math.min(10, Math.max(20, value));
  void probe;
}

/**
 * 规则错误：oxc/bad-object-literal-comparison
 */
export function lint_probe_oxc_bad_object_literal_comparison() {
  const probe = value === {};
  void probe;
}

/**
 * 规则错误：oxc/bad-replace-all-arg
 */
export function lint_probe_oxc_bad_replace_all_arg() {
  const probe = 'aaa'.replaceAll(/a/, '$&');
  void probe;
}

/**
 * 规则错误：oxc/const-comparisons
 */
export function lint_probe_oxc_const_comparisons() {
  const probe = value < value;
  void probe;
}

/**
 * 规则错误：oxc/double-comparisons
 */
export function lint_probe_oxc_double_comparisons() {
  const x = 1;
  const y = 2;
  const probe = x === y || x < y;
  void probe;
}

/**
 * 规则错误：oxc/erasing-op
 */
export function lint_probe_oxc_erasing_op() {
  const probe = value * 0;
  void probe;
}

/**
 * 规则错误：oxc/missing-throw
 */
export function lint_probe_oxc_missing_throw() {
  new Error('missing throw');
}

/**
 * 规则错误：oxc/number-arg-out-of-range
 */
export function lint_probe_oxc_number_arg_out_of_range() {
  const probe = (10).toString(100);
  void probe;
}

/**
 * 规则错误：oxc/only-used-in-recursion
 */
export function lint_probe_oxc_only_used_in_recursion() {
  function probe(value) {
    return probe(value);
  }
  void probe;
}

/**
 * 规则错误：oxc/uninvoked-array-callback
 */
export function lint_probe_oxc_uninvoked_array_callback() {
  new Array(5).map((item) => item);
}

/**
 * 规则错误：promise/no-callback-in-promise
 */
export function lint_probe_promise_no_callback_in_promise() {
  Promise.resolve(1).then((value) => callback(value));
}

/**
 * 规则错误：promise/no-new-statics
 */
export function lint_probe_promise_no_new_statics() {
  const probe = new Promise.resolve(1);
  void probe;
}

/**
 * 规则错误：promise/valid-params
 */
export function lint_probe_promise_valid_params() {
  Promise.resolve(1, 2);
}

/**
 * 规则错误：typescript/await-thenable
 */
export function lint_probe_typescript_await_thenable() {
  async function inner() {
    await 1;
  }
  void inner;
}

/**
 * 规则错误：typescript/no-array-delete
 */
export function lint_probe_typescript_no_array_delete() {
  const probe = [1, 2];
  delete probe[0];
}

/**
 * 规则错误：typescript/no-base-to-string
 */
export function lint_probe_typescript_no_base_to_string() {
  const probe = String({ value: 1 });
  void probe;
}

/**
 * 规则错误：typescript/no-duplicate-enum-values
 */
export function lint_probe_typescript_no_duplicate_enum_values() {
  enum Probe {
    A = 'same',
    B = 'same',
  }
  void Probe;
}

/**
 * 规则错误：typescript/no-duplicate-type-constituents
 */
export function lint_probe_typescript_no_duplicate_type_constituents() {
  type Probe = string | string;
  void (0 as unknown as Probe);
}

/**
 * 规则错误：typescript/no-extra-non-null-assertion
 */
export function lint_probe_typescript_no_extra_non_null_assertion() {
  const probe = 'value'!!;
  void probe;
}

/**
 * 规则错误：typescript/no-floating-promises
 */
export function lint_probe_typescript_no_floating_promises() {
  Promise.resolve('floating');
}

/**
 * 规则错误：typescript/no-for-in-array
 */
export function lint_probe_typescript_no_for_in_array() {
  for (const key in [1, 2]) {
    void key;
  }
}

/**
 * 规则错误：typescript/no-implied-eval
 */
export function lint_probe_typescript_no_implied_eval() {
  setTimeout('alert(1)', 0);
}

/**
 * 规则错误：typescript/no-meaningless-void-operator
 */
export function lint_probe_typescript_no_meaningless_void_operator() {
  const probe = void console.log('probe');
  void probe;
}

/**
 * 规则错误：typescript/no-misused-new
 */
export function lint_probe_typescript_no_misused_new() {
  interface Probe {
    new (): Probe;
  }
  void (0 as unknown as Probe);
}

/**
 * 规则错误：typescript/no-misused-spread
 */
export function lint_probe_typescript_no_misused_spread() {
  const probe = [...42];
  void probe;
}

/**
 * 规则错误：typescript/no-non-null-asserted-optional-chain
 */
export function lint_probe_typescript_no_non_null_asserted_optional_chain() {
  const probe = ({} as { value?: string })?.value!;
  void probe;
}

/**
 * 规则错误：typescript/no-redundant-type-constituents
 */
export function lint_probe_typescript_no_redundant_type_constituents() {
  type Probe = string | any;
  void (0 as Probe);
}

/**
 * 规则错误：typescript/no-this-alias
 */
export function lint_probe_typescript_no_this_alias() {
  const self = this;
  void self;
}

/**
 * 规则错误：typescript/no-unnecessary-parameter-property-assignment
 */
export function lint_probe_typescript_no_unnecessary_parameter_property_assignment() {
  class Probe {
    constructor(public value: string) {
      this.value = value;
    }
  }
  void Probe;
}

/**
 * 规则错误：typescript/no-unsafe-declaration-merging
 */
export function lint_probe_typescript_no_unsafe_declaration_merging() {
  interface Probe {
    value: string;
  }
  class Probe {
    value = 'probe';
  }
  void Probe;
}

/**
 * 规则错误：typescript/no-unsafe-unary-minus
 */
export function lint_probe_typescript_no_unsafe_unary_minus() {
  const probe = -'1';
  void probe;
}

/**
 * 规则错误：typescript/no-useless-default-assignment
 */
export function lint_probe_typescript_no_useless_default_assignment() {
  const probe = [1, 2, 3].map((value = 0) => value + 1);
  void probe;
}

/**
 * 规则错误：typescript/no-useless-empty-export
 */
export function lint_probe_typescript_no_useless_empty_export() {
  void 'empty export below belongs to this probe';
}
export {};

/**
 * 规则错误：typescript/no-wrapper-object-types
 */
export function lint_probe_typescript_no_wrapper_object_types() {
  let probe: String = 'probe';
  void probe;
}

/**
 * 规则错误：typescript/prefer-as-const
 */
export function lint_probe_typescript_prefer_as_const() {
  const probe = { value: 'probe' as 'probe' };
  void probe;
}

/**
 * 规则错误：typescript/prefer-namespace-keyword
 */
export function lint_probe_typescript_prefer_namespace_keyword() {
  void 'module declaration below belongs to this probe';
}
declare module LintProbePreferNamespaceKeyword {}

/**
 * 规则错误：typescript/require-array-sort-compare
 */
export function lint_probe_typescript_require_array_sort_compare() {
  [3, 1, 2].sort();
}

/**
 * 规则错误：typescript/restrict-template-expressions
 */
export function lint_probe_typescript_restrict_template_expressions() {
  const probe = `${{ value: 1 }}`;
  void probe;
}

/**
 * 规则错误：typescript/unbound-method
 */
export function lint_probe_typescript_unbound_method() {
  class Probe {
    method() {
      return this;
    }
  }
  const { method } = new Probe();
  void method;
}

/**
 * 规则错误：unicorn/no-await-in-promise-methods
 */
export function lint_probe_unicorn_no_await_in_promise_methods() {
  async function inner() {
    Promise.all([await Promise.resolve(1)]);
  }
  void inner;
}

/**
 * 规则错误：unicorn/no-empty-file
 */
export function lint_probe_unicorn_no_empty_file() {
  void 'no-empty-file cannot be triggered in a multi-rule fixture';
}

/**
 * 规则错误：unicorn/no-invalid-fetch-options
 */
export function lint_probe_unicorn_no_invalid_fetch_options() {
  fetch('/probe', { method: 'GET', body: 'invalid' });
}

/**
 * 规则错误：unicorn/no-invalid-remove-event-listener
 */
export function lint_probe_unicorn_no_invalid_remove_event_listener() {
  const listener = () => undefined;
  window.addEventListener('click', listener);
  window.removeEventListener('click', () => undefined);
}

/**
 * 规则错误：unicorn/no-new-array
 */
export function lint_probe_unicorn_no_new_array() {
  const probe = new Array(3);
  void probe;
}

/**
 * 规则错误：unicorn/no-single-promise-in-promise-methods
 */
export function lint_probe_unicorn_no_single_promise_in_promise_methods() {
  Promise.all([Promise.resolve(1)]);
}

/**
 * 规则错误：unicorn/no-thenable
 */
export function lint_probe_unicorn_no_thenable() {
  const probe = {
    then() {
      return 1;
    },
  };
  void probe;
}

/**
 * 规则错误：unicorn/no-unnecessary-await
 */
export function lint_probe_unicorn_no_unnecessary_await() {
  async function inner() {
    return await 1;
  }
  void inner;
}

/**
 * 规则错误：unicorn/no-useless-fallback-in-spread
 */
export function lint_probe_unicorn_no_useless_fallback_in_spread() {
  const probe = { ...(value || {}) };
  void probe;
}

/**
 * 规则错误：unicorn/no-useless-length-check
 */
export function lint_probe_unicorn_no_useless_length_check() {
  const probe = [1, 2];
  if (probe.length > 0 && probe.some(Boolean)) {
    void probe;
  }
}

/**
 * 规则错误：unicorn/no-useless-spread
 */
export function lint_probe_unicorn_no_useless_spread() {
  const probe = [...[1, 2]];
  void probe;
}

/**
 * 规则错误：unicorn/prefer-set-size
 */
export function lint_probe_unicorn_prefer_set_size() {
  const probe = [...new Set([1, 2])].length;
  void probe;
}

/**
 * 规则错误：unicorn/prefer-string-starts-ends-with
 */
export function lint_probe_unicorn_prefer_string_starts_ends_with() {
  const probe = /^prefix/.test('prefix-value');
  void probe;
}
