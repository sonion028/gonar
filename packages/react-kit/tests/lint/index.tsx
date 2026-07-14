/*
 * correctness lint probes: generated intentionally with lint violations.
 * 每个函数对应一条规则。
 */

import React, { forwardRef, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';

/**
 * 规则错误：jsx_a11y/alt-text
 */
export function lint_probe_jsx_a11y_alt_text() {
  return <img />;
}

/**
 * 规则错误：jsx_a11y/anchor-has-content
 */
export function lint_probe_jsx_a11y_anchor_has_content() {
  return <a href="/probe" />;
}

/**
 * 规则错误：jsx_a11y/anchor-is-valid
 */
export function lint_probe_jsx_a11y_anchor_is_valid() {
  return <a href="#" />;
}

/**
 * 规则错误：jsx_a11y/aria-activedescendant-has-tabindex
 */
export function lint_probe_jsx_a11y_aria_activedescendant_has_tabindex() {
  return <div aria-activedescendant="x" />;
}

/**
 * 规则错误：jsx_a11y/aria-props
 */
export function lint_probe_jsx_a11y_aria_props() {
  return <div aria-badprop="x" />;
}

/**
 * 规则错误：jsx_a11y/aria-proptypes
 */
export function lint_probe_jsx_a11y_aria_proptypes() {
  return <div aria-hidden="maybe" />;
}

/**
 * 规则错误：jsx_a11y/aria-role
 */
export function lint_probe_jsx_a11y_aria_role() {
  return <div role="badrole" />;
}

/**
 * 规则错误：jsx_a11y/aria-unsupported-elements
 */
export function lint_probe_jsx_a11y_aria_unsupported_elements() {
  return <meta aria-hidden="true" />;
}

/**
 * 规则错误：jsx_a11y/autocomplete-valid
 */
export function lint_probe_jsx_a11y_autocomplete_valid() {
  return <input autoComplete="bad-value" />;
}

/**
 * 规则错误：jsx_a11y/click-events-have-key-events
 */
export function lint_probe_jsx_a11y_click_events_have_key_events() {
  return <div onClick={() => undefined} />;
}

/**
 * 规则错误：jsx_a11y/control-has-associated-label
 */
export function lint_probe_jsx_a11y_control_has_associated_label() {
  return <button />;
}

/**
 * 规则错误：jsx_a11y/heading-has-content
 */
export function lint_probe_jsx_a11y_heading_has_content() {
  return <h1 />;
}

/**
 * 规则错误：jsx_a11y/html-has-lang
 */
export function lint_probe_jsx_a11y_html_has_lang() {
  return <html />;
}

/**
 * 规则错误：jsx_a11y/iframe-has-title
 */
export function lint_probe_jsx_a11y_iframe_has_title() {
  return <iframe />;
}

/**
 * 规则错误：jsx_a11y/img-redundant-alt
 */
export function lint_probe_jsx_a11y_img_redundant_alt() {
  return <img alt="image of probe" />;
}

/**
 * 规则错误：jsx_a11y/interactive-supports-focus
 */
export function lint_probe_jsx_a11y_interactive_supports_focus() {
  return <div role="button" onClick={() => undefined}>probe</div>;
}

/**
 * 规则错误：jsx_a11y/label-has-associated-control
 */
export function lint_probe_jsx_a11y_label_has_associated_control() {
  return <label>name</label>;
}

/**
 * 规则错误：jsx_a11y/lang
 */
export function lint_probe_jsx_a11y_lang() {
  return <html lang="bad_lang" />;
}

/**
 * 规则错误：jsx_a11y/media-has-caption
 */
export function lint_probe_jsx_a11y_media_has_caption() {
  return <video />;
}

/**
 * 规则错误：jsx_a11y/mouse-events-have-key-events
 */
export function lint_probe_jsx_a11y_mouse_events_have_key_events() {
  return <div onMouseOver={() => undefined} />;
}

/**
 * 规则错误：jsx_a11y/no-access-key
 */
export function lint_probe_jsx_a11y_no_access_key() {
  return <button accessKey="x" />;
}

/**
 * 规则错误：jsx_a11y/no-aria-hidden-on-focusable
 */
export function lint_probe_jsx_a11y_no_aria_hidden_on_focusable() {
  return <button aria-hidden="true" />;
}

/**
 * 规则错误：jsx_a11y/no-autofocus
 */
export function lint_probe_jsx_a11y_no_autofocus() {
  return <input autoFocus />;
}

/**
 * 规则错误：jsx_a11y/no-distracting-elements
 */
export function lint_probe_jsx_a11y_no_distracting_elements() {
  return <marquee />;
}

/**
 * 规则错误：jsx_a11y/no-interactive-element-to-noninteractive-role
 */
export function lint_probe_jsx_a11y_no_interactive_element_to_noninteractive_role() {
  return <button role="presentation" />;
}

/**
 * 规则错误：jsx_a11y/no-noninteractive-element-interactions
 */
export function lint_probe_jsx_a11y_no_noninteractive_element_interactions() {
  return <li onClick={() => undefined} />;
}

/**
 * 规则错误：jsx_a11y/no-noninteractive-element-to-interactive-role
 */
export function lint_probe_jsx_a11y_no_noninteractive_element_to_interactive_role() {
  return <li role="button" />;
}

/**
 * 规则错误：jsx_a11y/no-noninteractive-tabindex
 */
export function lint_probe_jsx_a11y_no_noninteractive_tabindex() {
  return <div role="article" tabIndex={0} />;
}

/**
 * 规则错误：jsx_a11y/no-redundant-roles
 */
export function lint_probe_jsx_a11y_no_redundant_roles() {
  return <button role="button" />;
}

/**
 * 规则错误：jsx_a11y/no-static-element-interactions
 */
export function lint_probe_jsx_a11y_no_static_element_interactions() {
  return <div onClick={() => undefined} />;
}

/**
 * 规则错误：jsx_a11y/prefer-tag-over-role
 */
export function lint_probe_jsx_a11y_prefer_tag_over_role() {
  return <div role="button" />;
}

/**
 * 规则错误：jsx_a11y/role-has-required-aria-props
 */
export function lint_probe_jsx_a11y_role_has_required_aria_props() {
  return <div role="checkbox" />;
}

/**
 * 规则错误：jsx_a11y/role-supports-aria-props
 */
export function lint_probe_jsx_a11y_role_supports_aria_props() {
  return <div role="button" aria-checked="true" />;
}

/**
 * 规则错误：jsx_a11y/scope
 */
export function lint_probe_jsx_a11y_scope() {
  return <div scope="col" />;
}

/**
 * 规则错误：jsx_a11y/tabindex-no-positive
 */
export function lint_probe_jsx_a11y_tabindex_no_positive() {
  return <div tabIndex={1} />;
}

/**
 * 规则错误：react/exhaustive-deps
 */
export function LintProbeReactExhaustiveDeps({ value }) {
  useEffect(() => { console.log(value); }, []);
  return null;
}

/**
 * 规则错误：react/forward-ref-uses-ref
 */
export function lint_probe_react_forward_ref_uses_ref() {
  const Probe = forwardRef(function Probe(props) { return React.createElement('div', props); });
  void Probe;
}

/**
 * 规则错误：react/jsx-key
 */
export function lint_probe_react_jsx_key() {
  return [<span />, <span />];
}

/**
 * 规则错误：react/jsx-no-duplicate-props
 */
export function lint_probe_react_jsx_no_duplicate_props() {
  return <div id="a" id="b" />;
}

/**
 * 规则错误：react/jsx-no-undef
 */
export function lint_probe_react_jsx_no_undef() {
  return <MissingReactComponentProbe />;
}

/**
 * 规则错误：react/jsx-props-no-spread-multi
 */
export function lint_probe_react_jsx_props_no_spread_multi() {
  const props = { id: 'probe' };
  return <div {...props} {...props} />;
}

/**
 * 规则错误：react/no-children-prop
 */
export function lint_probe_react_no_children_prop() {
  return React.createElement('div', { children: 'child' });
}

/**
 * 规则错误：react/no-danger-with-children
 */
export function lint_probe_react_no_danger_with_children() {
  return React.createElement('div', { dangerouslySetInnerHTML: { __html: '<b>x</b>' } }, 'child');
}

/**
 * 规则错误：react/no-did-mount-set-state
 */
export function lint_probe_react_no_did_mount_set_state() {
  class Probe extends React.Component { componentDidMount() { this.setState({ ready: true }); } render() { return null; } }
  void Probe;
}

/**
 * 规则错误：react/no-did-update-set-state
 */
export function lint_probe_react_no_did_update_set_state() {
  class Probe extends React.Component { componentDidUpdate() { this.setState({ ready: true }); } render() { return null; } }
  void Probe;
}

/**
 * 规则错误：react/no-direct-mutation-state
 */
export function lint_probe_react_no_direct_mutation_state() {
  class Probe extends React.Component { componentDidMount() { this.state = { ready: true }; } render() { return null; } }
  void Probe;
}

/**
 * 规则错误：react/no-find-dom-node
 */
export function lint_probe_react_no_find_dom_node() {
  ReactDOM.findDOMNode({});
}

/**
 * 规则错误：react/no-is-mounted
 */
export function lint_probe_react_no_is_mounted() {
  class Probe extends React.Component { componentDidMount() { this.isMounted(); } render() { return null; } }
  void Probe;
}

/**
 * 规则错误：react/no-render-return-value
 */
export function lint_probe_react_no_render_return_value() {
  const probe = ReactDOM.render(React.createElement('div'), document.createElement('div'));
  void probe;
}

/**
 * 规则错误：react/no-string-refs
 */
export function lint_probe_react_no_string_refs() {
  return <div ref="legacyRef" />;
}

/**
 * 规则错误：react/no-this-in-sfc
 */
export function lint_probe_react_no_this_in_sfc() {
  function Probe() {
    return this.props.value;
  }
  return <Probe />;
}

/**
 * 规则错误：react/no-unsafe
 */
export function lint_probe_react_no_unsafe() {
  class Probe extends React.Component { UNSAFE_componentWillMount() {} render() { return null; } }
  void Probe;
}

/**
 * 规则错误：react/no-will-update-set-state
 */
export function lint_probe_react_no_will_update_set_state() {
  class Probe extends React.Component { componentWillUpdate() { this.setState({ ready: true }); } render() { return null; } }
  void Probe;
}

/**
 * 规则错误：react/void-dom-elements-no-children
 */
export function lint_probe_react_void_dom_elements_no_children() {
  return <img>child</img>;
}
