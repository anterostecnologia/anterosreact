import React, { Component, ReactNode } from "react";
import { AnterosDatasource } from "@anterostecnologia/anteros-react-datasource";
import { IAnterosRemoteResource, AnterosEntity } from "@anterostecnologia/anteros-react-api2";
export declare enum ModalSize {
    extrasmall = 0,
    small = 1,
    medium = 2,
    large = 3,
    semifull = 4,
    full = 5
}
export interface AnterosFormModalTemplateProps<T extends AnterosEntity, TypeID> {
    withInternalDatasource: boolean;
    openMainDataSource: boolean;
    pageSize: number;
    requireSelectRecord: boolean;
    fieldsToForceLazy: string;
    modalSize: ModalSize;
    modalContentHeight: string;
    modalContentWidth: string;
    viewName: string;
    caption: string;
    isOpenModal: boolean;
    setDatasource?(dataSource: AnterosDatasource): void;
    onCustomCreateDatasource?(): AnterosDatasource;
    onDidMount?(): void;
    onWillUnmount?(): void;
    onCustomButtons?(): ReactNode;
    onAfterSave?(): boolean;
    onClickOk(event: any): void;
    onClickCancel(event: any): void;
    onBeforeOk?(event: any): any;
    remoteResource?: IAnterosRemoteResource<T, TypeID>;
    dataSource: AnterosDatasource;
}
export interface AnterosFormModalTemplateState {
    alertIsOpen: boolean;
    saving: boolean;
    loading: boolean;
    alertMessage: string | undefined;
    detailMessage: string | undefined;
    modalOpen: string | undefined;
    modalCallback: any | undefined;
    update: number;
}
export declare class AnterosFormModalTemplate<T extends AnterosEntity, TypeID> extends Component<AnterosFormModalTemplateProps<T, TypeID>, AnterosFormModalTemplateState> {
    static defaultProps: {
        withInternalDatasource: boolean;
        openMainDataSource: boolean;
        pageSize: number;
        requireSelectRecord: boolean;
        fieldsToForceLazy: string;
        modalSize: ModalSize;
        modalContentHeight: string;
        modalContentWidth: string;
    };
    private _dataSource;
    constructor(props: AnterosFormModalTemplateProps<T, TypeID>);
    createMainDataSource(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    convertMessage(alertMessage: any): any;
    onDatasourceEvent(event: any, error: any): void;
    autoCloseAlert(): void;
    getButtons(): React.ReactNode;
    onClick(event: any, button: any): void;
    onDetailClick(_event: any, _button: any): void;
    render(): ReactNode;
}
