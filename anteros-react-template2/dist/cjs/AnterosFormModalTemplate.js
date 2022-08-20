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
exports.AnterosFormModalTemplate = exports.ModalSize = void 0;
const react_1 = __importStar(require("react"));
const anteros_react_containers_1 = require("@anterostecnologia/anteros-react-containers");
const anteros_react_notification_1 = require("@anterostecnologia/anteros-react-notification");
const anteros_react_buttons_1 = require("@anterostecnologia/anteros-react-buttons");
const anteros_react_datasource_1 = require("@anterostecnologia/anteros-react-datasource");
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
const anteros_react_api2_1 = require("@anterostecnologia/anteros-react-api2");
var ModalSize;
(function (ModalSize) {
    ModalSize[ModalSize["extrasmall"] = 0] = "extrasmall";
    ModalSize[ModalSize["small"] = 1] = "small";
    ModalSize[ModalSize["medium"] = 2] = "medium";
    ModalSize[ModalSize["large"] = 3] = "large";
    ModalSize[ModalSize["semifull"] = 4] = "semifull";
    ModalSize[ModalSize["full"] = 5] = "full";
})(ModalSize = exports.ModalSize || (exports.ModalSize = {}));
class AnterosFormModalTemplate extends react_1.Component {
    constructor(props) {
        super(props);
        (0, anteros_react_core_1.autoBind)(this);
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
            this._dataSource = new anteros_react_datasource_1.AnterosRemoteDatasource();
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
            this._dataSource.addEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
        }
    }
    componentDidMount() {
        if (this.props.withInternalDatasource &&
            this.props.onCustomCreateDatasource) {
            if (!this._dataSource.isOpen()) {
                this._dataSource.open(this.props.remoteResource.actions.findAll(0, this.props.pageSize, this.props.fieldsToForceLazy));
            }
            if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                this._dataSource.cancel();
            }
        }
        if (this.props.onDidMount) {
            this.props.onDidMount();
        }
    }
    componentWillUnmount() {
        if (this._dataSource) {
            this._dataSource.removeEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
            if (this._dataSource instanceof anteros_react_datasource_1.AnterosRemoteDatasource) {
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
    onDatasourceEvent(event, error) {
        let loading = this.state.loading;
        if (event === anteros_react_datasource_1.dataSourceEvents.BEFORE_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.BEFORE_GOTO_PAGE) {
            loading = true;
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.AFTER_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.AFTER_GOTO_PAGE ||
            event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            if (this.props.setDatasource) {
                this.props.setDatasource(this._dataSource);
            }
            loading = false;
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.AFTER_INSERT) {
            //
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            if (error) {
                var result = this.convertMessage((0, anteros_react_api2_1.processErrorMessage)(error));
                var detailMessage = (0, anteros_react_api2_1.processDetailErrorMessage)(error);
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
            return (react_1.default.createElement(react_1.Fragment, null,
                this._dataSource.getState() !== "dsBrowse" ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { success: true, id: "btnOK", onClick: this.onClick, disabled: this.state.saving }, "OK")) : null,
                " ",
                react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { danger: true, id: "btnCancel", onClick: this.onClick, disabled: this.state.saving }, "Cancela")));
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
                            this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                            if (this.props.onAfterSave) {
                                if (!this.props.onAfterSave()) {
                                    return;
                                }
                            }
                            this.props.onClickOk(event);
                        }
                    })
                        .catch((error) => {
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, alertMessage: (0, anteros_react_api2_1.processErrorMessage)(error), saving: false }));
                    });
                }
                else if (result) {
                    this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "", saving: false }));
                    if (this._dataSource &&
                        this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
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
                    this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
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
            (0, anteros_react_core_1.AnterosSweetAlert)({
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
        return (react_1.default.createElement(anteros_react_containers_1.AnterosModal, Object.assign({ id: "modal" + this.props.viewName, title: this.props.caption, primary: true }, modalSize, { showHeaderColor: true, showContextIcon: false, style: {
                height: this.props.modalContentHeight,
                width: this.props.modalContentWidth,
            }, isOpen: this.props.isOpenModal }),
            react_1.default.createElement(anteros_react_notification_1.AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 15000 }, this.state.detailMessage ? (react_1.default.createElement("div", null,
                this.state.detailMessage ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "dtnDetail", circle: true, small: true, icon: "far fa-align-justify", onButtonClick: this.onDetailClick })) : null,
                this.state.alertMessage)) : (this.state.alertMessage)),
            react_1.default.createElement(anteros_react_containers_1.ModalActions, null, this.getButtons()),
            this.props.children));
    }
}
exports.AnterosFormModalTemplate = AnterosFormModalTemplate;
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