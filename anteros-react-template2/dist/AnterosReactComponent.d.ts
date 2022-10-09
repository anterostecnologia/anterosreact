import { Component } from "react";
export interface AnterosReactComponentProps {
}
export interface AnterosReactComponentState {
}
export declare abstract class AnterosReactComponent<AnterosReactComponentProps, AnterosReactComponentState, SS = any> extends Component<AnterosReactComponentProps, AnterosReactComponentState, SS> {
    private datasourceEvents;
    constructor(props: AnterosReactComponentProps);
    registerDatasourceEvent(ds: any, event: any, fn: any): void;
    componentWillUnmount(): void;
    getPhoto(value: any, defaultImg: any): any;
    getProduct(value: any): any;
    isBase64(str: any): boolean;
    isUrl(string: any): boolean;
    onLookupError(error: any): void;
    onStartLookupData(item: any): void;
    onFinishedLookupData(_item: any): void;
    hasOnDataSource(value: any, datasource: any, field: any, subfield: any): boolean;
    defaulInsertValueOnDataSource(datasource: any, field: any, value: any): void;
    checkAndInsertOnDataSource(records: any, datasource: any, field: any, subfield: any, callback: any): void;
}
