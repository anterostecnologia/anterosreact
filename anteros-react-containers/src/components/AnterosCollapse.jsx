import React from 'react';
import {AnterosUtils} from '@anterostecnologia/anteros-react-core';
import PropTypes from 'prop-types';
import Transition from 'react-transition-group/TransitionGroup';

const duration = {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  };


function getTransitionProps(props, options) {
    const { timeout, style = {} } = props;
  
    return {
      duration:
        style.transitionDuration || typeof timeout === 'number' ? timeout : timeout[options.mode],
      delay: style.transitionDelay,
    };
  }

const styles = {
  container: {
    height: 0,
    overflow: 'hidden',
  },
  entered: {
    height: 'auto',
  },
  wrapper: {
    display: 'flex',
  },
  wrapperInner: {
    width: '100%',
  },
}

export default class AnterosCollapse extends React.Component {

    constructor(props){
        super(props);
        this.handleEntering = this.handleEntering.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
        this.handleEntered = this.handleEntered.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleExiting = this.handleExiting.bind(this);
        this.addEndListener = this.addEndListener.bind(this);
        this.wrapper = null;
        this.autoTransitionDuration = null;
        this.timer = null;
    }
  

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  handleEnter(node) {
    node.style.height = this.props.collapsedHeight;

    if (this.props.onEnter) {
      this.props.onEnter(node);
    }
  };

  handleEntering(node) {
    const { timeout, autoHeightDuration } = this.props;
    const wrapperHeight = this.wrapper ? this.wrapper.clientHeight : 0;

    const { duration: transitionDuration } = getTransitionProps(this.props, {
      mode: 'enter',
    });

    if (timeout === 'auto') {
      const duration2 = autoHeightDuration;
      node.style.transitionDuration = `${duration2}ms`;
      this.autoTransitionDuration = duration2;
    } else {
      node.style.transitionDuration =
        typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
    }

    node.style.height = `${wrapperHeight}px`;

    if (this.props.onEntering) {
      this.props.onEntering(node);
    }
  };

  handleEntered(node) {
    node.style.height = 'auto';

    if (this.props.onEntered) {
      this.props.onEntered(node);
    }
  };

  handleExit(node) {
    const wrapperHeight = this.wrapper ? this.wrapper.clientHeight : 0;
    node.style.height = `${wrapperHeight}px`;

    if (this.props.onExit) {
      this.props.onExit(node);
    }
  };

  handleExiting(node) {
    const { timeout, autoHeightDuration } = this.props;
    const wrapperHeight = this.wrapper ? this.wrapper.clientHeight : 0;

    const { duration: transitionDuration } = getTransitionProps(this.props, {
      mode: 'exit',
    });

    if (timeout === 'auto') {
      const duration2 = autoHeightDuration;
      node.style.transitionDuration = `${duration2}ms`;
      this.autoTransitionDuration = duration2;
    } else {
      node.style.transitionDuration =
        typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
    }

    node.style.height = this.props.collapsedHeight;

    if (this.props.onExiting) {
      this.props.onExiting(node);
    }
  };

  addEndListener(_, next){
    if (this.props.timeout === 'auto') {
      this.timer = setTimeout(next, this.autoTransitionDuration || 0);
    }
  };

  render() {
    const {
      children,
      classes,
      className,
      collapsedHeight,
      component: Component,
      onEnter,
      onEntered,
      onEntering,
      onExit,
      onExiting,
      style,
      timeout,
      ...other
    } = this.props;

    return (
      <Transition
        onEnter={this.handleEnter}
        onEntered={this.handleEntered}
        onEntering={this.handleEntering}
        onExit={this.handleExit}
        onExiting={this.handleExiting}
        addEndListener={this.addEndListener}
        timeout={timeout === 'auto' ? null : timeout}
        {...other}
      >
        {(state, childProps) => {
          return (
            <Component
              className={AnterosUtils.buildClassNames(
                classes.container,
                {
                  [classes.entered]: state === 'entered',
                },
                className,
              )}
              style={{
                ...style,
                minHeight: collapsedHeight,
              }}
              {...childProps}
            >
              <div
                className={classes.wrapper}
                ref={node => {
                  this.wrapper = node;
                }}
              >
                <div className={classes.wrapperInner}>{children}</div>
              </div>
            </Component>
          );
        }}
      </Transition>
    );
  }
}

AnterosCollapse.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  collapsedHeight: PropTypes.string,
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  in: PropTypes.bool,
  onEnter: PropTypes.func,
  onEntered: PropTypes.func,
  onEntering: PropTypes.func,
  onExit: PropTypes.func,
  onExiting: PropTypes.func,
  style: PropTypes.object,
  autoHeightDuration: PropTypes.number.isRequired,
  timeout: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({ enter: PropTypes.number, exit: PropTypes.number }),
    PropTypes.oneOf(['auto']),
  ]),
};

AnterosCollapse.defaultProps = {
  collapsedHeight: '0px',
  component: 'div',
  timeout: duration.standard,
  autoHeightDuration: 100
};


