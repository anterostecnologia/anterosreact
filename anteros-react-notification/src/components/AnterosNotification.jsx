//https://github.com/fkhadra/react-toastify
import React, { Component, isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import TransitionGroup from 'react-transition-group';
import Transition from 'react-transition-group';

  
const NOOP = () => {};

function isValidDelay(val) {
  return typeof val === 'number' && !isNaN(val) && val > 0;
}
 
function objectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

const eventManager = {
  list: new Map(),

  on(event, callback) {
    this.list.has(event) || this.list.set(event, []);
    this.list.get(event).push(callback);
    return this;
  },

  off(event) {
    this.list.delete(event);
    return this;
  },

  /**
   * Enqueue the event at the end of the call stack
   * Doing so let the user call Notification as follow:
   * Notification('1')
   * Notification('2')
   * Notification('3')
   * Without setTimemout the code above will not work
   */
  emit(event, ...args) {
    this.list.has(event) &&
      this.list.get(event).forEach(callback =>
        setTimeout(() => {
          callback(...args);
        }, 0)
      );
  }
};


 function cssTransition({
  enter,
  exit,
  duration = 750,
  appendPosition = false
}) {
  return function Animation({
    children,
    position,
    preventExitTransition,
    ...props
  }) {
    const enterClassName = appendPosition ? `${enter}--${position}` : enter;
    const exitClassName = appendPosition ? `${exit}--${position}` : exit;
    let enterDuration, exitDuration;

    if (Array.isArray(duration) && duration.length === 2) {
      [enterDuration, exitDuration] = duration;
    } else {
      enterDuration = exitDuration = duration;
    }

    const onEnter = node => {
      node.classList.add(enterClassName);
      node.style.animationFillMode = 'forwards';
      node.style.animationDuration = `${enterDuration * 0.001}s`;
    };
    const onEntered = node => {
      node.classList.remove(enterClassName);
      node.style.cssText = '';
    };
    const onExit = node => {
      node.classList.add(exitClassName);
      node.style.animationFillMode = 'forwards';
      node.style.animationDuration = `${exitDuration * 0.001}s`;
    };

    return (
      <Transition
        {...props}
        timeout={
          preventExitTransition
            ? 0
            : {
                enter: enterDuration,
                exit: exitDuration
              }
        }
        onEnter={onEnter}
        onEntered={onEntered}
        onExit={preventExitTransition ? NOOP : onExit}
      >
        {children}
      </Transition>
    );
  };
}

export const Bounce = cssTransition({
  enter: 'anteros-notification__bounce-enter',
  exit: 'anteros-notification__bounce-exit',
  appendPosition: true
});

export const Slide = cssTransition({
  enter: 'anteros-notification__slide-enter',
  exit: 'anteros-notification__slide-exit',
  duration: [450, 750],
  appendPosition: true
});

export const Zoom = cssTransition({
  enter: 'anteros-notification__zoom-enter',
  exit: 'anteros-notification__zoom-exit'
});

export const Flip = cssTransition({
  enter: 'anteros-notification__flip-enter',
  exit: 'anteros-notification__flip-exit'
});

const canUseDom = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

function withRequired(fn) {
  fn.isRequired = function(props, propName, componentName) {
    const prop = props[propName];

    if (typeof prop === 'undefined') {
      return new Error(`The prop ${propName} is marked as required in 
      ${componentName}, but its value is undefined.`);
    }

    fn(props, propName, componentName);
  };
  return fn;
}

const falseOrDelay = withRequired((props, propName, componentName) => {
  const prop = props[propName];

  if (prop !== false && !isValidDelay(prop)) {
    return new Error(`${componentName} expect ${propName} 
      to be a valid Number > 0 or equal to false. ${prop} given.`);
  }

  return null;
});

const POSITION = {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    TOP_CENTER: 'top-center',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_CENTER: 'bottom-center'
  };
  
const TYPE = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    DEFAULT: 'default'
  };

