import React, { Component } from "react";
import AnterosNavigatorLink from "./AnterosNavigatorLink";
import lodash from "lodash";
import PropTypes from "prop-types";

export default class AnterosNavigator extends Component {
  constructor(props) {
    super(props);
    this.state = { active: undefined };
    this.handleSelectLink = this.handleSelectLink.bind(this);
  }

  handleSelectLink(item) {
    this.setState({ active: item });
    if (this.props.handleSelectLink) {
      this.props.handleSelectLink(item)
    }
  }

  static get componentName() {
    return "AnterosNavigator";
  }

  render() {
    let children = [];
    if (this.props.children) {
      let _this = this;
      let arrChildren = React.Children.toArray(this.props.children);
      arrChildren.forEach(function(child) {
        let active = child.props.active;
        if (_this.state.active) {
          active = false;
          if (_this.state.active == child.props.caption) {
            active = true;
          }
        }

        children.push(
          React.createElement(
            AnterosNavigatorLink,
            {
              key: lodash.uniqueId(),
              active: active,
              href: child.props.href,
              disabled: child.props.disabled,
              caption: child.props.caption,
              icon: child.props.icon,
              onSelectLink: child.props.onSelectLink,
              handleSelectLink: _this.handleSelectLink,
              activeBackColor: _this.props.activeBackColor,
              activeColor: _this.props.activeColor,
              backgroundColor: _this.props.backgroundColor,
              color: _this.props.color
            },
            child.props.children
          )
        );
      });
    }

    let className = "nav";
    if (this.props.align == "center") {
      className += " justify-content-center";
    }

    if (this.props.align == "right") {
      className += " justify-content-end";
    }

    if (this.props.stack == "vertical") {
      className += " flex-sm-column";
    }

    if (this.props.pillFormat) {
      className += " nav-pills";
    }

    if (this.props.justified) {
      className += " nav-fill nav-justified";
    }

    return <ul className={className}>{children}</ul>;
  }
}

AnterosNavigator.propTypes = {
  handleSelectLink: PropTypes.func,
  align: PropTypes.string,
  stack: PropTypes.string,
  pillFormat: PropTypes.bool,
  justified: PropTypes.bool,
  activeBackColor: PropTypes.string,
  activeColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string
};

AnterosNavigator.defaultProps = {
  align: "left",
  stack: "horizontal",
  pillFormat: false,
  justified: false,
  activeBackColor: undefined,
  activeColor: undefined,
  backgroundColor: undefined,
  color: undefined
};
