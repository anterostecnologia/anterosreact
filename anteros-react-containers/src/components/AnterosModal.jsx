import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {TransitionGroup} from 'react-transition-group';
import {AnterosFade, AnterosUtils, If, Then, Else} from 'anteros-react-core';
import PropTypes from 'prop-types';


export default class AnterosModal extends Component {
    constructor(props) {
        super(props);

        this.originalBodyPadding = null;
        this.isBodyOverflowing = false;
        this.togglePortal = this.togglePortal.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
        this.handleEscape = this.handleEscape.bind(this);
        this.destroy = this.destroy.bind(this);
        this.onEnter = this.onEnter.bind(this);
        this.onExit = this.onExit.bind(this);
        this.onClickCloseButton = this.onClickCloseButton.bind(this);
    }

    componentDidMount() {
        if (this.props.isOpen) {
            this.togglePortal();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.isOpen !== prevProps.isOpen) {
            this.togglePortal();
        } else if (this._element) {
            this.renderIntoSubtree();
        }
    }

    componentWillUnmount() {
        this.onExit();
    }

    onClickCloseButton(event) {
        event.preventDefault();
        this.hide();
        if (this.props.onClose) {
            this.props.onClose(this);
        }
    }

    onEnter() {
        if (this.props.onEnter) {
            this.props.onEnter();
        }
    }

    onExit() {
        this.destroy();
        if (this.props.onExit) {
            this.props.onExit();
        }
    }

    handleEscape(e) {
        if (this.props.keyboard && e.keyCode === 27) {
            this.hide();
            if (this.props.onClose) {
                this.props.onClose(this);
            }
        }
    }

    handleBackdropClick(e) {
        if (this.props.backdrop !== true) return;

        const container = this._dialog;

        if (e.target && !container.contains(e.target)) {
            this.hide();
            if (this.props.onClose) {
                this.props.onClose(this);
            }
        }
    }

    hasTransition() {
        if (this.props.fade === false) {
            return false;
        }

        return this.props.modalTransitionTimeout > 0;
    }

    togglePortal() {
        if (this.props.isOpen) {
            if (this.props.autoFocus) {
                this._focus = true;
            }
            this.show();
            if (!this.hasTransition()) {
                this.onEnter();
            }
        } else {
            this.hide();
            if (!this.hasTransition()) {
                this.onExit();
            }
        }
    }

