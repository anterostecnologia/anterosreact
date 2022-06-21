import React, { Component } from 'react';
import {AnterosUtils, If, Then, Else} from '@anterostecnologia/anteros-react-core';
import PropTypes from 'prop-types';
import AnterosPortal from './AnterosPortal';
import AnterosFade1 from './AnterosFade1';

function noop() { }

function omit(obj, omitKeys) {
    const result = {};
    Object.keys(obj).forEach(key => {
      if (omitKeys.indexOf(key) === -1) {
        result[key] = obj[key];
      }
    });
    return result;
  }
 

const TransitionTimeouts = {
    Fade:     150, // $transition-fade
    Collapse: 350, // $transition-collapse
    Modal:    300, // $modal-transition
    Carousel: 600, // $carousel-transition
  };
  
const focusableElements = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type=hidden])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'object',
    'embed',
    '[tabindex]:not(.modal)',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
  ];

const FadePropTypes = PropTypes.shape(AnterosFade1.propTypes);



export default class AnterosModal extends React.Component {
  constructor(props) {
    super(props);

    this._element = null;
    this._originalBodyPadding = null;
    this.getFocusableChildren = this.getFocusableChildren.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleBackdropMouseDown = this.handleBackdropMouseDown.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.onOpened = this.onOpened.bind(this);
    this.onClosed = this.onClosed.bind(this);
    this.onClickCloseButton = this.onClickCloseButton.bind(this);

    this.state = {
      isOpen: props.isOpen,
    };

    if (props.isOpen) {
      this.init();
    }
  }

  onClickCloseButton(event){
    if (this.props.onCloseButton){
      this.props.onCloseButton();
    }
  }

  componentDidMount() {
   
    if (this.props.onEnter) {
      this.props.onEnter();
    }

    if (this.state.isOpen && this.props.autoFocus) {
      this.setFocus();
    }

    this._isMounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen && !this.props.isOpen) {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isOpen && !this.state.isOpen) {
      this.init();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.autoFocus && this.state.isOpen && !prevState.isOpen) {
      this.setFocus();
    }

