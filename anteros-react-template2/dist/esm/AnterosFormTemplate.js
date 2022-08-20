import React, { Component, Fragment } from "react";
import { AnterosForm } from "@anterostecnologia/anteros-react-containers";
import { AnterosAlert } from "@anterostecnologia/anteros-react-notification";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosSweetAlert, processErrorMessage, processDetailErrorMessage, autoBind, } from "@anterostecnologia/anteros-react-core";
import { dataSourceConstants, } from "@anterostecnologia/anteros-react-datasource";
import { AnterosBlockUi } from "@anterostecnologia/anteros-react-loaders";
import { TailSpin } from "react-loader-spinner";
import { AnterosRow, AnterosCol, } from "@anterostecnologia/anteros-react-layout";
class AnterosFormTemplate extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {
            alertIsOpen: false,
            alertMessage: "",
            saving: false,
            messageLoader: props.messageSaving,
            debugMessage: undefined,
            loading: false,
        };
    }
    convertMessage(alertMessage) {
        if (alertMessage.constructor === Array) {
            let result = Array();
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
    onButtonClick(_event, button) {
        let _this = this;
        if (button.props.id === "btnClose") {
            if (this.props.onBeforeClose) {
                if (!this.props.onBeforeClose()) {
                    return;
                }
            }
            if (this.props.onCustomClose) {
                this.props.onCustomClose();
                return;
            }
            if (this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                this.props.dataSource.cancel();
            }
            this.props.history.push(button.props.route);
        }
        else if (button.props.id === "btnSave") {
            if (this.props.onBeforeSave) {
                if (!this.props.onBeforeSave()) {
                    return;
                }
            }
            if (this.props.onCustomSave) {
                this.props.onCustomSave();
                return;
            }
            AnterosSweetAlert({
                title: "Deseja salvar ?",
                text: "",
                type: "question",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                focusCancel: false,
            })
                .then(() => {
                this.setState(Object.assign(Object.assign({}, _this.state), { saving: true }));
                this.props.dataSource.post((error) => {
                    if (error) {
                        var result = _this.convertMessage(processErrorMessage(error));
                        var debugMessage = processDetailErrorMessage(error);
                        this.setState(Object.assign(Object.assign({}, _this.state), { alertIsOpen: true, alertMessage: result, debugMessage: debugMessage === "" ? undefined : debugMessage, saving: false }));
                    }
                    else {
                        if (this.props.onAfterSave) {
                            if (!this.props.onAfterSave()) {
                                return;
                            }
                        }
                        this.setState(Object.assign(Object.assign({}, _this.state), { alertIsOpen: false, alertMessage: "", saving: false }));
                        if (this.props.forceRefresh && this.props.setNeedRefresh) {
                            this.props.setNeedRefresh();
                        }
                        this.props.history.push(button.props.route);
                    }
                });
            })
                .catch(function (_reason) {
                // quando apertar o botao "cancelar" cai aqui. Apenas ignora. (sem processamento necessario)
            });
        }
        else if (button.props.id === "btnCancel") {
            if (this.props.onBeforeCancel) {
                if (!this.props.onBeforeCancel()) {
                    return;
                }
            }
            if (this.props.onCustomCancel) {
                this.props.onCustomCancel();
                return;
            }
            AnterosSweetAlert({
                title: "Deseja cancelar ?",
                text: "",
                type: "question",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                focusCancel: true,
            })
                .then((isConfirm) => {
                if (isConfirm) {
                    if (this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                        this.props.dataSource.cancel();
                    }
                    if (this.props.onAfterCancel) {
                        if (!this.props.onAfterCancel()) {
                            return;
                        }
                    }
                    this.props.history.push(button.props.route);
                }
            })
                .catch(function (_reason) {
                // quando apertar o botao "cancelar" cai aqui. Apenas ignora. (sem processamento necessario)
            });
        }
    }
    autoCloseAlert() {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "" }));
    }
    onCloseAlert() {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "" }));
    }
    onDetailClick(_event, _button) {
        if (this.state.debugMessage) {
            AnterosSweetAlert({
                title: "Detalhes do erro",
                html: "<b>" + this.state.debugMessage + "</b>",
                width: "1000px",
            });
        }
    }
    componentDidMount() {
        if (this.props.onDidMount) {
            this.props.onDidMount();
        }
    }
    componentWillUnmount() {
        if (this.props.onWillUnmount) {
            this.props.onWillUnmount();
        }
        this.props.hideTour();
    }
    update(newState) {
        this.setState(Object.assign(Object.assign({}, this.state), newState));
    }
    render() {
        const messageLoading = this.props.onCustomMessageLoading
            ? this.props.onCustomMessageLoading()
            : this.state.saving
                ? this.props.messageLoading
                : "Salvando...";
        const customLoader = this.props.onCustomLoader
            ? this.props.onCustomLoader()
            : null;
        return (React.createElement(React.Fragment, null,
            React.createElement(AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 25000, onClose: this.onCloseAlert }, this.state.debugMessage ? (React.createElement("div", null,
                this.state.debugMessage ? (React.createElement(AnterosButton, { id: "dtnDetail", circle: true, small: true, icon: "far fa-align-justify", onButtonClick: this.onDetailClick })) : null,
                this.state.alertMessage)) : (this.state.alertMessage)),
            React.createElement(AnterosBlockUi, { tagStyle: {
                    height: "100%",
                }, styleBlockMessage: {
                    border: "2px solid white",
                    width: "200px",
                    height: "80px",
                    padding: "8px",
                    backgroundColor: "rgb(56 70 112)",
                    borderRadius: "8px",
                    color: "white",
                }, styleOverlay: {
                    opacity: 0.1,
                    backgroundColor: "black",
                }, tag: "div", blocking: this.state.loading || this.state.saving, message: messageLoading, loader: customLoader ? (customLoader) : (React.createElement(TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: "#f2d335" })) },
                React.createElement(AnterosForm, { id: this.props.formName },
                    this.props.children,
                    React.createElement(SaveCancelButtons, { readOnly: this.props.dataSource.getState() === "dsBrowse", onButtonClick: this.onButtonClick, routeSave: this.props.saveRoute, routeCancel: this.props.cancelRoute })))));
    }
}
AnterosFormTemplate.defaultProps = {
    messageSaving: "Aguarde... salvando.",
    forceRefresh: true,
    messageLoading: "Por favor aguarde...",
    fieldsToForceLazy: "",
    defaultSortFields: "",
    positionUserActions: "first",
    userActions: undefined,
    setNeedRefresh: undefined,
};
class SaveCancelButtons extends Component {
    render() {
        return (React.createElement(AnterosRow, { style: { marginTop: this.props.marginTop } },
            React.createElement(AnterosCol, { className: "d-flex justify-content-end" }, this.props.readOnly ? (React.createElement(AnterosButton, { id: "btnClose", route: this.props.routeCancel, style: {
                    marginRight: "8px",
                }, icon: "far fa-arrow-left", secondary: true, caption: "Voltar", onButtonClick: this.props.onButtonClick })) : (React.createElement(Fragment, null,
                React.createElement(AnterosButton, { id: "btnSave", route: this.props.routeSave, style: {
                        marginRight: "8px",
                    }, icon: "fal fa-save", success: true, caption: "Salvar", onButtonClick: this.props.onButtonClick }),
                React.createElement(AnterosButton, { id: "btnCancel", route: this.props.routeCancel, icon: "fa fa-ban", danger: true, caption: "Cancelar", onButtonClick: this.props.onButtonClick }))))));
    }
}
SaveCancelButtons.defaultProps = {
    disabled: false,
    readOnly: false,
    marginTop: "20px",
};
export { AnterosFormTemplate };
//# sourceMappingURL=AnterosFormTemplate.js.map