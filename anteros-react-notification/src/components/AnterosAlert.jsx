import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import PropTypes from "prop-types";

const FirstChild = ({ children }) =>
  React.Children.toArray(children)[0] || null;

export const ENTER_TIMEOUT = 500;
export const EXIT_TIMEOUT = 300;

export class AnterosAlert extends Component {
  constructor(props) {
    super(props);
    this.onClose = this.onClose.bind(this);
    this.state = {
      isOpen: props.isOpen
    };
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

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    this.setState({ isOpen: nextProps.isOpen });
  }

  componentDidUpdate() {
    if (this.state.isOpen) {
      if (this.alertRef.parentElement.scrollTop > 0) {
        $(this.alertRef.parentElement).animate(
          {
            scrollTop: 0
          },
          200
        );
      }
    }
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
      icon = <i className="fa fa-facebook" />;
    } else if (this.props.twitter) {
      className += " alert-twitter";
      icon = <i className="fa fa-twitter" />;
    } else if (this.props.googlePlus) {
      className += " alert-google-plus";
      icon = <i className="fa fa-google-plus" />;
    } else if (this.props.linkedin) {
      className += " alert-linkedin";
      icon = <i className="fa fa-linkedin" />;
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
      classNameAvatar = " avatar-preview avatar-preview-32";
    } else if (this.props.avatar16) {
      className += " alert-avatar";
      classNameAvatar = " avatar-preview avatar-preview-16";
    } else if (this.props.avatar48) {
      className += " alert-avatar";
      classNameAvatar = " avatar-preview avatar-preview-48";
    } else if (this.props.avatar64) {
      className += " alert-avatar";
      classNameAvatar = " avatar-preview avatar-preview-64";
    }

    if (this.props.icon) {
      icon = <i className={this.props.icon} />;
      className += " alert-icon";
    }

    return (
      <ReactCSSTransitionGroup
        component={FirstChild}
        transitionName={{
          appear: "fade",
          appearActive: "show",
          enter: "fade",
          enterActive: "show",
          leave: "fade",
          leaveActive: "out"
        }}
        transitionAppear={this.props.transitionAppearTimeout > 0}
        transitionAppearTimeout={this.props.transitionAppearTimeout}
        transitionEnter={this.props.transitionEnterTimeout > 0}
        transitionEnterTimeout={this.props.transitionEnterTimeout}
        transitionLeave={this.props.transitionLeaveTimeout > 0}
        transitionLeaveTimeout={this.props.transitionLeaveTimeout}
      >
        {this.state.isOpen == true ? (
          <div
            className={className}
            role="alert"
            ref={ref => (this.alertRef = ref)}
          >
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={this.onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
            {icon}
            {this.props.image ? (
              <div className={classNameAvatar}>
                <img src={this.props.image} />
              </div>
            ) : null}{" "}
            {this.props.children && this.props.children.constructor === Array
              ? this.props.children.map((item, i) => {
                  return (
                    <span style={{ whiteSpace: "pre" }} key={i}>
                      {item + "\n"}
                    </span>
                  );
                })
              : this.props.children}
          </div>
        ) : null}
      </ReactCSSTransitionGroup>
    );
  }
}

AnterosAlert.propTypes = {
  showBorder: PropTypes.bool,
  fill: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  success: PropTypes.bool,
  info: PropTypes.bool,
  warning: PropTypes.bool,
  danger: PropTypes.bool,
  purple: PropTypes.bool,
  greyDarker: PropTypes.bool,
  blueDirty: PropTypes.bool,
  aquamarine: PropTypes.bool,
  facebook: PropTypes.bool,
  twitter: PropTypes.bool,
  googlePlus: PropTypes.bool,
  linkedin: PropTypes.bool,
  showBorderLeft: PropTypes.bool,
  textColored: PropTypes.bool,
  avatar32: PropTypes.bool,
  avatar16: PropTypes.bool,
  avatar48: PropTypes.bool,
  avatar64: PropTypes.bool,
  autoCloseInterval: PropTypes.number.isRequired,
  transitionAppearTimeout: PropTypes.number,
  transitionEnterTimeout: PropTypes.number,
  transitionLeaveTimeout: PropTypes.number
};

AnterosAlert.defaultProps = {
  showBorder: undefined,
  fill: undefined,
  isOpen: false,
  transitionAppearTimeout: 150,
  transitionEnterTimeout: 150,
  transitionLeaveTimeout: 150,
  autoCloseInterval: 0
};