    if (this._element && prevProps.zIndex !== this.props.zIndex) {
      this._element.style.zIndex = this.props.zIndex;
    }
  }

  componentWillUnmount() {
    
    if (this.props.onExit) {
      this.props.onExit();
    }

    if (this._element) {
      this.destroy();
      if (this.state.isOpen) {
        this.close();
      }
    }

    this._isMounted = false;
  }

  onOpened(node, isAppearing) {
    this.props.onOpened();
    (this.props.modalTransition.onEntered || noop)(node, isAppearing);
  }

  onClosed(node) {
    const { unmountOnClose } = this.props;
    // so all methods get called before it is unmounted
    if (this.props.onClosed)
        this.props.onClosed();

    (this.props.modalTransition.onExited || noop)(node);

    if (unmountOnClose) {
      this.destroy();
    }
    this.close();

    if (this._isMounted) {
      this.setState({ isOpen: false });
    }
  }

  setFocus() {
    if (this._dialog && this._dialog.parentNode && typeof this._dialog.parentNode.focus === 'function') {
      this._dialog.parentNode.focus();
    }
  }

  getFocusableChildren() {
    return this._element.querySelectorAll(focusableElements.join(', '));
  }

  getFocusedChild() {
    let currentFocus;
    const focusableChildren = this.getFocusableChildren();

    try {
      currentFocus = document.activeElement;
    } catch (err) {
      currentFocus = focusableChildren[0];
    }
    return currentFocus;
  }

  // not mouseUp because scrollbar fires it, shouldn't close when user scrolls
  handleBackdropClick(e) {
    if (e.target === this._mouseDownElement) {
      e.stopPropagation();
      if (!this.props.isOpen || this.props.backdrop !== true) return;

      const backdrop = this._dialog ? this._dialog.parentNode : null;

      if (backdrop && e.target === backdrop && this.props.toggle) {
        this.props.toggle(e);
      }
    }
  }

  handleTab(e) {
    if (e.which !== 9) return;

    const focusableChildren = this.getFocusableChildren();
    const totalFocusable = focusableChildren.length;
    if (totalFocusable === 0) return;
    const currentFocus = this.getFocusedChild();

    let focusedIndex = 0;

    for (let i = 0; i < totalFocusable; i += 1) {
      if (focusableChildren[i] === currentFocus) {
        focusedIndex = i;
        break;
      }
    }

    if (e.shiftKey && focusedIndex === 0) {
      e.preventDefault();
      focusableChildren[totalFocusable - 1].focus();
    } else if (!e.shiftKey && focusedIndex === totalFocusable - 1) {
      e.preventDefault();
      focusableChildren[0].focus();
    }
  }

  handleBackdropMouseDown(e) {
    this._mouseDownElement = e.target;
  }

  handleEscape(e) {
    if (this.props.isOpen && this.props.keyboard && e.keyCode === 27 && this.props.toggle) {
      e.preventDefault();
      e.stopPropagation();
      this.props.toggle(e);
    }
  }

  init() {
    try {
      this._triggeringElement = document.activeElement;
    } catch (err) {
      this._triggeringElement = null;
    }

    if (!this._element) {
      this._element = document.createElement('div');
      this._element.setAttribute('tabindex', '-1');
      this._element.style.position = 'relative';
      this._element.style.zIndex = this.props.zIndex;
      document.body.appendChild(this._element);
    }

    this._originalBodyPadding = AnterosUtils.getOriginalBodyPadding();
    AnterosUtils.conditionallyUpdateScrollbar();

    if (AnterosModal.openCount === 0) {
      document.body.className = AnterosUtils.buildClassNames(
        document.body.className,
        AnterosUtils.mapToCssModules('modal-open', this.props.cssModule)
      );
    }

    AnterosModal.openCount += 1;
  }

  destroy() {
    if (this._element) {
      document.body.removeChild(this._element);
      this._element = null;
    }

    if (this._triggeringElement) {
      if (this._triggeringElement.focus) this._triggeringElement.focus();
      this._triggeringElement = null;
    }
  }

  close() {
    if (AnterosModal.openCount <= 1) {
      const modalOpenClassName = AnterosUtils.mapToCssModules('modal-open', this.props.cssModule);
      // Use regex to prevent matching `modal-open` as part of a different class, e.g. `my-modal-opened`
      const modalOpenClassNameRegex = new RegExp(`(^| )${modalOpenClassName}( |$)`);
      document.body.className = document.body.className.replace(modalOpenClassNameRegex, ' ').trim();
    }

    AnterosModal.openCount = Math.max(0, AnterosModal.openCount - 1);

    AnterosUtils.setScrollbarWidth(this._originalBodyPadding);
  }

  renderModalDialog() {
    let tagIcon;
    let icon = this.props.icon;
    let iconColor = this.props.iconColor;
    if (this.props.showContextIcon) {
        if (this.props.primary) {
            icon = "fa fa-question-circle fa-3x " + (this.props.showFullColor
                ? ""
                : "primary");
        } else if (this.props.success) {
            icon = "fa fa-check fa-3x " + (this.props.showFullColor
                ? ""
                : "success");
        } else if (this.props.info) {
            icon = "fa fa-info-circle fa-3x " + (this.props.showFullColor
                ? ""
                : "info");
        } else if (this.props.warning) {
            icon = "fa fa-question-circle fa-3x " + (this.props.showFullColor
                ? ""
                : "warning");
        } else if (this.props.danger) {
            icon = "fa fa-times-circle fa-3x " + (this.props.showFullColor
                ? ""
                : "danger");
        } else if (this.props.inverse) {
            icon = "fa fa-info-circle fa-3x " + (this.props.showFullColor
                ? ""
                : "inverse");
        } else if (this.props.secondary) {
            icon = "fa fa-info-circle fa-3x " + (this.props.showFullColor
                ? ""
                : "secondary");
        }
    }
    if (icon) {
        tagIcon = (
            <i
                className={icon}
                style={{
                color: iconColor,
                paddingRight: "4px"
            }}></i>
        );
    }
    let image;
    if (this.props.image) {
        image = (<img
            className={this.props.imgCircle
            ? "anterosimg-circle"
            : ""}
            src={this.props.image}
            style={{
            paddingRight: "4px",
            width: this.props.imageWidth,
            height: this.props.imageHeight
        }}/>);
    }
    let newChildren = [];
    let modalActions;
    if (this.props.children) {
        let _this = this;
        let arrChildren = React
            .Children
            .toArray(this.props.children);
        arrChildren.forEach(function (child) {
            if (child.type && child.type.componentName === 'ModalActions') {
                let className = "";
                if (_this.props.showFullColor) {
                    if (_this.props.primary) {
                        className = "modal-full-primary";
                    } else if (_this.props.success) {
                        className = "modal-full-success";
                    } else if (_this.props.info) {
                        className = "modal-full-info";
                    } else if (_this.props.warning) {
                        className = "modal-full-warning";
                    } else if (_this.props.danger) {
                        className = "modal-full-danger";
                    } else if (_this.props.secondary) {
                        className = "modal-full-secondary";
                    }
                }
                modalActions = React.cloneElement(child, {
                    className: (child.props.className
                        ? child.props.className
                        : "") + " " + className
                });

            } else {
                newChildren.push(child);
            }
        });
    }
    let classNameHeader = "modal-header";
    if (this.props.showHeaderColor || this.props.showFullColor) {
        if (this.props.primary) {
            classNameHeader += " modal-header-primary";
        } else if (this.props.success) {
            classNameHeader += " modal-header-success";
        } else if (this.props.info) {
            classNameHeader += " modal-header-info";
        } else if (this.props.warning) {
            classNameHeader += " modal-header-warning";
        } else if (this.props.danger) {
            classNameHeader += " modal-header-danger";
        } else if (this.props.secondary) {
            classNameHeader += " modal-header-secondary";
        }
    }

    let classNameBody = (newChildren.length > 0
        ? "modal-body"
        : "modal-body " + (this.props.iconCenter
            ? "modal-body-center"
            : "modal-body-center-inline"));

    if (this.props.showFullColor) {
        if (this.props.primary) {
            classNameBody += " modal-full-primary";
        } else if (this.props.success) {
            classNameBody += " modal-full-success";
        } else if (this.props.info) {
            classNameBody += " modal-full-info";
        } else if (this.props.warning) {
            classNameBody += " modal-full-warning";
        } else if (this.props.danger) {
            classNameBody += " modal-full-danger";
        } else if (this.props.secondary) {
            classNameBody += " modal-full-secondary";
        }
    }

    let corpo = (
      <div
                className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-content', this.props.contentClassName), this.props.cssModule)}
                style={{...this.props.style}}>
                <If condition={this.props.showHeader}>
                    <Then>
                        <div className={classNameHeader}>
                            <h4>
                                {this.props.title}
                            </h4>
                            {this.props.showCloseButton ?
                              <button
                                  type="button"
                                  onClick={this.onClickCloseButton}
                                  className="close"
                                  aria-label="Close">
                                  <span aria-hidden="true">{String.fromCharCode(215)}</span>
                              </button>
                            : null }
                        </div>
                    </Then>
                </If>
                <div
                    className={classNameBody}
                    style={{ width: this.props.width,
                  maxWidth: this.props.width,
                  height: this.props.height,
                  overflowY: this.props.withScroll?'auto':'unset'
                }}>
                    {tagIcon}{image}
                    <h6>{this.props.text}</h6>
                    {newChildren}
                </div>
                {modalActions}
            </div>
    )

    let larguraModal = 0;
    let alturaModal = 0;
    let wdt = 0;
    let hgt = 0;
    let mtp = 0;
    if(this.props.style){
    wdt = this.props.style.width
    hgt = this.props.style.height
    if(wdt && hgt){
      larguraModal = wdt.split('px')[0]
      alturaModal = hgt.split('px')[0]
    }
    mtp = window.innerHeight/2 - alturaModal/2
  }

    return (
      wdt && hgt? 
      <div 
          style={{width:wdt,height:hgt,marginLeft:window.innerWidth/2 - larguraModal/2,marginTop:mtp}}
          role="document"
          ref={(c) => {
                this._dialog = c;
              }}>
                {corpo}
        </div> :
        <div
            className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-dialog', (this.props.extraSmall
            ? "modal-extra-small"
            : ""), (this.props.small
            ? "modal-small"
            : ""), (this.props.medium
            ? "modal-medium"
            : ""), (this.props.large
            ? "modal-large"
            : ""), (this.props.semifull
              ? "modal-semi-full"
              : ""),(this.props.full
            ? "modal-full"
            : ""), this.props.className, {
            [`modal-${this.props.size}`]: this.props.size
        }), this.props.cssModule)}
        
            role="document"
            ref={(c) => {
                this._dialog = c;
              }}>
            {corpo}
        </div>
    );
}

