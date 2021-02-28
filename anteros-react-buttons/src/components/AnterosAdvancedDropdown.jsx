import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { AnterosPopperManager } from '@anterostecnologia/anteros-react-notification';
import {AnterosUtils} from '@anterostecnologia/anteros-react-core';


const keyCodes = {
    esc:   27,
    space: 32,
    tab:   9,
    up:    38,
    down:  40
  };

function omit(obj, omitKeys) {
    const result = {};
    Object.keys(obj).forEach((key) => {
      if (omitKeys.indexOf(key) === -1) {
        result[key] = obj[key];
      }
    });
    return result;
  }

export default class AnterosAdvancedDropdown extends Component {
  constructor(props) {
    super(props);

    this.addEvents = this.addEvents.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.removeEvents = this.removeEvents.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  getChildContext() {
    return {
      toggle: this.props.toggle,
      isOpen: this.props.isOpen,
      direction: (this.props.direction === 'down' && this.props.dropup) ? 'up' : this.props.direction,
      inNavbar: this.props.inNavbar,
    };
  }

  componentDidMount() {
    this.handleProps();
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen !== prevProps.isOpen) {
      this.handleProps();
    }
  }

  componentWillUnmount() {
    this.removeEvents();
  }

  getContainer() {
    return ReactDOM.findDOMNode(this);
  }

  addEvents() {
    ['click', 'touchstart', 'keyup'].forEach(event =>
      document.addEventListener(event, this.handleDocumentClick, true)
    );
  }

  removeEvents() {
    ['click', 'touchstart', 'keyup'].forEach(event =>
      document.removeEventListener(event, this.handleDocumentClick, true)
    );
  }

  handleDocumentClick(e) {
    if (e && (e.which === 3 || (e.type === 'keyup' && e.which !== keyCodes.tab))) return;
    const container = this.getContainer();

    if (container.contains(e.target) && container !== e.target && (e.type !== 'keyup' || e.which === keyCodes.tab)) {
      return;
    }

    this.toggle(e);
  }

  handleKeyDown(e) {
    if ([keyCodes.esc, keyCodes.up, keyCodes.down, keyCodes.space].indexOf(e.which) === -1 ||
      (/button/i.test(e.target.tagName) && e.which === keyCodes.space) ||
      /input|textarea/i.test(e.target.tagName)) {
      return;
    }

    e.preventDefault();
    if (this.props.disabled) return;

    const container = this.getContainer();

    if (e.which === keyCodes.space && this.props.isOpen && container !== e.target) {
      e.target.click();
    }

    if (e.which === keyCodes.esc || !this.props.isOpen) {
      this.toggle(e);
      container.querySelector('[aria-expanded]').focus();
      return;
    }

    const menuClass = mapToCssModules('custom-dropdown-menu', this.props.cssModule);
    const itemClass = mapToCssModules('dropdown-item', this.props.cssModule);
    const disabledClass = mapToCssModules('disabled', this.props.cssModule);

    const items = container.querySelectorAll(`.${menuClass} .${itemClass}:not(.${disabledClass})`);

    if (!items.length) return;

    let index = -1;
    for (let i = 0; i < items.length; i += 1) {
      if (items[i] === e.target) {
        index = i;
        break;
      }
    }

    if (e.which === keyCodes.up && index > 0) {
      index -= 1;
    }

    if (e.which === keyCodes.down && index < items.length - 1) {
      index += 1;
    }

    if (index < 0) {
      index = 0;
    }

    items[index].focus();
  }

  handleProps() {
    if (this.props.isOpen) {
      this.addEvents();
    } else {
      this.removeEvents();
    }
  }

  toggle(e) {
    if (this.props.disabled) {
      return e && e.preventDefault();
    }

    return this.props.toggle(e);
  }

  render() {
    const {
      className,
      cssModule,
      dropup,
      isOpen,
      group,
      size,
      nav,
      setActiveFromChild,
      active,
      addonType,
      ...attrs
    } = omit(this.props, ['toggle', 'disabled', 'inNavbar', 'direction']);

    const direction = (this.props.direction === 'down' && dropup) ? 'up' : this.props.direction;

    attrs.tag = attrs.tag || (nav ? 'li' : 'div');

    let subItemIsActive = false;
    if (setActiveFromChild) {
      Children.map(this.props.children[1].props.children,
        (dropdownItem) => {
          if (dropdownItem.props.active) subItemIsActive = true;
        }
      );
    }

    const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
      'app-dropdown',
      className,
      direction !== 'down' && `drop${direction}`,
      nav && active ? 'active' : false,
      setActiveFromChild && subItemIsActive ? 'active' : false,
      {
        [`input-group-${addonType}`]: addonType,
        'btn-group': group,
        [`btn-group-${size}`]: !!size,
        dropdown: !group && !addonType,
        show: isOpen,
        'nav-item': nav
      }
    ), cssModule);

    return <AnterosPopperManager {...attrs} className={classes} onKeyDown={this.handleKeyDown} />;
  }
}

AnterosAdvancedDropdown.propTypes = {
    disabled: PropTypes.bool,
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
    group: PropTypes.bool,
    isOpen: PropTypes.bool,
    nav: PropTypes.bool,
    active: PropTypes.bool,
    addonType: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['prepend', 'append'])]),
    size: PropTypes.string,
    tag: PropTypes.string,
    toggle: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    inNavbar: PropTypes.bool,
    setActiveFromChild: PropTypes.bool,
  };
  
  AnterosAdvancedDropdown.defaultProps = {
    isOpen: false,
    direction: 'down',
    nav: false,
    active: false,
    addonType: false,
    inNavbar: false,
    setActiveFromChild: false
  };
  
  
  AnterosAdvancedDropdown.childContextTypes = {
    toggle: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right']).isRequired,
    inNavbar: PropTypes.bool.isRequired,
  };

export class AnterosAdvancedDropdownItem extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.getTabIndex = this.getTabIndex.bind(this);
  }

  onClick(e) {
    if (this.props.disabled || this.props.header || this.props.divider) {
      e.preventDefault();
      return;
    }

    if (this.props.onClick) {
      this.props.onClick(e);
    }

    if (this.props.toggle) {
      this.context.toggle(e);
    }
  }

  getTabIndex() {
    if (this.props.disabled || this.props.header || this.props.divider) {
      return '-1';
    }

    return '0';
  }

  render() {
    const tabIndex = this.getTabIndex();
    let {
      className,
      cssModule,
      divider,
      tag: Tag,
      header,
      active,
      ...props } = omit(this.props, ['toggle']);

    const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
      className,
      {
        disabled: props.disabled,
        'dropdown-item': !divider && !header,
        active: active,
        'dropdown-header': header,
        'dropdown-divider': divider
      }
    ), cssModule);

    if (Tag === 'button') {
      if (header) {
        Tag = 'h6';
      } else if (divider) {
        Tag = 'div';
      } else if (props.href) {
        Tag = 'a';
      }
    }

    return (
      <Tag
        type={(Tag === 'button' && (props.onClick || this.props.toggle)) ? 'button' : undefined}
        {...props}
        tabIndex={tabIndex}
        className={classes}
        onClick={this.onClick}
      />
    );
  }
}

AnterosAdvancedDropdownItem.propTypes = {
    children: PropTypes.node,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    divider: PropTypes.bool,
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    header: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    toggle: PropTypes.bool
  };
  
  AnterosAdvancedDropdownItem.contextTypes = {
    toggle: PropTypes.func
  };
  
  AnterosAdvancedDropdownItem.defaultProps = {
    tag: 'button',
    toggle: true
  };