const ACTION = {
    SHOW: 0,
    CLEAR: 1,
    DID_MOUNT: 2,
    WILL_UNMOUNT: 3,
    ON_CHANGE: 4
  };



export function AnterosNotificationProgressBar({
    delay,
    isRunning,
    closeNotification,
    type,
    hide,
    className,
    style: userStyle,
    controlledProgress,
    progress,
    rtl
  }) {
    const style = {
      ...userStyle,
      animationDuration: `${delay}ms`,
      animationPlayState: isRunning ? 'running' : 'paused',
      opacity: hide ? 0 : 1,
      transform: controlledProgress ? `scaleX(${progress})` : null
    };
  
    const classNames = cx(
      'anteros-notification__progress-bar',
      controlledProgress
        ? 'anteros-notification__progress-bar--controlled'
        : 'anteros-notification__progress-bar--animated',
      `anteros-notification__progress-bar--${type}`,
      {
        'anteros-notification__progress-bar--rtl': rtl
      },
      className
    );
  
    const animationEvent = {
      [controlledProgress && progress >= 1
        ? 'onTransitionEnd'
        : 'onAnimationEnd']:
        controlledProgress && progress < 1 ? null : closeNotification
    };
  
    return <div className={classNames} style={style} {...animationEvent} />;
  }
  
  AnterosNotificationProgressBar.propTypes = {
    /**
     * The animation delay which determine when to close the Notification
     */
    delay: falseOrDelay.isRequired,
  
    /**
     * Whether or not the animation is running or paused
     */
    isRunning: PropTypes.bool.isRequired,
  
    /**
     * Func to close the current Notification
     */
    closeNotification: PropTypes.func.isRequired,
  
    /**
     * Support rtl content
     */
    rtl: PropTypes.bool.isRequired,
  
    /**
     * Optional type : info, success ...
     */
    type: PropTypes.string,
  
    /**
     * Hide or not the progress bar
     */
    hide: PropTypes.bool,
  
    /**
     * Optionnal className
     */
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  
    /**
     * Controlled progress value
     */
    progress: PropTypes.number,
  
    /**
     * Tell wether or not controlled progress bar is used
     */
    controlledProgress: PropTypes.bool
  };
  
  AnterosNotificationProgressBar.defaultProps = {
    type: TYPE.DEFAULT,
    hide: false
  };

function getX(e) {
  return e.targetTouches && e.targetTouches.length >= 1
    ? e.targetTouches[0].clientX
    : e.clientX;
}

function getY(e) {
  return e.targetTouches && e.targetTouches.length >= 1
    ? e.targetTouches[0].clientY
    : e.clientY;
}

const iLoveInternetExplorer =
  canUseDom && /(msie|trident)/i.test(navigator.userAgent);

export class AnterosNotification extends Component {
  static propTypes = {
    closeButton: PropTypes.oneOfType([PropTypes.node, PropTypes.bool])
      .isRequired,
    autoClose: falseOrDelay.isRequired,
    children: PropTypes.node.isRequired,
    closeNotification: PropTypes.func.isRequired,
    position: PropTypes.oneOf(objectValues(POSITION)).isRequired,
    pauseOnHover: PropTypes.bool.isRequired,
    pauseOnFocusLoss: PropTypes.bool.isRequired,
    closeOnClick: PropTypes.bool.isRequired,
    transition: PropTypes.func.isRequired,
    rtl: PropTypes.bool.isRequired,
    hideProgressBar: PropTypes.bool.isRequired,
    draggable: PropTypes.bool.isRequired,
    draggablePercent: PropTypes.number.isRequired,
    in: PropTypes.bool,
    onExited: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    type: PropTypes.oneOf(objectValues(TYPE)),
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    bodyClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    progressClassName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    progressStyle: PropTypes.object,
    progress: PropTypes.number,
    updateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ariaLabel: PropTypes.string,
    containerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    role: PropTypes.string
  };

