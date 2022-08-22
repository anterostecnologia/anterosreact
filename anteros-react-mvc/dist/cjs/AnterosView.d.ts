import React, { Component, ReactNode } from "react";
import { RouteComponentProps } from "react-router";
import { UserData, AnterosEntity } from "@anterostecnologia/anteros-react-api2";
import { AnterosController } from "./AnterosController";
import { AnterosDatasource } from "@anterostecnologia/anteros-react-datasource";
export declare const ADD = "add";
export declare const EDIT = "edit";
export declare const VIEW = "view";
export declare const SEARCH = "search";
export interface AnterosViewProps<E extends AnterosEntity, TypeID> extends RouteComponentProps {
    user: UserData;
    controller: AnterosController<E, TypeID>;
    caption: string;
    needRefresh: boolean;
    dataSource: AnterosDatasource;
    currentFilter: any | undefined;
    activeFilterIndex: number;
    needUpdateView: boolean;
    setDatasource(dataSource: AnterosDatasource): any;
    setNeedRefresh(): void;
    hideTour(): any;
    setFilter(currentFilter: any, activeFilterIndex: number): any;
    loadingMessage: string;
    loading: boolean;
    loadingColor: string;
    loadingBackgroundColor: string;
}
export interface AnterosViewState {
    loading: boolean;
}
declare abstract class AnterosView<E extends AnterosEntity, TypeID, Props extends AnterosViewProps<E, TypeID>, State extends AnterosViewState> extends Component<Props, State> {
    private _controller;
    static defaultProps: {
        loadingMessage: string;
        loadingBackgroundColor: string;
        loadingColor: string;
    };
    constructor(props: Props);
    abstract getRouteName(): string;
    abstract getComponentSearch(props: any): ReactNode;
    abstract getComponentForm(props: any): ReactNode;
    abstract getCaption(): string;
    abstract onCloseView(): void;
    abstract isCloseViewEnabled(): boolean;
    getViewHeight(): any;
    showHideLoad(show: any): void;
    /**
     * Getter controller
     * @return {AnterosController<E,TypeID>}
     */
    get controller(): AnterosController<E, TypeID>;
    /**
     * Setter controller
     * @param {any} value
     */
    set controller(value: AnterosController<E, TypeID>);
    onResize(width: any, height: any): void;
    render(): ReactNode;
}
export { AnterosView };
export declare const connectViewWithStore: <E extends AnterosEntity, TypeID>(controller: AnterosController<E, TypeID>) => (ViewComponent: any) => import("react-redux").ConnectedComponent<React.FC<{}>, Omit<{}, never> & import("react-redux").ConnectProps>;
