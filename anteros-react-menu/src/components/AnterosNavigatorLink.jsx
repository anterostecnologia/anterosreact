import React, { Component } from "react";
import PropTypes from "prop-types";

export default class AnterosNavigatorLink extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    event.preventDefault();
    if (!this.props.disabled) {
      if (this.props.handleSelectLink) {
        this.props.handleSelectLink(this.props.caption);
      }
      if (this.props.onSelectLink) {
        this.props.onSelectLink(event);
      }
    }
  }

  static get componentName() {
    return "AnterosNavigatorLink";
  }

  render() {
    let className = "nav-link";
    if (this.props.active) {
      className += " active";
    }

    if (this.props.disabled) {
      className += " disabled";
    }

    let icon;
    if (this.props.icon) {
      icon = <i className={this.props.icon} />;
    }

    let style = {};
    if (
      this.props.activeBackColor &&
      this.props.activeColor &&
      this.props.active
    ) {
      style = {
        backgroundColor: this.props.activeBackColor,
        color: this.props.activeColor
      };
    }

    if (this.props.backgroundColor && this.props.color && !this.props.active) {
      style = {
        backgroundColor: this.props.backgroundColor,
        color: this.props.color
      };
    }

    return (
      <li className="nav-item">
        <a
          style={style}
          onClick={this.onClick}
          className={className}
          href={this.props.href}
        >
          {icon}
          <img src={this.props.image} /> {this.props.caption}
          {this.props.badge}
        </a>
      </li>
    );
  }
}

AnterosNavigatorLink.propTypes = {
  active: PropTypes.bool,
  href: PropTypes.string,
  disabled: PropTypes.bool,
  caption: PropTypes.string,
  icon: PropTypes.string,
  image: PropTypes.string,
  onSelectLink: PropTypes.func
};

AnterosNavigatorLink.defaultProps = {
  active: false,
  href: undefined,
  disabled: false
};
