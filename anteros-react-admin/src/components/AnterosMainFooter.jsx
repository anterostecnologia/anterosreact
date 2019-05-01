import React, { Component } from 'react';

export default class AnterosMainFooter extends Component {
  constructor(props) {
    super(props);  
  }

  static get componentName() {
    return "AnterosMainFooter";
  }

  render() {
    let classFooter = "footer ";
    if (this.context.horizontal) {
      classFooter += " horizontal";
    }
    return (
      <footer className={classFooter}>
        <div className="footer-block buttons" />
        <div className="footer-block author">
          <ul>
            <li> {this.props.children} </li>
          </ul>
        </div>
      </footer>
    );
  }
}
