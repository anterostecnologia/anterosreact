import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';


const FirstChild = ({ children }) => (
    React.Children.toArray(children)[0] || null
);

export const ENTER_TIMEOUT = 500;
export const EXIT_TIMEOUT = 300;

export class AnterosAlert extends Component {
    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.state = { isOpen: props.isOpen }
    }

    onClose(event) {
        // clear the timer if it hasn't fired yet
        clearTimeout(this.timer);

        // we don't need to keep track of any timers for this alert anymore
        this.timer = null;
        this.timerTimeout = null;

        this.setState({ isOpen: false });
        if (this.props.onClose) {
            this.props.onClose(event);
        }
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({ isOpen: nextProps.isOpen });
    }

    componentWillUnmount() {
        this.setupTimer(/* passing nothing will clear the timer */);
    }

    setupTimer(autoCloseInterval, onClose) {
        if (!autoCloseInterval || autoCloseInterval <= 0) {
            // clear any timer we currently have
            clearTimeout(this.timer);
            this.timer = null;
            this.timerTimeout = null;
        } else {
            if (this.timer && this.timerTimeout != autoCloseInterval) {
                // the timeout value has changed, setup a new timer
                clearTimeout(this.timer);
                this.timer = null;
            }

            // add new timer if we don't already have one
            if (!this.timer) {
                this.timer = setTimeout(
                    this.onClose.bind(this, onClose),
                    autoCloseInterval + ENTER_TIMEOUT + EXIT_TIMEOUT
                );
                this.timerTimeout = autoCloseInterval;
            }
        }
    }


    render() {
        if (this.state.isOpen) {
            this.setupTimer(this.props.autoCloseInterval, this.props.onClose);
        }
        let icon;
        let className = "alert alert-close alert-dismissible fade in show";
        if (this.props.showBorder == undefined) {
            className += " alert-no-border";
        }

        if (this.props.fill) {
            className += " alert-fill";
        }
        if (this.props.success) {
            className += " alert-success";
        } else if (this.props.info) {
            className += " alert-info";
        } else if (this.props.warning) {
            className += " alert-warning";
        } else if (this.props.danger) {
            className += " alert-danger";
        } else if (this.props.purple) {
            className += " alert-purple";
        } else if (this.props.greyDarker) {
            className += " alert-grey-darker";
        } else if (this.props.blueDirty) {
            className += " alert-blue-dirty";
        } else if (this.props.aquamarine) {
            className += " alert-aquamarine";
        } else if (this.props.facebook) {
            className += " alert-facebook";
            icon = (<i className="fa fa-facebook"></i>);
        } else if (this.props.twitter) {
            className += " alert-twitter";
            icon = (<i className="fa fa-twitter"></i>);
        } else if (this.props.googlePlus) {
            className += " alert-google-plus";
            icon = (<i className="fa fa-google-plus"></i>);
        } else if (this.props.linkedin) {
            className += " alert-linkedin";
            icon = (<i className="fa fa-linkedin"></i>);
        } else {
            className += " alert-info";
        }

        if (this.props.showBorderLeft) {
            className += " alert-border-left";
        }

        if (this.props.textColored) {
            className += " alert-txt-colored";
        }

        let classNameAvatar = "";
        if (this.props.avatar || this.props.avatar32) {
            className += " alert-avatar";
            classNameAvatar = " avatar-preview avatar-preview-32"
        } else if (this.props.avatar16) {
            className += " alert-avatar";
            classNameAvatar = " avatar-preview avatar-preview-16"
        } else if (this.props.avatar48) {
            className += " alert-avatar";
            classNameAvatar = " avatar-preview avatar-preview-48"
        } else if (this.props.avatar64) {
            className += " alert-avatar";
            classNameAvatar = " avatar-preview avatar-preview-64"
        }

        if (this.props.icon) {
            icon = (<i className={this.props.icon}></i>);
            className += " alert-icon";
        }
        return (
            <CSSTransitionGroup
                component={FirstChild}
                transitionName={{
                    appear: 'fade',
                    appearActive: 'show',
                    enter: 'fade',
                    enterActive: 'show',
                    leave: 'fade',
                    leaveActive: 'out'
                }}
                transitionAppear={this.props.transitionAppearTimeout > 0}
                transitionAppearTimeout={this.props.transitionAppearTimeout}
                transitionEnter={this.props.transitionEnterTimeout > 0}
                transitionEnterTimeout={this.props.transitionEnterTimeout}
                transitionLeave={this.props.transitionLeaveTimeout > 0}
                transitionLeaveTimeout={this.props.transitionLeaveTimeout}
            >
                {this.state.isOpen == true ? <div className={className} role="alert">
                    <button type="button" className="close" aria-label="Close" onClick={this.onClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                    {icon}{(this.props.image ? <div className={classNameAvatar}><img src={this.props.image} /></div> : null)}
                    {this.props.children}
                </div> : null}
            </CSSTransitionGroup>);
    }
}



AnterosAlert.propTypes = {
    showBorder: React.PropTypes.bool,
    fill: React.PropTypes.bool,
    isOpen: React.PropTypes.bool,
    onClose: React.PropTypes.func,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    purple: React.PropTypes.bool,
    greyDarker: React.PropTypes.bool,
    blueDirty: React.PropTypes.bool,
    aquamarine: React.PropTypes.bool,
    facebook: React.PropTypes.bool,
    twitter: React.PropTypes.bool,
    googlePlus: React.PropTypes.bool,
    linkedin: React.PropTypes.bool,
    showBorderLeft: React.PropTypes.bool,
    textColored: React.PropTypes.bool,
    avatar32: React.PropTypes.bool,
    avatar16: React.PropTypes.bool,
    avatar48: React.PropTypes.bool,
    avatar64: React.PropTypes.bool,
    autoCloseInterval: React.PropTypes.number.isRequired,
    transitionAppearTimeout: React.PropTypes.number,
    transitionEnterTimeout: React.PropTypes.number,
    transitionLeaveTimeout: React.PropTypes.number,
};

AnterosAlert.defaultProps = {
    showBorder: undefined,
    fill: undefined,
    isOpen: false,
    transitionAppearTimeout: 150,
    transitionEnterTimeout: 150,
    transitionLeaveTimeout: 150,
    autoCloseInterval: 0
}
