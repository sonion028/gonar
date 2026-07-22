/*
 * JS script lint probes: intentionally written without imports/exports so script-only ESLint rules can run.
 */

/**
 * 规则错误：eslint/getter-return
 */
function lint_probe_eslint_getter_return_js() {
  class Probe { get value() { const local = 1; void local; } }
  void Probe;
}

/**
 * 规则错误：eslint/no-dupe-class-members
 */
function lint_probe_eslint_no_dupe_class_members_js() {
  class Probe {
    value() { return 1; }
    value() { return 2; }
  }
  void Probe;
}

/**
 * 规则错误：eslint/no-nonoctal-decimal-escape
 */
function lint_probe_eslint_no_nonoctal_decimal_escape_js() {
  const probe = "\8";
  void probe;
}

/**
 * 规则错误：eslint/no-with
 */
function lint_probe_eslint_no_with_js() {
  const probe = { value: 1 };
  with (probe) { value; }
}
