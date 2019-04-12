import React, { Component } from 'react';

export default class AnterosFooter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <footer>
      {this.props.children}
    </footer>;
  }
}
