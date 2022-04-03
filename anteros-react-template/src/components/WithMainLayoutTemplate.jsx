import React from "react";
import {
  AnterosMainContent,
  AnterosSidebarContent,
  AnterosMainLayout,
  AnterosMainMenu,
  AnterosUserBlock,
  AnterosMainHeader,
  UserActions,
  QuickLinks,
  ToolbarEnd,
  ToolbarCenter,
} from "@anterostecnologia/anteros-react-admin";
import { AnterosNotificationContainer } from "@anterostecnologia/anteros-react-notification";
import { connect } from "react-redux";
import { autoBind, AnterosError } from "@anterostecnologia/anteros-react-core";
import shallowCompare from "react-addons-shallow-compare";
import { RoutedTabs, NavTab } from "react-router-tabs";
import "react-router-tabs/styles/react-router-tabs.css";


const defaultProps = {
  menuHorizontal: false,
  showInputSearch: true,
  showUserBlock: true,
  layoutReducerName: "layoutReducer",
  logoSmall: undefined,
  withoutScroll: true,
  avatarWidth: "42px",
  avatarHeight: "42px",
  toolbarIconColor: "white",
  quickLinkHeaderColor:'blue',
  toolbarIconBackgroundColor: 'rgb(255,255,255,0.2'
};



