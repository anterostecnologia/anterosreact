import React, { Component, Fragment } from 'react';

export default class AnterosMainContent extends Component {
  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}
