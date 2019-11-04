import React from 'react';
import {
  AnterosMainContent,
  AnterosSidebarContent,
  AnterosMainLayout,
  AnterosMainMenu,
  AnterosUserBlock,
  AnterosMainHeader,
} from 'anteros-react-admin';
import { AnterosNotificationContainer } from 'anteros-react-notification';
import { connect } from 'react-redux';
import { autoBind } from 'anteros-react-core';

const defaultProps = {
    defaultAvatar: ''
};

export default function WithMainLayoutTemplate(_loadingProps) {
    let loadingProps = {...defaultProps, ..._loadingProps}

    const mapStateToProps = state => {
        return {
          user: state.authenticationReducer.user,
          authenticated: state.authenticationReducer.authenticated
        };
      };

      return WrappedComponent => {
        class LayoutPrincipal extends WrappedComponent {
            constructor(props) {
              super(props);

              if (
                WrappedComponent.prototype.hasOwnProperty('getUserActions') === false
              ) {
                throw new AnterosError(
                  'Implemente o método getUserActions na classe ' + WrappedComponent.type
                );
              }

              if (
                WrappedComponent.prototype.hasOwnProperty('getSwitch') === false
              ) {
                throw new AnterosError(
                  'Implemente o método getSwitch na classe ' + WrappedComponent.type
                );
              }

              if (
                WrappedComponent.prototype.hasOwnProperty('getMainMenu') === false
              ) {
                throw new AnterosError(
                  'Implemente o método getMainMenu na classe ' + WrappedComponent.type
                );
              }
              
              if (
                WrappedComponent.prototype.hasOwnProperty('getToolbar') === false
              ) {
                throw new AnterosError(
                  'Implemente o método getToolbar na classe ' + WrappedComponent.type
                );
              }

              this.state = {
                sidebarOpen: false
              };
              autoBind(this);
            }
            onSelectMenuItem(menuItem) {
              this.props.history.push(menuItem.props.route);
            }
          
            onSetOpen(open) {
              this.setState({ ...this.state, sidebarOpen: open });
            }
          
            toggleScreenFull() {
              if (
                (document.fullScreenElement && document.fullScreenElement !== null) ||
                (!document.mozFullScreen && !document.webkitIsFullScreen)
              ) {
                // Entra no modo full screen
                if (document.documentElement.requestFullScreen) {
                  document.documentElement.requestFullScreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                  document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullScreen) {
                  document.documentElement.webkitRequestFullScreen(
                    Element.ALLOW_KEYBOARD_INPUT
                  );
                }
              } else {
                // Sai do modo full screen
                if (document.cancelFullScreen) {
                  document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                  document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                  document.webkitCancelFullScreen();
                }
              }
            }
          
            render() {
              const horizontal = false;
              const UserActions = this.getUserActions();
              const Toolbar = this.getToolbar();
              const MainMenu = this.getMainMenu();
              const Switch = this.getSwitch();
              return (
                <AnterosMainLayout
                  onSetOpenSidebar={this.onSetOpen}
                  sidebarOpen={this.state.sidebarOpen}
                  horizontalMenu={horizontal}
                >
                  <AnterosNotificationContainer />
                  <AnterosMainHeader
                    horizontalMenu={horizontal}
                    logoNormal={loadingProps.logopath}
                    onSetOpenSidebar={this.onSetOpen}
                    sidebarOpen={this.state.sidebarOpen}
                    userName={
                      this.props.authenticated ? this.props.user.profile.name : ''
                    }
                    email={this.props.authenticated ? this.props.user.profile.email : ''}
                    avatar={
                      this.props.authenticated
                        ? this.props.user.profile.avatar
                          ? this.props.user.profile.avatar
                          : loadingProps.defaultAvatar
                        : loadingProps.defaultAvatar
                    }
                  >
                    { UserActions ? (
                            <UserActions />
                    ) : null }
                    { Toolbar ? (
                        <Toolbar />
                    ) : null }
                  </AnterosMainHeader>
          
                  {horizontal ? (
                    <AnterosMainMenu>
                     { MainMenu ? (
                        <MainMenu horizontal={true} />
                     ) : null }
                    </AnterosMainMenu>
                  ) : (
                    <AnterosSidebarContent
                      enableSidebarBackgroundImage={loadingProps.enableSidebarBackgroundImage}
                      logoNormal={loadingProps.logoPath}
                      selectedSidebarImage={loadingProps.selectedSidebarImage}
                    >
                      <AnterosUserBlock
                        userName={
                          this.props.authenticated ? this.props.user.profile.name : ''
                        }
                        email={
                          this.props.authenticated ? this.props.user.profile.email : ''
                        }
                        avatar={
                          this.props.authenticated
                            ? this.props.user.profile.avatar
                              ? this.props.user.profile.avatar
                              : loadingProps.defaultAvatar
                            : loadingProps.defaultAvatar
                        }
                      >
                        { UserActions ? (
                            <UserActions />
                        ) : null }
                      </AnterosUserBlock>
                      { MainMenu ? (
                          <MainMenu horizontal={true} />
                      ) : null }
                    </AnterosSidebarContent>
                  )}
          
                  <AnterosMainContent>
                    <Switch />
                  </AnterosMainContent>
                  {this.props.children}
                </AnterosMainLayout>
              );
            }
          }
          
        return connect(
          mapStateToProps,
          null
        )(LayoutPrincipal);
      };

};