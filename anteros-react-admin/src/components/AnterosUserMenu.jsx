import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AnterosUserMenu extends Component {
  render() {
    return (
      <ul className="list-unstyled mb-0" id={this.props.id}>
        <li className="border-bottom user-menu-header">
          <p className="text-white mb-0 fs-14">{this.props.userName}</p>
          <span className="text-white fs-14">{this.props.email}</span>
        </li>
        {this.props.children}
      </ul>
    );
  }
}

AnterosUserMenu.propTypes = {
  userName: PropTypes.string,
  email: PropTypes.string
};

AnterosUserMenu.defaultProps = {};

export class AnterosUserAction extends Component {

  render() {
    return (
      <li id={this.props.id}>
        <Link
          to={{
            pathname: this.props.userActionPath
          }}
        >
          {this.props.children}
        </Link>
      </li>
    );
  }
}

AnterosUserAction.propTypes = {
  userActionPath: PropTypes.string
};
