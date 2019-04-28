import React, { Component } from "react";
import PropTypes from "prop-types";
import lodash from "lodash";
import { AnterosFloater } from "anteros-react-core";

export default class AnterosButton extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.idButton = lodash.uniqueId("btn");
  }

  componentDidMount() {}

  onClick(event) {
    event.stopPropagation();
    if (!this.props.disabled && this.props.onButtonClick) {
      this.props.onButtonClick(event, this);
    }

    if (!this.props.disabled && this.props.onClick) {
      this.props.onClick(event, this);
    }
  }

  render() {
    let className = "btn";
    if (this.props.className) {
      className += " " + this.props.className;
    }
    if (this.props.oval) {
      className += " btn-oval";
    }

    if (this.props.circle) {
      className += " btn-circle";
    }

    if (this.props.success) {
      className += " btn-success";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.large) {
      className += " btn-lg";
    }

    if (this.props.small) {
      className += " btn-sm";
    }

    if (this.props.primary) {
      className += " btn-primary";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.danger) {
      className += " btn-danger";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.info) {
      className += " btn-info";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.link) {
      className += " btn-link";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.warning) {
      className += " btn-warning";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.secondary) {
      className += " btn-secondary";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.default) {
      className += " btn-default";
    }

    if (this.props.inline) {
      className += " btn-inline";
    }

    if (this.props.pillLeft) {
      className += " btn-pill-left";
    }

    if (this.props.pillRight) {
      className += " btn-pill-right";
    }

    if (this.props.block) {
      className += " btn-block";
    }

    if (this.props.disabled) {
      className += " disabled";
    }

    let customIcon = this.props.icon;

    if (this.props.facebook) {
      className += " btn-facebook";
      customIcon = "fab fa-facebook";
    }

    if (this.props.twitter) {
      className += " btn-twitter";
      customIcon = "fab fa-twitter";
    }

    if (this.props.googlePlus) {
      className += " btn-googleplus";
      customIcon = "fab fa-google-plus";
    }

    if (this.props.linkedin) {
      className += " btn-linkedin";
      customIcon = "fab fa-linkedin";
    }

    if (this.props.instagram) {
      className += " btn-instagram";
      customIcon = "fab fa-instagram";
    }

    if (this.props.pinterest) {
      className += " btn-pinterest";
      customIcon = "fab fa-pinterest";
    }

    if (this.props.dribbble) {
      className += " btn-dribbble";
      customIcon = "fab fa-dribbble";
    }

    if (this.props.youtube) {
      className += " btn-youtube";
      customIcon = "fab fa-youtube";
    }

    if (this.props.pullRight) {
      className += " pull-right";
    }

    let style = this.props.style;

    if (this.props.backgroundColor) {
      style = { ...style, backgroundColor: this.props.backgroundColor };
    }

    if (this.props.borderColor) {
      style = { ...style, borderColor: this.props.borderColor };
    }

    if (this.props.color) {
      style = { ...style, color: this.props.color };
    }

    if (!this.props.visible) {
      style = { ...style, display: "none" };
    }

    let dataToggle, ariaHaspopup, ariaExpanded, ariaControls, href;
    if (this.props.dropdown) {
      dataToggle = "dropdown";
      ariaHaspopup = "true";
      ariaExpanded = "true";
      className += " dropdown-toggle";
    }

    if (this.props.collapseContent) {
      dataToggle = "collapse";
      ariaExpanded = "true";
      ariaControls = this.props.collapseContent;
      href = "#" + this.props.collapseContent;
      className += " collapsed";
    }

    let icon;
    if (customIcon) {
      icon = (
        <i
          data-user={this.props.dataUser}
          onClick={this.onClick}
          className={customIcon}
          style={{ color: this.props.iconColor, fontSize: this.props.iconSize }}
        />
      );
    }

    let image;
    if (this.props.image) {
      image = (
        <img
          data-user={this.props.dataUser}
          onClick={this.onClick}
          src={this.props.image}
        />
      );
    }

    let btn = (
      <button
        id={this.props.id ? this.props.id : this.idButton}
        data-placement={this.props.hintPosition}
        data-user={this.props.dataUser}
        data-toggle={dataToggle}
        aria-haspopup={ariaHaspopup}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        href={href}
        onClick={this.onClick}
        style={style}
        ref={ref => (this.button = ref)}
        type="button"
        className={className}
      >
        {icon}
        {image}
        {this.props.caption ? (
          <span style={{ paddingLeft: "4px" }}>{this.props.caption}</span>
        ) : null}
        {this.props.children}
      </button>
    );
    // if (this.props.hint) {
    //     btn = <AnterosFloater event="hover" content={this.props.hint}>{btn}</AnterosFloater>;
    // }
    return btn;
  }
}

AnterosButton.propTypes = {
  disabled: PropTypes.bool,
  oval: PropTypes.bool,
  success: PropTypes.bool,
  info: PropTypes.bool,
  link: PropTypes.bool,
  warning: PropTypes.bool,
  large: PropTypes.bool,
  small: PropTypes.bool,
  primary: PropTypes.bool,
  danger: PropTypes.bool,
  secondary: PropTypes.bool,
  default: PropTypes.bool,
  pillLeft: PropTypes.bool,
  pillRight: PropTypes.bool,
  pullRight: PropTypes.bool,
  block: PropTypes.bool,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  color: PropTypes.string,
  dropdown: PropTypes.bool,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  iconSize: PropTypes.string,
  image: PropTypes.string,
  caption: PropTypes.string,
  onButtonClick: PropTypes.func,
  hint: PropTypes.string,
  hintPosition: PropTypes.oneOf(["top", "right", "left", "bottom"]),
  facebook: PropTypes.bool,
  twitter: PropTypes.bool,
  googlePlus: PropTypes.bool,
  linkedin: PropTypes.bool,
  instagram: PropTypes.bool,
  pinterest: PropTypes.bool,
  dribbble: PropTypes.bool,
  youtube: PropTypes.bool,
  inline: PropTypes.bool,
  dataUser: PropTypes.string,
  route: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  collapseContent: PropTypes.string
};

AnterosButton.defaultProps = {
  disabled: false,
  oval: false,
  success: false,
  warning: false,
  info: false,
  large: false,
  small: false,
  primary: false,
  danger: false,
  secondary: false,
  pillLeft: false,
  pillRight: false,
  pullRight: false,
  block: false,
  backgroundColor: undefined,
  borderColor: undefined,
  color: undefined,
  dropdown: false,
  icon: undefined,
  image: undefined,
  caption: undefined,
  hintPosition: "top",
  inline: true,
  visible: true
};
