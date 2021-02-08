import { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosPopperTarget } from '@anterostecnologia/anteros-react-notification';
import {AnterosUtils} from '@anterostecnologia/anteros-react-core';


export default class AnterosAdvancedDropdownToggle extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    if (this.props.disabled) {
      e.preventDefault();
      return;
    }

    if (this.props.nav && !this.props.tag) {
      e.preventDefault();
    }

    if (this.props.onClick) {
      this.props.onClick(e);
    }

    this.context.toggle(e);
  }

  render() {
    const { className, color, cssModule, caret, split, nav, tag, ...props } = this.props;
    const ariaLabel = props['aria-label'] || 'Toggle Dropdown';
    let classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
      className,
      {
        'dropdown-toggle': caret || split,
        'dropdown-toggle-split': split,
        'nav-link': nav
      }
    ), cssModule);
    const children = props.children || <span className="sr-only">{ariaLabel}</span>;

    let Tag;

    if (nav && !tag) {
      Tag = 'a';
      props.href = '#';
    } else if (!tag) {
      Tag = 'button';
      props.color = color;
      props.cssModule = cssModule;
      classes += ' btn';
    } else {
      Tag = tag;
    }


    if (this.context.inNavbar) {
      return (
        <Tag
          {...props}
          className={classes}
          onClick={this.onClick}
          aria-expanded={this.context.isOpen}
          children={children}
        />
      );
    }


    return (
      <AnterosPopperTarget
        {...props}
        className={classes}
        component={Tag}
        onClick={this.onClick}
        aria-expanded={this.context.isOpen}
        children={children}
      />
    );
  }
}

AnterosAdvancedDropdownToggle.propTypes = {
    caret: PropTypes.bool,
    color: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    'aria-haspopup': PropTypes.bool,
    split: PropTypes.bool,
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    nav: PropTypes.bool,
  };
  
  AnterosAdvancedDropdownToggle.defaultProps = {
    'aria-haspopup': true,
    color: 'secondary',
  };
  
  AnterosAdvancedDropdownToggle.contextTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    inNavbar: PropTypes.bool.isRequired,
  };