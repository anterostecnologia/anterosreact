import React, { Component } from "react";
import { AnterosMainContent, AnterosSidebarContent, AnterosMainLayout, AnterosMainMenu, AnterosUserBlock, AnterosMainHeader, UserActions, QuickLinks, ToolbarEnd, ToolbarCenter, } from "@anterostecnologia/anteros-react-admin";
import { AnterosNotificationContainer } from "@anterostecnologia/anteros-react-notification";
import { autoBind } from "@anterostecnologia/anteros-react-core";
import shallowCompare from "react-addons-shallow-compare";
import "react-router-tabs/styles/react-router-tabs.css";
class AnterosMainLayoutTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: props.sidebarOpen,
            isSideBarVisible: true,
            menuOpened: false,
            update: Math.random(),
        };
        autoBind(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }
    componentDidMount() {
        if (this.props.onDidMount) {
            this.props.onDidMount();
        }
    }
    componentWillReceiveProps(_nextProps) {
        let element = document.getElementById("_divRenderPageMainLayout");
        if (element) {
            setTimeout(() => {
                element.style.height = "calc(100vh - 70px)";
                this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), menuOpened: _nextProps.menuOpened }));
            }, 200);
        }
        else {
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), menuOpened: _nextProps.menuOpened }));
        }
    }
    onSelectMenuItem(menuItem) {
        this.props.history.push(menuItem.props.route);
    }
    onSetOpen(open) {
        this.setState(Object.assign(Object.assign({}, this.state), { sidebarOpen: open, update: Math.random() }));
    }
    onChangeMenuFormat(opened) {
        this.setState(Object.assign(Object.assign({}, this.state), { menuOpened: opened, update: Math.random() }));
    }
    toggleScreenFull() {
        if (document.fullscreenElement && document.fullscreenElement !== null) {
            // Entra no modo full screen
            document.documentElement.requestFullscreen();
        }
        else {
            // Sai do modo full screen
            document.exitFullscreen();
        }
    }
    getAvatar() {
        if (this.props.user.avatar) {
            if (this.isBase64(this.props.user.avatar)) {
                if (this.isUrl(atob(this.props.user.avatar))) {
                    return atob(this.props.user.avatar);
                }
                else {
                    return "data:image;base64," + this.props.user.avatar;
                }
            }
            else {
                return this.props.user.avatar;
            }
        }
        else {
            return this.props.defaultAvatar;
        }
    }
    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        }
        catch (err) {
            return false;
        }
    }
    isUrl(string) {
        try {
            new URL(string);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    getUserBlock(actions) {
        const email = this.props.authenticated ? this.props.user.email : "";
        const userName = this.props.authenticated ? this.props.user.name : "";
        let avatar = this.props.defaultAvatar;
        if (this.props.authenticated) {
            avatar = this.props.user.avatar
                ? this.props.user.avatar
                : this.props.defaultAvatar;
        }
        return this.props.showUserBlock ? (React.createElement(AnterosUserBlock, { userName: userName, email: email, avatar: avatar }, actions)) : null;
    }
    render() {
        const horizontal = this.props.menuHorizontal;
        const actions = this.props.userActions;
        const links = this.props.quickLinks;
        const commands = this.props.commands;
        const ToolbarCenterContent = this.props.toolbarCenterContent;
        const ToolbarEndContent = this.props.toolbarEndContent;
        const mainMenuHorizontal = this.props.mainMenuHorizontal;
        const mainMenuVertical = this.props.mainMenuVertical;
        const _switch = this.props.switch;
        let rightSidebar = this.props.rightSidebar;
        let style = { width: "350px" };
        if (!this.state.menuOpened) {
            style = { width: "60px" };
        }
        let logo = this.props.logo;
        if (!this.state.menuOpened &&
            this.props.logoSmall &&
            !this.state.sidebarOpen) {
            logo = this.props.logoSmall;
        }
        return (React.createElement(AnterosMainLayout, { onSetOpenSidebar: this.onSetOpen, sidebarOpen: this.state.sidebarOpen, sidebarVisible: this.props.isSideBarVisible, withoutScroll: this.props.withoutScroll, menuOpened: this.state.menuOpened, rightSidebar: rightSidebar, horizontalMenu: horizontal },
            React.createElement(AnterosNotificationContainer, null),
            React.createElement(AnterosMainHeader, { horizontalMenu: horizontal, logoNormal: logo, onSetOpenSidebar: this.onSetOpen, sidebarOpen: this.state.sidebarOpen, toolbarIconColor: this.props.toolbarIconColor, toolbarIconBackgroundColor: this.props.toolbarIconBackgroundColor, quickLinkHeaderColor: this.props.quickLinkHeaderColor, showInputSearch: this.props.showInputSearch, showToggleSidebar: this.props.showToggleSidebar, userName: this.props.authenticated ? this.props.user.name : "", email: this.props.authenticated ? this.props.user.email : "", avatarWidth: this.props.avatarWidth, avatarHeight: this.props.avatarHeight, commands: commands, avatar: this.props.authenticated ? this.getAvatar() : null },
                actions ? React.createElement(UserActions, null, actions) : null,
                links ? React.createElement(QuickLinks, null, links) : null,
                React.createElement(ToolbarCenter, null, ToolbarCenterContent),
                React.createElement(ToolbarEnd, null, ToolbarEndContent)),
            horizontal ? (React.createElement(AnterosMainMenu, null, mainMenuHorizontal)) : (React.createElement(AnterosSidebarContent, { visible: this.props.isSideBarVisible, enableSidebarBackgroundImage: this.props.enableSidebarBackgroundImage, logoNormal: logo, style: style, selectedSidebarImage: this.props.selectedSidebarImage },
                this.getUserBlock(actions),
                mainMenuVertical)),
            React.createElement(AnterosMainContent, null,
                _switch,
                this.props.children)));
    }
}
AnterosMainLayoutTemplate.defaultProps = {
    showToggleSidebar: true,
    showInputSearch: true,
    sidebarOpen: false,
    menuHorizontal: false,
    showUserBlock: true,
    layoutReducerName: "layoutReducer",
    logoSmall: undefined,
    withoutScroll: true,
    avatarWidth: "42px",
    avatarHeight: "42px",
    toolbarIconColor: "white",
    quickLinkHeaderColor: "blue",
    toolbarIconBackgroundColor: "rgb(255,255,255,0.2",
    enableSidebarBackgroundImage: false,
    onDidMount: () => { },
    setNeedUpdateView: undefined,
    logo: undefined,
    defaultAvatar: undefined,
    userActions: undefined,
    quickLinks: undefined,
    rightSidebar: undefined,
    selectedSidebarImage: undefined,
    toolbarCenterContent: undefined,
    children: undefined,
    menuOpened: false,
    isMenuItemAccessible: () => {
        return true;
    },
    authenticated: false,
};
export { AnterosMainLayoutTemplate };
//# sourceMappingURL=AnterosMainLayoutTemplate.js.map