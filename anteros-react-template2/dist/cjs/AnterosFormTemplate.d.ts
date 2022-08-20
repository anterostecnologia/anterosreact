import { Component } from "react";
import { AnterosDatasource } from "@anterostecnologia/anteros-react-datasource";
import { RouteComponentProps } from "react-router";
interface AnterosFormTemplateState {
    debugMessage: string | undefined;
    alertIsOpen: boolean;
    alertMessage: string;
    saving: boolean;
    loading: boolean;
    messageLoader: string;
}
interface AnterosFormTemplateProps {
    formName: string;
    caption: string;
    messageLoading: string | undefined;
    messageSaving: string;
    forceRefresh: boolean;
    onAfterCancel?: Function | undefined;
    onAfterSave?: Function | undefined;
    onBeforeCancel?: Function | undefined;
    onBeforeClose?: Function | undefined;
    onBeforeSave?: Function | undefined;
    onDidMount?: Function | undefined;
    onWillUnmount?: Function | undefined;
    onCustomClose?: Function | undefined;
    onCustomSave?: Function | undefined;
    onCustomCancel?: Function | undefined;
    onCustomMessageLoading?: Function | undefined;
    onCustomLoader?: Function | undefined;
    dataSource: AnterosDatasource;
    history: RouteComponentProps["history"];
    hideTour: Function;
    setNeedRefresh: Function | undefined;
    saveRoute: string;
    cancelRoute: string;
}
declare class AnterosFormTemplate extends Component<AnterosFormTemplateProps, AnterosFormTemplateState> {
    static defaultProps: {
        messageSaving: string;
        forceRefresh: boolean;
        messageLoading: string;
        fieldsToForceLazy: string;
        defaultSortFields: string;
        positionUserActions: string;
        userActions: undefined;
        setNeedRefresh: undefined;
    };
    constructor(props: AnterosFormTemplateProps);
    convertMessage(alertMessage: any): any;
    onButtonClick(_event: any, button: any): void;
    autoCloseAlert(): void;
    onCloseAlert(): void;
    onDetailClick(_event: any, _button: any): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    update(newState: any): void;
    render(): JSX.Element;
}
export { AnterosFormTemplate };