  static defaultProps = {
    type: TYPE.DEFAULT,
    in: true,
    onOpen: NOOP,
    onClose: NOOP,
    className: null,
    bodyClassName: null,
    progressClassName: null,
    updateId: null
  };

  state = {
    isRunning: true,
    preventExitTransition: false
  };

  flag = {
    canCloseOnClick: true,
    canDrag: false
  };

  drag = {
    start: 0,
    x: 0,
    y: 0,
    deltaX: 0,
    removalDistance: 0
  };

  boundingRect = null;
  ref = null;

  componentDidMount() {
    this.props.onOpen(this.props.children.props);

    if (this.props.draggable) {
      this.bindDragEvents();
    }

    // Maybe I could bind the event in the NotificationContainer and rely on delegation
    if (this.props.pauseOnFocusLoss) {
      this.bindFocusEvents();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.draggable !== this.props.draggable) {
      if (this.props.draggable) {
        this.bindDragEvents();
      } else {
        this.unbindDragEvents();
      }
    }

    if (prevProps.pauseOnFocusLoss !== this.props.pauseOnFocusLoss) {
      if (this.props.pauseOnFocusLoss) {
        this.bindFocusEvents();
      } else {
        this.unbindFocusEvents();
      }
    }
  }

  componentWillUnmount() {
    this.props.onClose(this.props.children.props);

    if (this.props.draggable) {
      this.unbindDragEvents();
    }

    if (this.props.pauseOnFocusLoss) {
      this.unbindFocusEvents();
    }
  }

  bindFocusEvents() {
    window.addEventListener('focus', this.playNotification);
    window.addEventListener('blur', this.pauseNotification);
  }

  unbindFocusEvents() {
    window.removeEventListener('focus', this.playNotification);
    window.removeEventListener('blur', this.pauseNotification);
  }

  bindDragEvents() {
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);