render() {
    const {
      unmountOnClose
    } = this.props;

    if (!!this._element && (this.state.isOpen || !unmountOnClose)) {

      const isModalHidden = !!this._element && !this.state.isOpen && !unmountOnClose;
      this._element.style.display = isModalHidden ? 'none' : 'block';

      const {
        wrapClassName,
        modalClassName,
        backdropClassName,
        cssModule,
        isOpen,
        backdrop,
        role,
        labelledBy,
        external,
        innerRef,
      } = this.props;

      const modalAttributes = {
        onClick: this.handleBackdropClick,
        onMouseDown: this.handleBackdropMouseDown,
        onKeyUp: this.handleEscape,
        onKeyDown: this.handleTab,
        style: {...this.props.style, display: 'block' },
        'aria-labelledby': labelledBy,
        role,
        tabIndex: '-1'
      };

      const hasTransition = this.props.fade;
      const modalTransition = {
        ...AnterosFade1.defaultProps,
        ...this.props.modalTransition,
        baseClass: hasTransition ? this.props.modalTransition.baseClass : '',
        timeout: hasTransition ? this.props.modalTransition.timeout : 0,
      };
      const backdropTransition = {
        ...AnterosFade1.defaultProps,
        ...this.props.backdropTransition,
        baseClass: hasTransition ? this.props.backdropTransition.baseClass : '',
        timeout: hasTransition ? this.props.backdropTransition.timeout : 0,
      };

      const Backdrop = backdrop && (
        hasTransition ?
          (<AnterosFade1
            {...backdropTransition}
            in={isOpen && !!backdrop}
            cssModule={cssModule}
            className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-backdrop', backdropClassName), cssModule)}
          />)
          : <div className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-backdrop', 'show', backdropClassName), cssModule)} />
      );
      
      

      return (
        <AnterosPortal node={this._element}>
          <div className={AnterosUtils.mapToCssModules(wrapClassName)}>
            <AnterosFade1
              {...modalAttributes}
              {...modalTransition}
              in={isOpen}
              onEntered={this.onOpened}
              onExited={this.onClosed}
              cssModule={cssModule}
              className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal', modalClassName), cssModule)}
              innerRef={innerRef}
              style={{width: '100%', display: 'block', overflow: this.props.hideExternalScroll ? 'hidden' : 'auto'}}
            >
              {external}
              {this.renderModalDialog()}
            </AnterosFade1>
            {Backdrop}
          </div>
        </AnterosPortal>
      );
    }

    return null;
  }
}


