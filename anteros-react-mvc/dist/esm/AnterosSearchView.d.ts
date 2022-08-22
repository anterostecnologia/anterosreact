import React, { Component, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { UserData, AnterosEntity } from "@anterostecnologia/anteros-react-api2";
import { AnterosController } from "./AnterosController";
import { AnterosDatasource } from "@anterostecnologia/anteros-react-datasource";
import { ModalSize } from "@anterostecnologia/anteros-react-template2";
export declare const ADD = "add";
export declare const EDIT = "edit";
export declare const VIEW = "view";
export declare const SEARCH = "search";
export interface AnterosSearchViewProps<E extends AnterosEntity, TypeID> {
    user: UserData;
    controller?: AnterosController<E, TypeID>;
    viewName: string;
    needRefresh: boolean;
    dataSource: AnterosDatasource;
    currentFilter: any | undefined;
    activeFilterIndex: number;
    needUpdateView: boolean;
    isOpenModal: boolean;
    modalSize?: ModalSize;
    setDatasource(dataSource: AnterosDatasource): any;
    hideTour(): any;
    setFilter(currentFilter: any, activeFilterIndex: number): any;
    history: RouteComponentProps["history"];
    onClickOk(event: any, selectedRecords: any): void;
    onClickCancel(event: any): void;
}
declare abstract class AnterosSearchView<E extends AnterosEntity, TypeID> extends Component<AnterosSearchViewProps<E, TypeID>> {
    private _controller;
    static defaultProps: {
        modalSize: ModalSize;
        isOpenModal: boolean;
        needUpdateView: boolean;
    };
    constructor(props: AnterosSearchViewProps<E, TypeID>);
    abstract getRouteName(): string;
    abstract getComponentSearch(props: any): ReactNode;
    abstract getCaption(): string;
    abstract onCloseView(): void;
    abstract isCloseViewEnabled(): boolean;
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
    render(): ReactNode;
}
export { AnterosSearchView };
export declare const connectSearchViewWithStore: <E extends AnterosEntity, TypeID>(controller: AnterosController<E, TypeID>) => (ViewComponent: any) => import("react-redux").ConnectedComponent<React.FC<{}>, Omit<{}, never> & import("react-redux").ConnectProps>;