    document.addEventListener('touchmove', this.onDragMove);
    document.addEventListener('touchend', this.onDragEnd);
  }

  unbindDragEvents() {
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);

    document.removeEventListener('touchmove', this.onDragMove);
    document.removeEventListener('touchend', this.onDragEnd);
  }

  pauseNotification = () => {
    if (this.props.autoClose) {
      this.setState({ isRunning: false });
    }
  };

  playNotification = () => {
    if (this.props.autoClose) {
      this.setState({ isRunning: true });
    }
  };

  onDragStart = e => {
    this.flag.canCloseOnClick = true;
    this.flag.canDrag = true;
    this.boundingRect = this.ref.getBoundingClientRect();

    this.ref.style.transition = '';

    this.drag.start = this.drag.x = getX(e.nativeEvent);
    this.drag.removalDistance =
      this.ref.offsetWidth * (this.props.draggablePercent / 100);
  };

  onDragMove = e => {
    if (this.flag.canDrag) {
      if (this.state.isRunning) {
        this.pauseNotification();
      }

      this.drag.x = getX(e);
      this.drag.deltaX = this.drag.x - this.drag.start;
      this.drag.y = getY(e);

      // prevent false positif during a Notification click
      this.drag.start !== this.drag.x && (this.flag.canCloseOnClick = false);

      this.ref.style.transform = `translateX(${this.drag.deltaX}px)`;
      this.ref.style.opacity =
        1 - Math.abs(this.drag.deltaX / this.drag.removalDistance);
    }
  };

  onDragEnd = e => {
    if (this.flag.canDrag) {
      this.flag.canDrag = false;

      if (Math.abs(this.drag.deltaX) > this.drag.removalDistance) {
        this.setState(
          {
            preventExitTransition: true
          },
          this.props.closeNotification
        );
        return;
      }

      this.ref.style.transition = 'transform 0.2s, opacity 0.2s';
      this.ref.style.transform = 'translateX(0)';
      this.ref.style.opacity = 1;
    }
  };

  onDragTransitionEnd = () => {
    if (this.boundingRect) {
      const { top, bottom, left, right } = this.boundingRect;

      if (
        this.props.pauseOnHover &&
        this.drag.x >= left &&
        this.drag.x <= right &&
        this.drag.y >= top &&
        this.drag.y <= bottom
      ) {
        this.pauseNotification();
      } else {
        this.playNotification();
      }
    }
  };

  // Maybe let the end user tweak it later on
  // hmmm no comment about ie. I hope this browser die one day
  // don't want to fix the issue on this browser, my head is hurting too much
  onExitTransitionEnd = () => {
    if (iLoveInternetExplorer) {
      this.props.onExited();
      return;
    }
    const height = this.ref.scrollHeight;
    const style = this.ref.style;

    requestAnimationFrame(() => {
      style.minHeight = 'initial';
      style.height = height + 'px';
      style.transition = 'all 0.4s ';

      requestAnimationFrame(() => {
        style.height = 0;
        style.padding = 0;
        style.margin = 0;
      });
      setTimeout(() => this.props.onExited(), 400);
    });
  };

  render() {
    const {
      closeButton,
      children,
      autoClose,
      pauseOnHover,
      onClick,
      closeOnClick,
      type,
      hideProgressBar,
      closeNotification,
      transition: Transition,
      position,
      className,
      bodyClassName,
      progressClassName,
      progressStyle,
      updateId,
      role,
      progress,
      rtl
    } = this.props;

    const NotificationProps = {
      className: cx(
        'anteros-notification__toast',
        `anteros-notification__toast--${type}`,
        {
          'anteros-notification__toast--rtl': rtl
        },
        className
      )
    };

    if (autoClose && pauseOnHover) {
      NotificationProps.onMouseEnter = this.pauseNotification;
      NotificationProps.onMouseLeave = this.playNotification;
    }

    // prevent Notification from closing when user drags the Notification
    if (closeOnClick) {
      NotificationProps.onClick = e => {
        onClick && onClick(e);
        this.flag.canCloseOnClick && closeNotification();
      };
    }

    const controlledProgress = parseFloat(progress) === progress;

    return (
      <Transition
        in={this.props.in}
        appear
        onExited={this.onExitTransitionEnd}
        position={position}
        preventExitTransition={this.state.preventExitTransition}
      >
        <div
          onClick={onClick}
          {...NotificationProps}
          ref={ref => (this.ref = ref)}
          onMouseDown={this.onDragStart}
          onTouchStart={this.onDragStart}
          onMouseUp={this.onDragTransitionEnd}
          onTouchEnd={this.onDragTransitionEnd}
        >
          <div
            {...(this.props.in && { role: role })}
            className={cx('anteros-notification__toast-body', bodyClassName)}
          >
            {children}
          </div>
          {closeButton && closeButton}
          {(autoClose || controlledProgress) && (
            <AnterosNotificationProgressBar
              {...(updateId && !controlledProgress
                ? { key: `pb-${updateId}` }
                : {})}
              rtl={rtl}
              delay={autoClose}
              isRunning={this.state.isRunning}
              closeNotification={closeNotification}
              hide={hideProgressBar}
              type={type}
              style={progressStyle}
              className={progressClassName}
              controlledProgress={controlledProgress}
              progress={progress}
            />
          )}
        </div>
      </Transition>
    );
  }
}





export function CloseButton({ closeNotification, type, ariaLabel }) {
  return (
    <button
      className={`anteros-notification__close-button anteros-notification__close-button--${type}`}
      type="button"
      onClick={e => {
        e.stopPropagation();
        closeNotification(e);
      }}
      aria-label={ariaLabel}
    >
      ✖
    </button>
  );
}

CloseButton.propTypes = {
  closeNotification: PropTypes.func,
  arialLabel: PropTypes.string
};

