import React, { Component, Fragment } from "react";
import { AnterosModal, ModalActions, } from "@anterostecnologia/anteros-react-containers";
import { AnterosAlert } from "@anterostecnologia/anteros-react-notification";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosRemoteDatasource, dataSourceEvents, dataSourceConstants, DATASOURCE_EVENTS, } from "@anterostecnologia/anteros-react-datasource";
import { autoBind, AnterosSweetAlert, } from "@anterostecnologia/anteros-react-core";
import { processErrorMessage, processDetailErrorMessage, } from "@anterostecnologia/anteros-react-api2";
export var ModalSize;
(function (ModalSize) {
    ModalSize[ModalSize["extrasmall"] = 0] = "extrasmall";
    ModalSize[ModalSize["small"] = 1] = "small";
    ModalSize[ModalSize["medium"] = 2] = "medium";
    ModalSize[ModalSize["large"] = 3] = "large";
    ModalSize[ModalSize["semifull"] = 4] = "semifull";
    ModalSize[ModalSize["full"] = 5] = "full";
})(ModalSize || (ModalSize = {}));
export class AnterosFormModalTemplate extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
        if (props.withInternalDatasource) {
            this.createMainDataSource();
        }
        else {
            if (this.props.dataSource) {
                this._dataSource = this.props.dataSource;
            }
        }
        this.state = {
            alertIsOpen: false,
            saving: false,
            loading: false,
            alertMessage: "",
            detailMessage: undefined,
            modalOpen: "",
            modalCallback: null,
            update: Math.random(),
        };
    }
    createMainDataSource() {
        if (this.props.remoteResource) {
            this._dataSource = new AnterosRemoteDatasource();
            this._dataSource.setAjaxPostConfigHandler((entity) => {
                return this.props.remoteResource.actions.post(entity);
            });
            this._dataSource.setValidatePostResponse((response) => {
                return response.data !== undefined;
            });
            this._dataSource.setAjaxDeleteConfigHandler((entity) => {
                return this.props.remoteResource.actions.delete(entity);
            });
            this._dataSource.setValidateDeleteResponse((response) => {
                return response.data !== undefined;
            });
            this._dataSource.addEventListener(DATASOURCE_EVENTS, this.onDatasourceEvent);
        }
    }
    componentDidMount() {
        if (this.props.withInternalDatasource &&
            this.props.onCustomCreateDatasource) {
            if (!this._dataSource.isOpen()) {
                this._dataSource.open(this.props.remoteResource.actions.findAll(0, this.props.pageSize, this.props.fieldsToForceLazy));
            }
            if (this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                this._dataSource.cancel();
            }
        }
        if (this.props.onDidMount) {
            this.props.onDidMount();
        }
    }
    componentWillUnmount() {
        if (this._dataSource) {
            this._dataSource.removeEventListener(DATASOURCE_EVENTS, this.onDatasourceEvent);
            if (this._dataSource instanceof AnterosRemoteDatasource) {
                this._dataSource.setAjaxPageConfigHandler(null);
            }
        }
        if (this.props.onWillUnmount) {
            this.props.onWillUnmount();
        }
    }
    convertMessage(alertMessage) {
        if (alertMessage.constructor === Array) {
            let result = new Array();
            alertMessage.forEach((item, index) => {
                result.push(React.createElement("span", { style: {
                        whiteSpace: "pre",
                    }, key: index }, item + "\n"));
            });
            return result;
        }
        else {
            return alertMessage;
        }
    }
    onDatasourceEvent(event, error) {
        let loading = this.state.loading;
        if (event === dataSourceEvents.BEFORE_OPEN ||
            event === dataSourceEvents.BEFORE_GOTO_PAGE) {
            loading = true;
        }
        if (event === dataSourceEvents.AFTER_OPEN ||
            event === dataSourceEvents.AFTER_GOTO_PAGE ||
            event === dataSourceEvents.ON_ERROR) {
            if (this.props.setDatasource) {
                this.props.setDatasource(this._dataSource);
            }
            loading = false;
        }
        if (event === dataSourceEvents.AFTER_INSERT) {
            //
        }
        if (event === dataSourceEvents.ON_ERROR) {
            if (error) {
                var result = this.convertMessage(processErrorMessage(error));
                var detailMessage = processDetailErrorMessage(error);
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, loading: false, detailMessage: detailMessage === "" ? undefined : detailMessage, alertMessage: result }));
            }
        }
        else {
            this.setState(Object.assign(Object.assign({}, this.state), { loading, update: Math.random() }));
        }
    }
    autoCloseAlert() {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "" }));
    }
    getButtons() {
        if (this.props.onCustomButtons) {
            return this.props.onCustomButtons();
        }
        else {
            return (React.createElement(Fragment, null,
                this._dataSource.getState() !== "dsBrowse" ? (React.createElement(AnterosButton, { success: true, id: "btnOK", onClick: this.onClick, disabled: this.state.saving }, "OK")) : null,
                " ",
                React.createElement(AnterosButton, { danger: true, id: "btnCancel", onClick: this.onClick, disabled: this.state.saving }, "Cancela")));
        }
    }
    onClick(event, button) {
        if (button.props.id === "btnOK") {
            this.setState(Object.assign(Object.assign({}, this.state), { saving: true }));
            if (this.props.onBeforeOk) {
                let result = this.props.onBeforeOk(event);
                if (result instanceof Promise) {
                    result
                        .then((_response) => {
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "", saving: false }));
                        if (this._dataSource &&
                            this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                            if (this.props.onAfterSave) {
                                if (!this.props.onAfterSave()) {
                                    return;
                                }
                            }
                            this.props.onClickOk(event);
                        }
                    })
                        .catch((error) => {
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, alertMessage: processErrorMessage(error), saving: false }));
                    });
                }
                else if (result) {
                    this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "", saving: false }));
                    if (this._dataSource &&
                        this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                        this._dataSource.post((error) => {
                            if (!error) {
                                if (this.props.onAfterSave) {
                                    if (!this.props.onAfterSave()) {
                                        return;
                                    }
                                }
                                this.props.onClickOk(event);
                            }
                        });
                    }
                }
                else {
                    this.setState(Object.assign(Object.assign({}, this.state), { saving: false }));
                }
            }
            else {
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "", saving: false }));
                if (this._dataSource &&
                    this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                    this._dataSource.post((error) => {
                        if (!error) {
                            if (this.props.onAfterSave) {
                                if (this.props.onAfterSave()) {
                                    return;
                                }
                            }
                            this.props.onClickOk(event);
                        }
                    });
                }
            }
        }
        else if (button.props.id === "btnCancel") {
            this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "", saving: false }));
            if (this._dataSource && this._dataSource.getState() !== "dsBrowse") {
                this._dataSource.cancel();
            }
            this.props.onClickCancel(event);
        }
    }
    onDetailClick(_event, _button) {
        if (this.state.detailMessage) {
            AnterosSweetAlert({
                title: "Detalhes do erro",
                html: "<b>" + this.state.detailMessage + "</b>",
            });
        }
    }
    render() {
        let modalSize = {};
        if (this.props.modalSize === ModalSize.extrasmall) {
            modalSize = { extraSmall: true };
        }
        else if (this.props.modalSize === ModalSize.small) {
            modalSize = { small: true };
        }
        else if (this.props.modalSize === ModalSize.medium) {
            modalSize = { medium: true };
        }
        else if (this.props.modalSize === ModalSize.large) {
            modalSize = { large: true };
        }
        else if (this.props.modalSize === ModalSize.semifull) {
            modalSize = { semifull: true };
        }
        else if (this.props.modalSize === ModalSize.full) {
            modalSize = { full: true };
        }
        return (React.createElement(AnterosModal, Object.assign({ id: "modal" + this.props.viewName, title: this.props.caption, primary: true }, modalSize, { showHeaderColor: true, showContextIcon: false, style: {
                height: this.props.modalContentHeight,
                width: this.props.modalContentWidth,
            }, isOpen: this.props.isOpenModal }),
            React.createElement(AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 15000 }, this.state.detailMessage ? (React.createElement("div", null,
                this.state.detailMessage ? (React.createElement(AnterosButton, { id: "dtnDetail", circle: true, small: true, icon: "far fa-align-justify", onButtonClick: this.onDetailClick })) : null,
                this.state.alertMessage)) : (this.state.alertMessage)),
            React.createElement(ModalActions, null, this.getButtons()),
            this.props.children));
    }
}
AnterosFormModalTemplate.defaultProps = {
    withInternalDatasource: false,
    openMainDataSource: false,
    pageSize: 30,
    requireSelectRecord: false,
    fieldsToForceLazy: "",
    modalSize: ModalSize.large,
    modalContentHeight: "",
    modalContentWidth: "",
};
//# sourceMappingURL=AnterosFormModalTemplate.js.map