export default function WithMainLayoutTemplate(_loadingProps) {
  let loadingProps = { ...defaultProps, ..._loadingProps };

  const mapStateToProps = (state) => {
    return {
      user: state.authenticationReducer.user,
      authenticated: state.authenticationReducer.authenticated,
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return {
      showTour: () => {
        dispatch({ type: "SHOW_TOUR" });
      },
      setNeedUpdateView: () => {
        dispatch({
          type: "SET_NEED_UPDATEVIEW",
          payload: { needUpdateView: true },
        });
      },
    };
  };

  return (WrappedComponent) => {
    class LayoutPrincipal extends WrappedComponent {
      constructor(props) {
        super(props);

        if (
          WrappedComponent.prototype.hasOwnProperty("getUserActions") === false
        ) {
          throw new AnterosError(
            "Implemente o método getUserActions na classe " +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getQuickLinks") === false
        ) {
          throw new AnterosError(
            "Implemente o método getQuickLinks na classe " +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getCommands") === false
        ) {
          throw new AnterosError(
            "Implemente o método getCommands na classe " +
              WrappedComponent.type
          );
        }

        if (WrappedComponent.prototype.hasOwnProperty("getSwitch") === false) {
          throw new AnterosError(
            "Implemente o método getSwitch na classe " + WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getMainMenu") === false
        ) {
          throw new AnterosError(
            "Implemente o método getMainMenu na classe " + WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("isSideBarVisible") ===
          false
        ) {
          throw new AnterosError(
            "Implemente o método isSideBarVisible na classe " +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("isMainMenuVisible") ===
          false
        ) {
          throw new AnterosError(
            "Implemente o método isMainMenuVisible na classe " +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty(
            "getToolbarCenterContent"
          ) === false
        ) {
          throw new AnterosError(
            "Implemente o método getToolbarCenterContent na classe " +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getToolbarEndContent") ===
          false
        ) {
          throw new AnterosError(
            "Implemente o método getToolbarEndContent na classe " +
              WrappedComponent.type
          );
        }

        this.state = {
          sidebarOpen: false,
          isSideBarVisible: true,
          menuOpened: false,
        };
        autoBind(this);
      }

      shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
      }

      componentDidMount() {
        if (WrappedComponent.prototype.hasOwnProperty("onDidMount") === true) {
          this.onDidMount();
        }
      }

      componentWillReceiveProps(nextProps) {
        let element = document.getElementById("_divRenderPageMainLayout");
        if (element) {
          element.style.height = "auto";
          setTimeout(() => {
            element.style.height = "calc(100vh - 70px)";
            this.setState({ ...this.state, update: Math.random() });
          }, 200);
        } else {
          this.setState({ ...this.state, update: Math.random() });
        }
      }

      onSelectMenuItem(menuItem) {
        this.props.history.push(menuItem.props.route);
      }

      onSetOpen(open) {
        this.setState({
          ...this.state,
          sidebarOpen: open,
          update: Math.random(),
        });
      }

      onChangeMenuFormat(opened) {
        this.setState({
          ...this.state,
          menuOpened: opened,
          update: Math.random(),
        });
      }

      onExpandMenu() {
        if (this.props.setNeedUpdateView) this.props.setNeedUpdateView();
      }

      onCollapseMenu() {
        this.collapseMenu();
      }

      collapseMenu() {
        if (this.props.setNeedUpdateView) this.props.setNeedUpdateView();
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

      getAvatar() {
        if (this.props.user.profile.avatar) {
          if (this.isBase64(this.props.user.profile.avatar)) {
            if (this.isUrl(atob(this.props.user.profile.avatar))) {
              return atob(this.props.user.profile.avatar);
            } else {
              return "data:image;base64," + this.props.user.profile.avatar;
            }
          } else {
            return this.props.user.profile.avatar;
          }
        } else {
          return loadingProps.defaultAvatar;
        }
      }

      isBase64(str) {
        try {
          return btoa(atob(str)) === str;
        } catch (err) {
          return false;
        }
      }

      isUrl(string) {
        try {
          new URL(string);
          return true;
        } catch (_) {
          return false;
        }
      }

      isItemAccessible(item) {
        return true;
      }

      render() {
        let fItemMenu = this.isItemAccessible;
        if (
          WrappedComponent.prototype.hasOwnProperty("isMenuItemAccessible") ===
          true
        ) {
          fItemMenu = this.isMenuItemAccessible;
        }
        const horizontal = loadingProps.menuHorizontal;
        const Actions = this.getUserActions();
        const Links = this.getQuickLinks();
        const commands = this.getCommands();
        const ToolbarCenterContent = this.getToolbarCenterContent();
        const ToolbarEndContent = this.getToolbarEndContent();
        const MainMenu = this.getMainMenu();
        const Switch = this.getSwitch();
        let rightSidebar;
        if (
          WrappedComponent.prototype.hasOwnProperty("getRightSidebar") === true
        ) {
          rightSidebar = this.getRightSidebar();
        }
        let style = { width: "350px" };
        if (!this.state.menuOpened) {
          style = { width: "60px" };
        }

        let logo = loadingProps.logo;
        if (
          !this.state.menuOpened &&
          loadingProps.logoSmall &&
          !this.state.sidebarOpen
        ) {
          logo = loadingProps.logoSmall;
        }
        return (
          <AnterosMainLayout
            onSetOpenSidebar={this.onSetOpen}
            sidebarOpen={this.state.sidebarOpen}
            sidebarVisible={this.isSideBarVisible()}
            withoutScroll={loadingProps.withoutScroll}
            menuOpened={this.state.menuOpened}
            rightSidebar={rightSidebar}
            horizontalMenu={horizontal}
          >
            <AnterosNotificationContainer />
            <AnterosMainHeader
              horizontalMenu={horizontal}
              logoNormal={logo}
              onSetOpenSidebar={this.onSetOpen} 
              sidebarOpen={this.state.sidebarOpen}
              toolbarIconColor={loadingProps.toolbarIconColor}
              toolbarIconBackgroundColor={loadingProps.toolbarIconBackgroundColor}
              quickLinkHeaderColor={loadingProps.quickLinkHeaderColor}
              showInputSearch={loadingProps.showInputSearch}
              userName={
                this.props.authenticated ? this.props.user.profile.name : ""
              }
              email={
                this.props.authenticated ? this.props.user.profile.email : ""
              }
              avatarWidth={loadingProps.avatarWidth}
              avatarHeight={loadingProps.avatarHeight}
              onQuickLinkClick={this.onOpenQuickLinkMenu}
              commands={commands}
              avatar={this.props.authenticated ? this.getAvatar() : null}
            >
              {Actions ? <UserActions>{Actions}</UserActions> : null}

              {Links ? <QuickLinks>{Links}</QuickLinks> : null}
              
              <ToolbarCenter>{ToolbarCenterContent}</ToolbarCenter>
              <ToolbarEnd>{ToolbarEndContent}</ToolbarEnd>
            </AnterosMainHeader>

            {horizontal ? (
              <AnterosMainMenu>
                {MainMenu ? (
                  <MainMenu
                    user={this.props.user}
                    onChangeMenuFormat={this.onChangeMenuFormat}
                    isMenuItemAccessible={fItemMenu}
                    horizontal={true}
                    visible={this.isMainMenuVisible()}
                  />
                ) : null}
              </AnterosMainMenu>
            ) : (
              <AnterosSidebarContent
                visible={this.isSideBarVisible()}
                enableSidebarBackgroundImage={
                  loadingProps.enableSidebarBackgroundImage
                }
                logoNormal={logo}
                style={style}
                selectedSidebarImage={loadingProps.selectedSidebarImage}
              >
                {loadingProps.showUserBlock ? (
                  <AnterosUserBlock
                    userName={
                      this.props.authenticated
                        ? this.props.user.profile.name
                        : ""
                    }
                    email={
                      this.props.authenticated
                        ? this.props.user.profile.email
                        : ""
                    }
                    avatar={
                      this.props.authenticated
                        ? this.props.user.profile.avatar
                          ? this.props.user.profile.avatar
                          : loadingProps.defaultAvatar
                        : loadingProps.defaultAvatar
                    }
                  >
                    {Actions ? Actions : null}
                  </AnterosUserBlock>
                ) : null}
                {MainMenu ? (
                  <MainMenu
                    user={this.props.user}
                    onExpandMenu={this.onExpandMenu}
                    isMenuItemAccessible={fItemMenu}
                    onCollapseMenu={this.onCollapseMenu}
                    onChangeMenuFormat={this.onChangeMenuFormat}
                    withoutUserBlock={!loadingProps.showUserBlock}
                    menuOpened={this.state.menuOpened}
                    onSelectMenuItem={this.onSelectMenuItem}
                    visible={this.isMainMenuVisible()}
                  />
                ) : null}
              </AnterosSidebarContent>
            )}

            <AnterosMainContent>
            {/* <NavTab to="/home/business/cadastros/equipamento/consulta">Admins</NavTab>
            <NavTab to="/home/business/cadastros/pessoa/consulta">Moderators</NavTab>
            <NavTab to="/home/business/cadastros/produto/consulta">Users</NavTab> */}
              {Switch}
              <WrappedComponent
                {...this.props}
                ref={(ref) => (this.wrappedRef = ref)}
                state={this.state}
                user={this.props.user}
                ownerTemplate={this}
                history={this.props.history}
              />
            </AnterosMainContent>
            {this.props.children}
          </AnterosMainLayout>
        );
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(LayoutPrincipal);
  };
}
