import React, { Component, Fragment } from 'react';

export default class AnterosMainMenu extends Component {
  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}