CloseButton.defaultProps = {
  ariaLabel: 'close'
};


export class AnterosNotificationContainer extends Component {
  static propTypes = {
    /**
     * Set Notification position
     */
    position: PropTypes.oneOf(objectValues(POSITION)),

    /**
     * Disable or set autoClose delay
     */
    autoClose: falseOrDelay,

    /**
     * Disable or set a custom react element for the close button
     */
    closeButton: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),

    /**
     * Hide or not progress bar when autoClose is enabled
     */
    hideProgressBar: PropTypes.bool,

    /**
     * Pause Notification duration on hover
     */
    pauseOnHover: PropTypes.bool,

    /**
     * Dismiss Notification on click
     */
    closeOnClick: PropTypes.bool,

    /**
     * Newest on top
     */
    newestOnTop: PropTypes.bool,

    /**
     * An optional className
     */
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /**
     * An optional style
     */
    style: PropTypes.object,

    /**
     * An optional className for the Notification
     */
    NotificationClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /**
     * An optional className for the Notification body
     */
    bodyClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /**
     * An optional className for the Notification progress bar
     */
    progressClassName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),

    /**
     * An optional style for the Notification progress bar
     */
    progressStyle: PropTypes.object,

    /**
     * Define enter and exit transition using react-transition-group
     */
    transition: PropTypes.func,

    /**
     * Support rtl display
     */
    rtl: PropTypes.bool,

    /**
     * Allow Notification to be draggable
     */
    draggable: PropTypes.bool,

    /**
     * The percentage of the Notification's width it takes for a drag to dismiss a Notification
     */
    draggablePercent: PropTypes.number,

    /**
     * Pause the Notification on focus loss
     */
    pauseOnFocusLoss: PropTypes.bool,

    /**
     * Show the Notification only if it includes containerId and it's the same as containerId
     */
    enableMultiContainer: PropTypes.bool,

    /**
     * Set id to handle multiple container
     */
    containerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Set role attribute for the Notification body
     */
    role: PropTypes.string,

    /**
     * Fired when clicking inside Notificationer
     */
    onClick: PropTypes.func
  };

  static defaultProps = {
    position: POSITION.TOP_RIGHT,
    transition: Bounce,
    rtl: false,
    autoClose: 5000,
    hideProgressBar: false,
    closeButton: <CloseButton />,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    closeOnClick: true,
    newestOnTop: false,
    draggable: true,
    draggablePercent: 80,
    className: null,
    style: null,
    NotificationClassName: null,
    bodyClassName: null,
    progressClassName: null,
    progressStyle: null,
    role: 'alert'
  };

  /**
   * Hold Notification ids
   */
  state = {
    Notification: []
  };

  /**
   * Keep reference for NotificationKey
   */
  NotificationKey = 1;

  /**
   * Hold Notification's informations:
   * - what to render
   * - position
   * - raw content
   * - options
   */
  collection = {};

  componentDidMount() {
    eventManager
      .on(ACTION.SHOW, (content, options) => this.buildNotification(content, options))
      .on(ACTION.CLEAR, id =>
        id == null ? this.clear() : this.removeNotification(id)
      )
      .emit(ACTION.DID_MOUNT, this);
  }

  componentWillUnmount() {
    eventManager
      .off(ACTION.SHOW)
      .off(ACTION.CLEAR)
      .emit(ACTION.WILL_UNMOUNT, this);
  }

  isNotificationActive = id => this.state.Notification.indexOf(id) !== -1;

  removeNotification(id) {
    this.setState(
      {
        Notification: this.state.Notification.filter(v => v !== id)
      },
      this.dispatchChange
    );
  }

  dispatchChange() {
    eventManager.emit(ACTION.ON_CHANGE, this.state.Notification.length);
  }

  makeCloseButton(NotificationClose, notificationId, type) {
    let closeButton = this.props.closeButton;

    if (isValidElement(NotificationClose) || NotificationClose === false) {
      closeButton = NotificationClose;
    } else if (NotificationClose === true) {
      closeButton = <CloseButton />;
    }

    return closeButton === false
      ? false
      : cloneElement(closeButton, {
          closeNotification: () => this.removeNotification(notificationId),
          type: type
        });
  }

  getAutoCloseDelay(NotificationAutoClose) {
    return NotificationAutoClose === false || isValidDelay(NotificationAutoClose)
      ? NotificationAutoClose
      : this.props.autoClose;
  }

  canBeRendered(content) {
    return (
      isValidElement(content) ||
      typeof content === 'string' ||
      typeof content === 'number' ||
      typeof content === 'function'
    );
  }

  parseClassName(prop) {
    if (typeof prop === 'string') {
      return prop;
    } else if (
      prop !== null &&
      typeof prop === 'object' &&
      'toString' in prop
    ) {
      return prop.toString();
    }

    return null;
  }

  belongToContainer({ containerId }) {
    return containerId === this.props.containerId;
  }

  buildNotification(content, { delay, ...options }) {
    if (!this.canBeRendered(content)) {
      throw new Error(
        `The element you provided cannot be rendered. You provided an element of type ${typeof content}`
      );
    }

    const { notificationId, updateId } = options;

    // Check for multi-container and also for duplicate notificationId
    // Maybe it would be better to extract it
    if (
      (this.props.enableMultiContainer && !this.belongToContainer(options)) ||
      (this.isNotificationActive(notificationId) && updateId == null)
    ) {
      return;
    }

    const closeNotification = () => this.removeNotification(notificationId);
    const NotificationOptions = {
      id: notificationId,
      // ⚠️ if no options.key, this.NotificationKey - 1 is assigned
      key: options.key || this.NotificationKey++,
      type: options.type,
      closeNotification: closeNotification,
      updateId: options.updateId,
      rtl: this.props.rtl,
      position: options.position || this.props.position,
      transition: options.transition || this.props.transition,
      className: this.parseClassName(
        options.className || this.props.NotificationClassName
      ),
      bodyClassName: this.parseClassName(
        options.bodyClassName || this.props.bodyClassName
      ),
      onClick: options.onClick || this.props.onClick,
      closeButton: this.makeCloseButton(
        options.closeButton,
        notificationId,
        options.type
      ),
      pauseOnHover:
        typeof options.pauseOnHover === 'boolean'
          ? options.pauseOnHover
          : this.props.pauseOnHover,
      pauseOnFocusLoss:
        typeof options.pauseOnFocusLoss === 'boolean'
          ? options.pauseOnFocusLoss
          : this.props.pauseOnFocusLoss,
      draggable:
        typeof options.draggable === 'boolean'
          ? options.draggable
          : this.props.draggable,
      draggablePercent:
        typeof options.draggablePercent === 'number' &&
        !isNaN(options.draggablePercent)
          ? options.draggablePercent
          : this.props.draggablePercent,
      closeOnClick:
        typeof options.closeOnClick === 'boolean'
          ? options.closeOnClick
          : this.props.closeOnClick,
      progressClassName: this.parseClassName(
        options.progressClassName || this.props.progressClassName
      ),
      progressStyle: this.props.progressStyle,
      autoClose: this.getAutoCloseDelay(options.autoClose),
      hideProgressBar:
        typeof options.hideProgressBar === 'boolean'
          ? options.hideProgressBar
          : this.props.hideProgressBar,
      progress: parseFloat(options.progress),
      role: typeof options.role === 'string' ? options.role : this.props.role
    };

    typeof options.onOpen === 'function' &&
      (NotificationOptions.onOpen = options.onOpen);

    typeof options.onClose === 'function' &&
      (NotificationOptions.onClose = options.onClose);

    // add closeNotification function to react component only
    if (
      isValidElement(content) &&
      typeof content.type !== 'string' &&
      typeof content.type !== 'number'
    ) {
      content = cloneElement(content, {
        closeNotification
      });
    } else if (typeof content === 'function') {
      content = content({ closeNotification });
    }

    if (isValidDelay(delay)) {
      setTimeout(() => {
        this.appendNotification(NotificationOptions, content, options.stalenotificationId);
      }, delay);
    } else {
      this.appendNotification(NotificationOptions, content, options.stalenotificationId);
    }
  }

  appendNotification(options, content, stalenotificationId) {
    const { id, updateId } = options;

    this.collection = {
      ...this.collection,
      [id]: {
        options,
        content,
        position: options.position
      }
    };

    this.setState(
      {
        Notification: (updateId
          ? [...this.state.Notification]
          : [...this.state.Notification, id]
        ).filter(id => id !== stalenotificationId)
      },
      this.dispatchChange
    );
  }

  clear() {
    this.setState({ Notification: [] });
  }

  renderNotification() {
    const NotificationToRender = {};
    const { className, style, newestOnTop } = this.props;
    const collection = newestOnTop
      ? Object.keys(this.collection).reverse()
      : Object.keys(this.collection);

    // group Notification by position
    collection.forEach(notificationId => {
      const { position, options, content } = this.collection[notificationId];
      NotificationToRender[position] || (NotificationToRender[position] = []);

      if (this.state.Notification.indexOf(options.id) !== -1) {
        NotificationToRender[position].push(
          <AnterosNotification
            {...options}
            isDocumentHidden={this.state.isDocumentHidden}
            key={`Notification-${options.key}`}
          >
            {content}
          </AnterosNotification>
        );
      } else {
        NotificationToRender[position].push(null);
        delete this.collection[notificationId];
      }
    });

    return Object.keys(NotificationToRender).map(position => {
      const disablePointer =
        NotificationToRender[position].length === 1 &&
        NotificationToRender[position][0] === null;
      const props = {
        className: cx(
          'anteros-notification__toast-container',
          `anteros-notification__toast-container--${position}`,
          { 'anteros-notification__toast-container--rtl': this.props.rtl },
          this.parseClassName(className)
        ),
        style: disablePointer
          ? { ...style, pointerEvents: 'none' }
          : { ...style }
      };

      return (
        <TransitionGroup {...props} key={`container-${position}`}>
          {NotificationToRender[position]}
        </TransitionGroup>
      );
    });
  }

  render() {
    return <div className="anteros-notification">{this.renderNotification()}</div>;
  }
}


