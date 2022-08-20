"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnterosMainLayoutTemplate = void 0;
const react_1 = __importStar(require("react"));
const anteros_react_admin_1 = require("@anterostecnologia/anteros-react-admin");
const anteros_react_notification_1 = require("@anterostecnologia/anteros-react-notification");
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
const react_addons_shallow_compare_1 = __importDefault(require("react-addons-shallow-compare"));
require("react-router-tabs/styles/react-router-tabs.css");
class AnterosMainLayoutTemplate extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: props.sidebarOpen,
            isSideBarVisible: true,
            menuOpened: false,
            update: Math.random(),
        };
        (0, anteros_react_core_1.autoBind)(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (0, react_addons_shallow_compare_1.default)(this, nextProps, nextState);
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
        return this.props.showUserBlock ? (react_1.default.createElement(anteros_react_admin_1.AnterosUserBlock, { userName: userName, email: email, avatar: avatar }, actions)) : null;
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
        return (react_1.default.createElement(anteros_react_admin_1.AnterosMainLayout, { onSetOpenSidebar: this.onSetOpen, sidebarOpen: this.state.sidebarOpen, sidebarVisible: this.props.isSideBarVisible, withoutScroll: this.props.withoutScroll, menuOpened: this.state.menuOpened, rightSidebar: rightSidebar, horizontalMenu: horizontal },
            react_1.default.createElement(anteros_react_notification_1.AnterosNotificationContainer, null),
            react_1.default.createElement(anteros_react_admin_1.AnterosMainHeader, { horizontalMenu: horizontal, logoNormal: logo, onSetOpenSidebar: this.onSetOpen, sidebarOpen: this.state.sidebarOpen, toolbarIconColor: this.props.toolbarIconColor, toolbarIconBackgroundColor: this.props.toolbarIconBackgroundColor, quickLinkHeaderColor: this.props.quickLinkHeaderColor, showInputSearch: this.props.showInputSearch, showToggleSidebar: this.props.showToggleSidebar, userName: this.props.authenticated ? this.props.user.name : "", email: this.props.authenticated ? this.props.user.email : "", avatarWidth: this.props.avatarWidth, avatarHeight: this.props.avatarHeight, commands: commands, avatar: this.props.authenticated ? this.getAvatar() : null },
                actions ? react_1.default.createElement(anteros_react_admin_1.UserActions, null, actions) : null,
                links ? react_1.default.createElement(anteros_react_admin_1.QuickLinks, null, links) : null,
                react_1.default.createElement(anteros_react_admin_1.ToolbarCenter, null, ToolbarCenterContent),
                react_1.default.createElement(anteros_react_admin_1.ToolbarEnd, null, ToolbarEndContent)),
            horizontal ? (react_1.default.createElement(anteros_react_admin_1.AnterosMainMenu, null, mainMenuHorizontal)) : (react_1.default.createElement(anteros_react_admin_1.AnterosSidebarContent, { visible: this.props.isSideBarVisible, enableSidebarBackgroundImage: this.props.enableSidebarBackgroundImage, logoNormal: logo, style: style, selectedSidebarImage: this.props.selectedSidebarImage },
                this.getUserBlock(actions),
                mainMenuVertical)),
            react_1.default.createElement(anteros_react_admin_1.AnterosMainContent, null,
                _switch,
                this.props.children)));
    }
}
exports.AnterosMainLayoutTemplate = AnterosMainLayoutTemplate;
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
//# sourceMappingURL=AnterosMainLayoutTemplate.js.map