    destroy() {
        if (this._element) {
            ReactDOM.unmountComponentAtNode(this._element);
            document.body.removeChild(this._element);
            this._element = null;
        }

        const classes = document.body.className.replace(/(^| )modal-open( |$)/, ' ');
        document.body.className = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(classes).trim(), this.props.cssModule);
        AnterosUtils.setScrollbarWidth(this.originalBodyPadding);
    }

    hide() {
        this.renderIntoSubtree();
    }

    show() {
        const classes = document.body.className;
        this._element = document.createElement('div');
        this._element.setAttribute('tabindex', '-1');
        this._element.style.position = 'relative';
        this._element.style.zIndex = this.props.zIndex;
        this.originalBodyPadding = AnterosUtils.getOriginalBodyPadding();

        AnterosUtils.conditionallyUpdateScrollbar();

        document.body.appendChild(this._element);

        document.body.className = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
            classes,
            'modal-open'
        ), this.props.cssModule);

        this.renderIntoSubtree();
    }

    renderModalDialog() {
        let tagIcon;
        let icon = this.props.icon;
        let iconColor = this.props.iconColor;
        if (this.props.showContextIcon) {
            if (this.props.primary) {
                icon = "fa fa-question-circle fa-3x " + (this.props.showFullColor ? "" : "primary");
            } else if (this.props.success) {
                icon = "fa fa-check fa-3x " + (this.props.showFullColor ? "" : "success");
            } else if (this.props.info) {
                icon = "fa fa-info-circle fa-3x " + (this.props.showFullColor ? "" : "info");
            } else if (this.props.warning) {
                icon = "fa fa-question-circle fa-3x " + (this.props.showFullColor ? "" : "warning");
            } else if (this.props.danger) {
                icon = "fa fa-times-circle fa-3x " + (this.props.showFullColor ? "" : "danger");
            } else if (this.props.inverse) {
                icon = "fa fa-info-circle fa-3x " + (this.props.showFullColor ? "" : "inverse");
            } else if (this.props.secondary) {
                icon = "fa fa-info-circle fa-3x " + (this.props.showFullColor ? "" : "secondary");
            }
        }
        if (icon) {
            tagIcon = (<i className={icon} style={{ color: iconColor, paddingRight: "4px" }}></i>);
        }
        let image;
        if (this.props.image) {
            image = (<img className={this.props.imgCircle ? "anterosimg-circle" : ""} src={this.props.image} style={{ paddingRight: "4px", width: this.props.imageWidth, height: this.props.imageHeight }} />);
        }
        let newChildren = [];
        let modalActions;
        if (this.props.children) {
            let _this = this;
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.name == "ModalActions") {
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
                    modalActions = React.cloneElement(child, { className: (child.props.className ? child.props.className : "") + " " + className });

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

        let classNameBody = (newChildren.length > 0 ? "modal-body" : "modal-body " + (this.props.iconCenter ? "modal-body-center" : "modal-body-center-inline"));
        
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

        return (
            <div 
                className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-dialog', (this.props.extraSmall ? "modal-extra-small" : ""),
                    (this.props.small ? "modal-small" : ""),
                    (this.props.medium ? "modal-medium" : ""),
                    (this.props.large ? "modal-large" : ""),
                    (this.props.full ? "modal-full" : ""),
                    this.props.className, {
                        [`modal-${this.props.size}`]: this.props.size
                    }), this.props.cssModule)}
                role="document"
                ref={(c) => (this._dialog = c)}
            >
                <div 
                    className={AnterosUtils.mapToCssModules(
                        AnterosUtils.buildClassNames('modal-content', this.props.contentClassName),
                        this.props.cssModule
                    )}
                style={this.props.style}>
                    <If condition={this.props.showHeader}>
                        <Then>
                            <div className={classNameHeader}>
                                <h4>
                                    {this.props.title}
                                </h4>
                                <button type="button" onClick={this.onClickCloseButton} className="close" aria-label="Close">
                                    <span aria-hidden="true">{String.fromCharCode(215)}</span>
                                </button>
                            </div>
                        </Then>
                    </If>
                    <div className={classNameBody} style={{ width: this.props.width, maxWidth: this.props.width, height: this.props.height, overflowY: "auto" }}>
                        {tagIcon}{image}
                        <h6>{this.props.text}</h6>
                        {newChildren}
                    </div>
                    {modalActions}
                </div>
            </div>
        );
    }

    renderIntoSubtree() {
        ReactDOM.unstable_renderSubtreeIntoContainer(
            this,
            this.renderChildren(),
            this._element
        );

        if (this._focus) {
            this._dialog.parentNode.focus();
            this._focus = false;
        }
    }

    renderChildren() {
        const {
      wrapClassName,
            modalClassName,
            backdropClassName,
            cssModule,
            isOpen,
            backdrop,
            center,
            modalTransitionTimeout,
            backdropTransitionTimeout
    } = this.props;

        let style = { display: 'block' };
        
        if (center) {
            style = { display: 'flex', justifyContent: 'center', alignItens: 'center', flexDirection: 'column' };
        }

        const modalAttributes = {
            onClickCapture: this.handleBackdropClick,
            onKeyUp: this.handleEscape,
            style: style,
            tabIndex: '-1'
        };

        if (this.hasTransition()) {
            return (
                <TransitionGroup component="div" className={AnterosUtils.mapToCssModules(wrapClassName)}>
                    {isOpen && (
                        <AnterosFade
                            key="modal-dialog"
                            onEnter={this.onEnter}
                            onLeave={this.onExit}
                            transitionAppearTimeout={
                                typeof this.props.modalTransitionAppearTimeout === 'number'
                                    ? this.props.modalTransitionAppearTimeout
                                    : modalTransitionTimeout
                            }
                            transitionEnterTimeout={
                                typeof this.props.modalTransitionEnterTimeout === 'number'
                                    ? this.props.modalTransitionEnterTimeout
                                    : modalTransitionTimeout
                            }
                            transitionLeaveTimeout={
                                typeof this.props.modalTransitionLeaveTimeout === 'number'
                                    ? this.props.modalTransitionLeaveTimeout
                                    : modalTransitionTimeout
                            }
                            cssModule={cssModule}
                            className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal', modalClassName), cssModule)}
                            {...modalAttributes}
                        >
                            {this.renderModalDialog()}
                        </AnterosFade>
                    )}
                    {isOpen && backdrop && (
                        <AnterosFade
                            key="modal-backdrop"
                            transitionAppearTimeout={
                                typeof this.props.backdropTransitionAppearTimeout === 'number'
                                    ? this.props.backdropTransitionAppearTimeout
                                    : backdropTransitionTimeout
                            }
                            transitionEnterTimeout={
                                typeof this.props.backdropTransitionEnterTimeout === 'number'
                                    ? this.props.backdropTransitionEnterTimeout
                                    : backdropTransitionTimeout
                            }
                            transitionLeaveTimeout={
                                typeof this.props.backdropTransitionLeaveTimeout === 'number'
                                    ? this.props.backdropTransitionLeaveTimeout
                                    : backdropTransitionTimeout
                            }
                            cssModule={cssModule}
                            className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-backdrop', backdropClassName), cssModule)}
                        />
                    )}
                </TransitionGroup>
            );
        }

        return (
            <div className={AnterosUtils.mapToCssModules(wrapClassName)}>
                {isOpen && (
                    <div
                        className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal', 'show', modalClassName), cssModule)}
                        {...modalAttributes}
                    >
                        {this.renderModalDialog()}
                    </div>
                )}
                {isOpen && backdrop && (
                    <div
                        className={AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames('modal-backdrop', 'show', backdropClassName), cssModule)}
                    />
                )}
            </div>
        );
    }

    render() {
        return null;
    }
}

