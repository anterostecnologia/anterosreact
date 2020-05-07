import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AnterosAdvancedDropdown,
  AnterosAdvancedDropdownToggle,
  AnterosAdvancedDropdownMenu
} from 'anteros-react-buttons';
import AnterosUserMenu from './AnterosUserMenu';
import {  AnterosImage } from 'anteros-react-image';

function isBase64(str) {
  try {
      return btoa(atob(str)) == str;
  } catch (err) {
      return false;
  }
}

export default class AnterosUserBlock extends Component {
  constructor(props) {
    super(props);
    this.toggleUserDropdownMenu = this.toggleUserDropdownMenu.bind(this);
    this.state = {
      userDropdownMenu: false,
      isSupportModal: false
    };
  }

  toggleUserDropdownMenu() {
    this.setState({ userDropdownMenu: !this.state.userDropdownMenu });
  }

  render() {
    let imgUser = this.props.avatar;
    let isB64 = isBase64(imgUser);
    return (
      <div className="top-sidebar">
        <div className="sidebar-user-block media">
          <div className="user-profile">
            <AnterosImage
              width={'60px'}
              height={'60px'}
              circle
              src={
                imgUser && isB64
                  ? 'data:image;base64,' + imgUser
                  : imgUser
              }
            />
          </div>
          <AnterosAdvancedDropdown
            isOpen={this.state.userDropdownMenu}
            toggle={() => this.toggleUserDropdownMenu()}
            className="app-dropdown media-body pt-10 user-menu"
          >
            <AnterosAdvancedDropdownToggle
              nav
              className="d-flex align-items-center justify-content-between"
            >
              {this.props.userName}
              <i className="ti-angle-down pull-right" />
            </AnterosAdvancedDropdownToggle>
            <AnterosAdvancedDropdownMenu>
              <AnterosUserMenu
                userName={this.props.userName}
                email={this.props.email}
              >
                {this.props.children}
              </AnterosUserMenu>
            </AnterosAdvancedDropdownMenu>
          </AnterosAdvancedDropdown>
        </div>
      </div>
    );
  }
}


AnterosUserBlock.propTypes = {
  userName: PropTypes.string.isRequired,
  email: PropTypes.string,
  avatar: PropTypes.string,  
}

