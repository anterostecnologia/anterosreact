import React from 'react';
import {
  AnterosMainContent,
  AnterosSidebarContent,
  AnterosMainLayout,
  AnterosMainMenu,
  AnterosUserBlock,
  AnterosMainHeader,
  UserActions,
  ToolbarEnd,
  ToolbarCenter
} from 'anteros-react-admin';
import { AnterosNotificationContainer } from 'anteros-react-notification';
import { connect } from 'react-redux';
import { autoBind, AnterosError } from 'anteros-react-core';

const defaultProps = {
  menuHorizontal: false, showInputSearch: true, showUserBlock: true,
  layoutReducerName: 'layoutReducer',
  logoSmall : undefined,
  withoutScroll: true
};

export default function WithMainLayoutTemplate(_loadingProps) {
  let loadingProps = { ...defaultProps, ..._loadingProps }

  const mapStateToProps = state => {
    return {
      user: state.authenticationReducer.user,
      authenticated: state.authenticationReducer.authenticated
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return {
      setNeedUpdateView: () => {
        dispatch({ type: 'SET_NEED_UPDATEVIEW', payload: { needUpdateView: true } });
      }
    }
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
          WrappedComponent.prototype.hasOwnProperty('isSideBarVisible') === false
        ) {
          throw new AnterosError(
            'Implemente o método isSideBarVisible na classe ' + WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty('isMainMenuVisible') === false
        ) {
          throw new AnterosError(
            'Implemente o método isMainMenuVisible na classe ' + WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty('getToolbarCenterContent') === false
        ) {
          throw new AnterosError(
            'Implemente o método getToolbarCenterContent na classe ' + WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty('getToolbarEndContent') === false
        ) {
          throw new AnterosError(
            'Implemente o método getToolbarEndContent na classe ' + WrappedComponent.type
          );
        }

        this.state = {
          sidebarOpen: false,
          isSideBarVisible: true,
          menuOpened: false
        };
        autoBind(this);
      }

      componentWil

      onSelectMenuItem(menuItem) {
        this.props.history.push(menuItem.props.route);
      }

      onSetOpen(open) {
        this.setState({ ...this.state, sidebarOpen: open, update: Math.random() });
      }

      onChangeMenuFormat(opened) {
        this.setState({ ...this.state, menuOpened: opened, update: Math.random() });
      }

      onExpandMenu() {
        if (this.props.setNeedUpdateView)
          this.props.setNeedUpdateView();
      }

      onCollapseMenu() {
        if (this.props.setNeedUpdateView)
          this.props.setNeedUpdateView();
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
        const horizontal = loadingProps.menuHorizontal;
        const Actions = this.getUserActions();
        const ToolbarCenterContent = this.getToolbarCenterContent();
        const ToolbarEndContent = this.getToolbarEndContent();
        const MainMenu = this.getMainMenu();
        const Switch = this.getSwitch();
        let style = { width: "350px" };
        if (!this.state.menuOpened) {
          style = { width: "60px" };
        }

        let logo = loadingProps.logo;
        if (!this.state.menuOpened && loadingProps.logoSmall && !this.state.sidebarOpen){
          logo = loadingProps.logoSmall;
        }
        return (
          <AnterosMainLayout
            onSetOpenSidebar={this.onSetOpen}
            sidebarOpen={this.state.sidebarOpen}
            sidebarVisible={this.isSideBarVisible()}
            withoutScroll={loadingProps.withoutScroll}
            menuOpened={this.state.menuOpened}
            horizontalMenu={horizontal}
          >
            <AnterosNotificationContainer />
            <AnterosMainHeader
              horizontalMenu={horizontal}
              logoNormal={logo}
              onSetOpenSidebar={this.onSetOpen}
              sidebarOpen={this.state.sidebarOpen}
              showInputSearch={loadingProps.showInputSearch}
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
              {Actions ? (
                <UserActions>
                  {Actions}
                </UserActions>
              ) : null}

              <ToolbarCenter>
                {ToolbarCenterContent}
              </ToolbarCenter>
              <ToolbarEnd>
                {ToolbarEndContent}
              </ToolbarEnd>

            </AnterosMainHeader>

            {horizontal ? (
              <AnterosMainMenu>
                {MainMenu ? (
                  <MainMenu onChangeMenuFormat={this.onChangeMenuFormat} horizontal={true} visible={this.isMainMenuVisible()} />
                ) : null}
              </AnterosMainMenu>
            ) : (
                <AnterosSidebarContent
                  visible={this.isSideBarVisible()}
                  enableSidebarBackgroundImage={loadingProps.enableSidebarBackgroundImage}
                  logoNormal={logo}
                  style={style}
                  selectedSidebarImage={loadingProps.selectedSidebarImage}
                >
                  {loadingProps.showUserBlock ? <AnterosUserBlock
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
                    {Actions ? (
                      Actions
                    ) : null}
                  </AnterosUserBlock> : null}
                  {MainMenu ? (
                    <MainMenu onExpandMenu={this.onExpandMenu} onCollapseMenu={this.onCollapseMenu} onChangeMenuFormat={this.onChangeMenuFormat} withoutUserBlock={!loadingProps.showUserBlock} onSelectMenuItem={this.onSelectMenuItem} visible={this.isMainMenuVisible()} />
                  ) : null}
                </AnterosSidebarContent>
              )}

            <AnterosMainContent>
              {Switch}
            </AnterosMainContent>
            {this.props.children}
          </AnterosMainLayout>
        );
      }
    }

    return connect(
      mapStateToProps,
      mapDispatchToProps
    )(LayoutPrincipal);
  };

};