AnterosModal.propTypes = {
    isOpen: PropTypes.bool,
    autoFocus: PropTypes.bool,
    size: PropTypes.string,
    toggle: PropTypes.func,
    keyboard: PropTypes.bool,
    backdrop: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf(['static'])
    ]),
    onEnter: PropTypes.func,
    onExit: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
    wrapClassName: PropTypes.string,
    modalClassName: PropTypes.string,
    backdropClassName: PropTypes.string,
    contentClassName: PropTypes.string,
    fade: PropTypes.bool,
    cssModule: PropTypes.object,
    zIndex: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    backdropTransitionTimeout: PropTypes.number,
    backdropTransitionAppearTimeout: PropTypes.number,
    backdropTransitionEnterTimeout: PropTypes.number,
    backdropTransitionLeaveTimeout: PropTypes.number,
    modalTransitionTimeout: PropTypes.number,
    modalTransitionAppearTimeout: PropTypes.number,
    modalTransitionEnterTimeout: PropTypes.number,
    modalTransitionLeaveTimeout: PropTypes.number,
    showHeader: PropTypes.bool,
    showContextIcon: PropTypes.bool,
    extraSmall: PropTypes.bool,
    small: PropTypes.bool,
    medium: PropTypes.bool,
    large: PropTypes.bool,
    full: PropTypes.bool
};

AnterosModal.defaultProps = {
    isOpen: false,
    autoFocus: true,
    backdrop: 'static',
    keyboard: true,
    showContextIcon: true,
    zIndex: 1050,
    fade: true,
    modalTransitionTimeout: 300,
    backdropTransitionTimeout: 150,
    showHeader: true
};


export class ModalActions extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
    className,
            cssModule,
            tag: Tag,
            ...attributes } = this.props;
        const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
            'modal-footer',
            className
        ), cssModule);

        return (
            <Tag {...attributes} className={classes} />
        );
    };
}

ModalActions.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    className: PropTypes.string,
    cssModule: PropTypes.object,
};

ModalActions.defaultProps = {
    tag: 'div',
};