AnterosModal.propTypes = {
    isOpen: PropTypes.bool,
    autoFocus: PropTypes.bool,
    centered: PropTypes.bool,
    size: PropTypes.string,
    toggle: PropTypes.func,
    keyboard: PropTypes.bool,
    role: PropTypes.string,
    labelledBy: PropTypes.string,
    backdrop: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(['static'])
    ]),
    onEnter: PropTypes.func,
    onExit: PropTypes.func,
    onOpened: PropTypes.func,
    onClosed: PropTypes.func,
    onCloseButton : PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
    wrapClassName: PropTypes.string,
    modalClassName: PropTypes.string,
    backdropClassName: PropTypes.string,
    contentClassName: PropTypes.string,
    external: PropTypes.node,
    fade: PropTypes.bool,
    cssModule: PropTypes.object,
    zIndex: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    backdropTransition: FadePropTypes,
    modalTransition: FadePropTypes,
    innerRef: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.func,
    ]),
    unmountOnClose: PropTypes.bool,
    showHeader: PropTypes.bool,
    showContextIcon: PropTypes.bool,
    extraSmall: PropTypes.bool,
    small: PropTypes.bool,
    medium: PropTypes.bool,
    large: PropTypes.bool,
    full: PropTypes.bool,
    semifull: PropTypes.bool,
    width : PropTypes.string,
    style : PropTypes.object,
    withScroll : PropTypes.bool,
    showCloseButton: PropTypes.bool
  };
  
  AnterosModal.defaultProps = {
    isOpen: false,
    autoFocus: true,
    centered: false,
    role: 'dialog',
    backdrop: true,
    keyboard: true,
    zIndex: 500,
    fade: true,
    onOpened: noop,
    onClosed: noop,
    modalTransition: {
      timeout: TransitionTimeouts.Modal,
    },
    backdropTransition: {
      mountOnEnter: true,
      timeout: TransitionTimeouts.Fade, 
    },
    unmountOnClose: true,
    showHeader: true,
    withScroll: true,
    showCloseButton: false
  };


AnterosModal.openCount = 0;



export class ModalActions extends Component {
    constructor(props) {
        super(props);
    }

    static get componentName(){
      return 'ModalActions';
    }

    render() {
        const {
            className,
            cssModule,
            tag: Tag,
            ...attributes
        } = this.props;
        const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-footer', className), cssModule);

        return (<Tag {...attributes} className={classes}/>);
    };
}

ModalActions.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    className: PropTypes.string,
    cssModule: PropTypes.object
};

ModalActions.defaultProps = {
    tag: 'div'
};
