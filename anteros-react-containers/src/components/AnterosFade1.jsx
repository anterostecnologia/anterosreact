import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import {AnterosUtils} from 'anteros-react-core';

const tagPropType = PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.shape({ $$typeof: PropTypes.symbol, render: PropTypes.func }),
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
      PropTypes.shape({ $$typeof: PropTypes.symbol, render: PropTypes.func }),
    ]))
  ]);

const TransitionTimeouts = {
    Fade:     150, // $transition-fade
    Collapse: 350, // $transition-collapse
    Modal:    300, // $modal-transition
    Carousel: 600, // $carousel-transition
  };
  
  // Duplicated Transition.propType keys to ensure that Reactstrap builds
  // for distribution properly exclude these keys for nested child HTML attributes
  // since `react-transition-group` removes propTypes in production builds.
  const TransitionPropTypeKeys = [
    'in',
    'mountOnEnter',
    'unmountOnExit',
    'appear',
    'enter',
    'exit',
    'timeout',
    'onEnter',
    'onEntering',
    'onEntered',
    'onExit',
    'onExiting',
    'onExited',
  ];

function omit(obj, omitKeys) {
    const result = {};
    Object.keys(obj).forEach(key => {
      if (omitKeys.indexOf(key) === -1) {
        result[key] = obj[key];
      }
    });
    return result;
  }
  
  /**
   * Returns a filtered copy of an object with only the specified keys.
   */
  function pick(obj, keys) {
    const pickKeys = Array.isArray(keys) ? keys : [keys];
    let length = pickKeys.length;
    let key;
    const result = {};
  
    while (length > 0) {
      length -= 1;
      key = pickKeys[length];
      result[key] = obj[key];
    }
    return result;
  }

export default function AnterosFade1(props) {
  const {
    tag: Tag,
    baseClass,
    baseClassActive,
    className,
    cssModule,
    children,
    innerRef,
    ...otherProps
  } = props;

  const transitionProps = pick(otherProps, TransitionPropTypeKeys);
  const childProps = omit(otherProps, TransitionPropTypeKeys);

  return (
    <Transition {...transitionProps}>
      {(status) => {
        const isActive = status === 'entered';
        const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
          className,
          baseClass,
          isActive && baseClassActive
        ), cssModule);
        return (
          <Tag className={classes} {...childProps} ref={innerRef}>
            {children}
          </Tag>
        );
      }}
    </Transition>
  );
}



AnterosFade1.propTypes = {
    ...Transition.propTypes,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    tag: tagPropType,
    baseClass: PropTypes.string,
    baseClassActive: PropTypes.string,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    innerRef: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.func,
    ]),
  };
  
  AnterosFade1.defaultProps = {
    ...Transition.defaultProps,
    tag: 'div',
    baseClass: 'fade',
    baseClassActive: 'show',
    timeout: TransitionTimeouts.Fade,
    appear: true,
    enter: true,
    exit: true,
    in: true,
  };