let containers = new Map();
let latestInstance = null;
let containerDomNode = null;
let containerConfig = {};
let queue = [];
let lazy = false;

/**
 * Check whether any container is currently mounted in the DOM
 */
function isAnyContainerMounted() {
  return containers.size > 0;
}

/**
 * Get the container by id. Returns the last container declared when no id is given.
 */
function getContainer(containerId) {
  if (!isAnyContainerMounted()) return null;

  if (!containerId) return containers.get(latestInstance);

  return containers.get(containerId);
}

/**
 * Get the Notification by id, given it's in the DOM, otherwise returns null
 */
function getNotification(notificationId, { containerId }) {
  const container = getContainer(containerId);
  if (!container) return null;

  const Notification = container.collection[notificationId];
  if (typeof Notification === 'undefined') return null;

  return Notification;
}

/**
 * Merge provided options with the defaults settings and generate the notificationId
 */
function mergeOptions(options, type) {
  return { ...options, type, notificationId: getnotificationId(options) };
}

/**
 * Generate a random notificationId
 */
function generatenotificationId() {
  return (Math.random().toString(36) + Date.now().toString(36)).substr(2, 10);
}

/**
 * Generate a notificationId or use the one provided
 */
function getnotificationId(options) {
  if (
    options &&
    (typeof options.notificationId === 'string' ||
      (typeof options.notificationId === 'number' && !isNaN(options.notificationId)))
  ) {
    return options.notificationId;
  }

  return generatenotificationId();
}

