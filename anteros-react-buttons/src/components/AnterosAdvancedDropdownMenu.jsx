import PropTypes from 'prop-types';
import React from 'react';
import {AnterosUtils} from '@anterostecnologia/anteros-react-core';
import { AnterosPopper } from '@anterostecnologia/anteros-react-notification';


const noFlipModifier = { flip: { enabled: false } };

const directionPositionMap = {
  up: 'top',
  left: 'left',
  right: 'right',
  down: 'bottom',
};

const AnterosAdvancedDropdownMenu = (props, context) => {
  const { className, cssModule, right, tag, flip, modifiers, persist, ...attrs } = props;
  const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
    className,
    'custom-dropdown-menu',
    {
      'dropdown-menu-right': right,
      show: context.isOpen,
    }
  ), cssModule);

  let Tag = tag;

  if (persist || (context.isOpen && !context.inNavbar)) {
    Tag = AnterosPopper;

    const position1 = directionPositionMap[context.direction] || 'bottom';
    const position2 = right ? 'end' : 'start';
    attrs.placement = `${position1}-${position2}`;
    attrs.component = tag;
    attrs.modifiers = !flip ? {
      ...modifiers,
      ...noFlipModifier,
    } : modifiers;
  }

  return (
    <Tag
      tabIndex="-1"
      role="menu"
      {...attrs}
      aria-hidden={!context.isOpen}
      className={classes}
      x-placement={attrs.placement}
    />
  );
};

AnterosAdvancedDropdownMenu.propTypes = {
    tag: PropTypes.string,
    children: PropTypes.node.isRequired,
    right: PropTypes.bool,
    flip: PropTypes.bool,
    modifiers: PropTypes.object,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    persist: PropTypes.bool,
  };

AnterosAdvancedDropdownMenu.defaultProps = {
  tag: 'div',
  flip: true,
};

AnterosAdvancedDropdownMenu.contextTypes = {
  isOpen: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']).isRequired,
  inNavbar: PropTypes.bool.isRequired,
};

export default AnterosAdvancedDropdownMenu;