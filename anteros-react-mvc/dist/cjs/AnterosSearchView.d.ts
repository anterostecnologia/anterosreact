import { Component, ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { UserData, AnterosEntity } from "@anterostecnologia/anteros-react-api2";
import { AnterosController } from "./AnterosController";
import { AnterosDatasource } from "@anterostecnologia/anteros-react-datasource";
import { ModalSize } from "@anterostecnologia/anteros-react-template2";
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
    parameters?: any;
}
export interface AnterosSearchViewState {
}
declare abstract class AnterosSearchView<E extends AnterosEntity, TypeID, Props extends AnterosSearchViewProps<E, TypeID>, State extends AnterosSearchViewState> extends Component<Props, State> {
    private _controller;
    static defaultProps: {
        modalSize: ModalSize;
        isOpenModal: boolean;
        needUpdateView: boolean;
    };
    constructor(props: Props);
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
export declare function makeDefaultReduxPropsSearchView(controller: any): {
    mapStateToProps: (state: any) => {
        dataSource: any;
        currentFilter: undefined;
        activeFilterIndex: number;
        user: any;
        needRefresh: boolean;
        needUpdateView: boolean;
        controller: any;
    };
    mapDispatchToProps: (dispatch: any) => {
        setDatasource: (dataSource: any) => void;
        hideTour: () => void;
        setFilter: (currentFilter: any, activeFilterIndex: any) => void;
    };
};
