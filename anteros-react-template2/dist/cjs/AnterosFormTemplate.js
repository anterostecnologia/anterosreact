"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnterosFormTemplate = void 0;
const react_1 = __importStar(require("react"));
const anteros_react_containers_1 = require("@anterostecnologia/anteros-react-containers");
const anteros_react_notification_1 = require("@anterostecnologia/anteros-react-notification");
const anteros_react_buttons_1 = require("@anterostecnologia/anteros-react-buttons");
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
const anteros_react_datasource_1 = require("@anterostecnologia/anteros-react-datasource");
const anteros_react_loaders_1 = require("@anterostecnologia/anteros-react-loaders");
const react_loader_spinner_1 = require("react-loader-spinner");
const anteros_react_layout_1 = require("@anterostecnologia/anteros-react-layout");
class AnterosFormTemplate extends react_1.Component {
    constructor(props) {
        super(props);
        (0, anteros_react_core_1.autoBind)(this);
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
                result.push(react_1.default.createElement("span", { style: {
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
            if (this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
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
            (0, anteros_react_core_1.AnterosSweetAlert)({
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
                        var result = _this.convertMessage((0, anteros_react_core_1.processErrorMessage)(error));
                        var debugMessage = (0, anteros_react_core_1.processDetailErrorMessage)(error);
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
            (0, anteros_react_core_1.AnterosSweetAlert)({
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
                    if (this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
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
            (0, anteros_react_core_1.AnterosSweetAlert)({
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
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(anteros_react_notification_1.AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 25000, onClose: this.onCloseAlert }, this.state.debugMessage ? (react_1.default.createElement("div", null,
                this.state.debugMessage ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "dtnDetail", circle: true, small: true, icon: "far fa-align-justify", onButtonClick: this.onDetailClick })) : null,
                this.state.alertMessage)) : (this.state.alertMessage)),
            react_1.default.createElement(anteros_react_loaders_1.AnterosBlockUi, { tagStyle: {
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
                }, tag: "div", blocking: this.state.loading || this.state.saving, message: messageLoading, loader: customLoader ? (customLoader) : (react_1.default.createElement(react_loader_spinner_1.TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: "#f2d335" })) },
                react_1.default.createElement(anteros_react_containers_1.AnterosForm, { id: this.props.formName },
                    this.props.children,
                    react_1.default.createElement(SaveCancelButtons, { readOnly: this.props.dataSource.getState() === "dsBrowse", onButtonClick: this.onButtonClick, routeSave: this.props.saveRoute, routeCancel: this.props.cancelRoute })))));
    }
}
exports.AnterosFormTemplate = AnterosFormTemplate;
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
class SaveCancelButtons extends react_1.Component {
    render() {
        return (react_1.default.createElement(anteros_react_layout_1.AnterosRow, { style: { marginTop: this.props.marginTop } },
            react_1.default.createElement(anteros_react_layout_1.AnterosCol, { className: "d-flex justify-content-end" }, this.props.readOnly ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnClose", route: this.props.routeCancel, style: {
                    marginRight: "8px",
                }, icon: "far fa-arrow-left", secondary: true, caption: "Voltar", onButtonClick: this.props.onButtonClick })) : (react_1.default.createElement(react_1.Fragment, null,
                react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnSave", route: this.props.routeSave, style: {
                        marginRight: "8px",
                    }, icon: "fal fa-save", success: true, caption: "Salvar", onButtonClick: this.props.onButtonClick }),
                react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnCancel", route: this.props.routeCancel, icon: "fa fa-ban", danger: true, caption: "Cancelar", onButtonClick: this.props.onButtonClick }))))));
    }
}
SaveCancelButtons.defaultProps = {
    disabled: false,
    readOnly: false,
    marginTop: "20px",
};
//# sourceMappingURL=AnterosFormTemplate.js.map