/**
 * If the container is not mounted, the Notification is enqueued and
 * the container lazy mounted
 */
function dispatchNotification(content, options) {
  if (isAnyContainerMounted()) {
    eventManager.emit(ACTION.SHOW, content, options);
  } else {
    queue.push({ action: ACTION.SHOW, content, options });
    if (lazy && canUseDom) {
      lazy = false;
      containerDomNode = document.createElement('div');
      document.body.appendChild(containerDomNode);
      render(<AnterosNotificationContainer {...containerConfig} />, containerDomNode);
    }
  }

  return options.notificationId;
}

export const Notification = (content, options) =>
  dispatchNotification(
    content,
    mergeOptions(options, (options && options.type) || TYPE.DEFAULT)
  );

/**
 * For each available type create a shortcut
 */
for (const t in TYPE) {
  if (TYPE[t] !== TYPE.DEFAULT) {
    Notification[TYPE[t].toLowerCase()] = (content, options) =>
      dispatchNotification(
        content,
        mergeOptions(options, (options && options.type) || TYPE[t])
      );
  }
}

/**
 * Maybe I should remove warning in favor of warn, I don't know
 */
Notification.warn = Notification.warning;

/**
 * Remove Notification programmaticaly
 */
Notification.dismiss = (id = null) =>
  isAnyContainerMounted() && eventManager.emit(ACTION.CLEAR, id);

