import React, { Component, Fragment } from 'react';
import PropTypes from "prop-types";

export default class AnterosMainMenu extends Component {

  get componentName() {
    return "AnterosMainMenu";
  }

  render() {
    const visible = this.props.visible;
    if (!visible) {
      return null;
    }

    return <Fragment>{this.props.children}</Fragment>;
  }
}

AnterosMainMenu.propTypes = {
  visible: PropTypes.bool.isRequired
};

AnterosMainMenu.defaultProps = {
  visible: true
}
