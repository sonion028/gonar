/*
 * react correctness lint probes.
 */

import React, { forwardRef, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';

/**
 * 规则错误：react/exhaustive-deps
 */
export function lint_probe_react_exhaustive_deps() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(value + 1);
  }, []);
  void setValue;
}

/**
 * 规则错误：react/forward-ref-uses-ref
 */
export function lint_probe_react_forward_ref_uses_ref() {
  const Probe = forwardRef(function Probe(props) {
    return React.createElement('div', props);
  });
  void Probe;
}

/**
 * 规则错误：react/jsx-key
 */
export function lint_probe_react_jsx_key() {
  return [React.createElement('span'), React.createElement('span')];
}

/**
 * 规则错误：react/jsx-no-duplicate-props
 */
export function lint_probe_react_jsx_no_duplicate_props() {
  return React.createElement('div', { id: 'a', id: 'b' });
}

/**
 * 规则错误：react/jsx-no-undef
 */
export function lint_probe_react_jsx_no_undef() {
  return React.createElement(MissingReactComponentProbe);
}

/**
 * 规则错误：react/jsx-props-no-spread-multi
 */
export function lint_probe_react_jsx_props_no_spread_multi() {
  const props = { id: 'probe' };
  return React.createElement('div', { ...props, ...props });
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
  return React.createElement(
    'div',
    { dangerouslySetInnerHTML: { __html: '<b>x</b>' } },
    'child'
  );
}

/**
 * 规则错误：react/no-did-mount-set-state
 */
export function lint_probe_react_no_did_mount_set_state() {
  class Probe extends React.Component {
    componentDidMount() {
      this.setState({ ready: true });
    }
    render() {
      return null;
    }
  }
  void Probe;
}

/**
 * 规则错误：react/no-did-update-set-state
 */
export function lint_probe_react_no_did_update_set_state() {
  class Probe extends React.Component {
    componentDidUpdate() {
      this.setState({ ready: true });
    }
    render() {
      return null;
    }
  }
  void Probe;
}

/**
 * 规则错误：react/no-direct-mutation-state
 */
export function lint_probe_react_no_direct_mutation_state() {
  class Probe extends React.Component {
    componentDidMount() {
      this.state = { ready: true };
    }
    render() {
      return null;
    }
  }
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
  class Probe extends React.Component {
    componentDidMount() {
      this.isMounted();
    }
    render() {
      return null;
    }
  }
  void Probe;
}

/**
 * 规则错误：react/no-render-return-value
 */
export function lint_probe_react_no_render_return_value() {
  const probe = ReactDOM.render(
    React.createElement('div'),
    document.createElement('div')
  );
  void probe;
}

/**
 * 规则错误：react/no-string-refs
 */
export function lint_probe_react_no_string_refs() {
  return React.createElement('div', { ref: 'legacyRef' });
}

/**
 * 规则错误：react/no-this-in-sfc
 */
export function lint_probe_react_no_this_in_sfc() {
  return this.props.value;
}

/**
 * 规则错误：react/no-unsafe
 */
export function lint_probe_react_no_unsafe() {
  class Probe extends React.Component {
    componentWillMount() {}
    render() {
      return null;
    }
  }
  void Probe;
}

/**
 * 规则错误：react/no-will-update-set-state
 */
export function lint_probe_react_no_will_update_set_state() {
  class Probe extends React.Component {
    componentWillUpdate() {
      this.setState({ ready: true });
    }
    render() {
      return null;
    }
  }
  void Probe;
}

/**
 * 规则错误：react/void-dom-elements-no-children
 */
export function lint_probe_react_void_dom_elements_no_children() {
  return React.createElement('img', null, 'child');
}