/**
 * Do nothing until the container is mounted. Reassigned later
 */
Notification.isActive = NOOP;

Notification.update = (notificationId, options = {}) => {
  // if you call Notification and Notification.update directly nothing will be displayed
  // this is why I defered the update
  setTimeout(() => {
    const Notification = getNotification(notificationId, options);
    if (Notification) {
      const { options: oldOptions, content: oldContent } = Notification;

      const nextOptions = {
        ...oldOptions,
        ...options,
        notificationId: options.notificationId || notificationId
      };

      if (!options.notificationId || options.notificationId === notificationId) {
        nextOptions.updateId = generatenotificationId();
      } else {
        nextOptions.stalenotificationId = notificationId;
      }

      const content =
        typeof nextOptions.render !== 'undefined'
          ? nextOptions.render
          : oldContent;
      delete nextOptions.render;
      dispatchNotification(content, nextOptions);
    }
  }, 0);
};

/**
 * Used for controlled progress bar.
 */
Notification.done = id => {
  Notification.update(id, {
    progress: 1
  });
};

/**
 * Track changes. The callback get the number of Notification displayed
 */
Notification.onChange = callback => {
  if (typeof callback === 'function') {
    eventManager.on(ACTION.ON_CHANGE, callback);
  }
};

/**
 * Configure the NotificationContainer when lazy mounted
 */
Notification.configure = config => {
  lazy = true;
  containerConfig = config;
};

Notification.POSITION = POSITION;
Notification.TYPE = TYPE;
Notification.ACTION = ACTION;

/**
 * Wait until the NotificationContainer is mounted to dispatch the Notification
 * and attach isActive method
 */
eventManager
  .on(ACTION.DID_MOUNT, containerInstance => {
    latestInstance = containerInstance.props.containerId || containerInstance;
    containers.set(latestInstance, containerInstance);

    Notification.isActive = id => containerInstance.isNotificationActive(id);

    queue.forEach(item => {
      eventManager.emit(item.action, item.content, item.options);
    });

    queue = [];
  })
  .on(ACTION.WILL_UNMOUNT, containerInstance => {
    if (containerInstance)
      containers.delete(
        containerInstance.props.containerId || containerInstance
      );
    else containers.clear();

    Notification.isActive = NOOP;

    if (canUseDom && containerDomNode) {
      document.body.removeChild(containerDomNode);
    }
  });

