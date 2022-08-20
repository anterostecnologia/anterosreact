import React, { Component, ReactNode } from "react";
import "react-router-tabs/styles/react-router-tabs.css";
import { AnterosDropdownMenuItem } from "@anterostecnologia/anteros-react-buttons";
import { Switch } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { UserData } from "@anterostecnologia/anteros-react-api2";
declare type CommandColor = {
    backgroundColor: string;
    color: string;
};
declare type CommandMenu = {
    id: any;
    command: Function;
    category: string;
    color: CommandColor;
    name: string;
};
interface MainLayoutProps extends RouteComponentProps {
    menuHorizontal: boolean;
    showUserBlock: boolean;
    layoutReducerName: string;
    logo: any | undefined;
    logoSmall: any | undefined;
    withoutScroll: boolean;
    enableSidebarBackgroundImage: boolean;
    avatarWidth: any;
    avatarHeight: any;
    toolbarIconColor: string;
    quickLinkHeaderColor: string;
    toolbarIconBackgroundColor: string;
    defaultAvatar: string | undefined;
    userActions: ReactNode | undefined;
    quickLinks: AnterosDropdownMenuItem[] | undefined;
    commands: CommandMenu[] | undefined;
    rightSidebar: ReactNode | undefined;
    selectedSidebarImage: any | undefined;
    switch: Switch;
    mainMenuHorizontal: ReactNode;
    mainMenuVertical: ReactNode;
    isSideBarVisible: boolean;
    isMainMenuVisible: boolean;
    toolbarEndContent: ReactNode | undefined;
    toolbarCenterContent: ReactNode | undefined;
    onDidMount: Function | undefined;
    user: UserData;
    authenticated: boolean;
    children: React.ReactNode | undefined;
    menuOpened: boolean;
    sidebarOpen: boolean;
    showToggleSidebar: boolean;
    showInputSearch: boolean;
}
interface MainLayoutTemplateState {
    sidebarOpen: boolean;
    isSideBarVisible: boolean;
    menuOpened: boolean;
    update: number;
}
declare class AnterosMainLayoutTemplate extends Component<MainLayoutProps, MainLayoutTemplateState> {
    static defaultProps: {
        showToggleSidebar: boolean;
        showInputSearch: boolean;
        sidebarOpen: boolean;
        menuHorizontal: boolean;
        showUserBlock: boolean;
        layoutReducerName: string;
        logoSmall: undefined;
        withoutScroll: boolean;
        avatarWidth: string;
        avatarHeight: string;
        toolbarIconColor: string;
        quickLinkHeaderColor: string;
        toolbarIconBackgroundColor: string;
        enableSidebarBackgroundImage: boolean;
        onDidMount: () => void;
        setNeedUpdateView: undefined;
        logo: undefined;
        defaultAvatar: undefined;
        userActions: undefined;
        quickLinks: undefined;
        rightSidebar: undefined;
        selectedSidebarImage: undefined;
        toolbarCenterContent: undefined;
        children: undefined;
        menuOpened: boolean;
        isMenuItemAccessible: () => boolean;
        authenticated: boolean;
    };
    constructor(props: MainLayoutProps);
    shouldComponentUpdate(nextProps: any, nextState: any): any;
    componentDidMount(): void;
    componentWillReceiveProps(_nextProps: MainLayoutProps): void;
    onSelectMenuItem(menuItem: any): void;
    onSetOpen(open: any): void;
    onChangeMenuFormat(opened: any): void;
    toggleScreenFull(): void;
    getAvatar(): string | undefined;
    isBase64(str: any): boolean;
    isUrl(string: any): boolean;
    getUserBlock(actions: ReactNode): ReactNode;
    render(): JSX.Element;
}
export { AnterosMainLayoutTemplate };
export type { CommandMenu, CommandColor };
