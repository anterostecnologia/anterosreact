import React, { Component } from 'react';

export default class AnterosMainFooter extends Component {
  constructor(props) {
    super(props);  
  }

  static get componentName() {
    return "AnterosMainFooter";
  }

  render() {
    return <footer>
      {this.props.children}
    </footer>;
  }
}
