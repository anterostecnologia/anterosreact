import { Component } from "react";
export interface AnterosFormComponentProps {
}
export interface AnterosFormComponentState {
    modalOpen: string | undefined;
    lookup: any | undefined;
    alertIsOpen: boolean | undefined;
    alertMessage: string | undefined;
    fieldName: string | undefined;
}
export declare abstract class AnterosFormComponent<AnterosFormComponentProps, AnterosFormComponentState, SS = any> extends Component<AnterosFormComponentProps, AnterosFormComponentState, SS> {
    private _datasourceEvents;
    constructor(props: AnterosFormComponentProps);
    registerDatasourceEvent(ds: any, event: any, fn: any): void;
    componentWillUnmount(): void;
    getPhoto(value: any, defaultImg: any): any;
    getPhotoProduct(value: any): any;
    isBase64(str: any): boolean;
    isUrl(string: any): boolean;
    hasOnDataSource(value: any, datasource: any, field: any, subfield: any): boolean;
    defaulInsertValueOnDataSource(datasource: any, field: any, value: any): void;
    checkAndInsertOnDataSource(records: any, datasource: any, field: any, subfield: any, callback: any): void;
    onLookupError(error: any): void;
    onStartLookupData(item: any): void;
    onFinishedLookupData(_item: any): void;
}
