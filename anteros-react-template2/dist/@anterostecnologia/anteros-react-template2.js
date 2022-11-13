(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@anterostecnologia/anteros-react-template2", [], factory);
	else if(typeof exports === 'object')
		exports["@anterostecnologia/anteros-react-template2"] = factory();
	else
		root["@anterostecnologia/anteros-react-template2"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/AnterosFormComponent.tsx":
/*!**************************************!*\
  !*** ./src/AnterosFormComponent.tsx ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosFormComponent = void 0;
const react_1 = __webpack_require__(/*! react */ "react");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
class AnterosFormComponent extends react_1.Component {
    constructor(props) {
        super(props);
        this._datasourceEvents = [];
    }
    registerDatasourceEvent(ds, event, fn) {
        ds.addEventListener(event, fn);
        this._datasourceEvents.push({ ds, event, fn });
    }
    componentWillUnmount() {
        this._datasourceEvents.map((record) => {
            record.ds.removeEventListener(record.event, record.fn);
            return null;
        });
    }
    getPhoto(value, defaultImg) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value);
                }
                else {
                    return "data:image;base64," + value;
                }
            }
            else {
                return value;
            }
        }
        else {
            return defaultImg;
        }
    }
    getPhotoProduct(value) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value);
                }
                else {
                    return "data:image;base64," + value;
                }
            }
            else {
                return value;
            }
        }
        else {
            return "https://via.placeholder.com/150x150.png?text=Sem+foto";
        }
    }
    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        }
        catch (err) {
            return false;
        }
    }
    isUrl(string) {
        try {
            new URL(string);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    hasOnDataSource(value, datasource, field, subfield) {
        for (let index = 0; index < datasource.getData().length; index++) {
            const data = datasource.getData()[index];
            if (data[field]) {
                if (subfield) {
                    if (data[field][subfield] === value[subfield]) {
                        return true;
                    }
                }
                else if (data[field] === value[field]) {
                    return true;
                }
            }
        }
        return false;
    }
    defaulInsertValueOnDataSource(datasource, field, value) {
        datasource.setFieldByName(field, value);
    }
    checkAndInsertOnDataSource(records, datasource, field, subfield, callback) {
        let _this = this;
        records.forEach((record, _indice) => {
            if (!_this.hasOnDataSource(record, datasource, field, subfield)) {
                if (callback) {
                    callback(datasource, field, record);
                }
                else {
                    this.defaulInsertValueOnDataSource(datasource, field, record);
                }
            }
            else {
                (0, anteros_react_core_1.AnterosSweetAlert)({
                    title: "Item já foi inserido!",
                    text: "",
                    type: "warning",
                });
            }
        });
    }
    onLookupError(error) {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, alertMessage: error }));
    }
    onStartLookupData(item) {
        this.setState(Object.assign(Object.assign({}, this.state), { lookup: item.props.userData }));
    }
    onFinishedLookupData(_item) {
        this.setState(Object.assign(Object.assign({}, this.state), { lookup: "" }));
    }
}
exports.AnterosFormComponent = AnterosFormComponent;


/***/ }),

/***/ "./src/AnterosFormModalTemplate.tsx":
/*!******************************************!*\
  !*** ./src/AnterosFormModalTemplate.tsx ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosFormModalTemplate = exports.ModalSize = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const anteros_react_containers_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_notification_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-notification */ "@anterostecnologia/anteros-react-notification");
const anteros_react_buttons_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-buttons */ "@anterostecnologia/anteros-react-buttons");
const anteros_react_datasource_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-datasource */ "@anterostecnologia/anteros-react-datasource");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const anteros_react_api2_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-api2 */ "@anterostecnologia/anteros-react-api2");
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
            this._dataSource = new anteros_react_datasource_1.AnterosRemoteDatasource('ds' + this.props.viewName);
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


/***/ }),

/***/ "./src/AnterosFormTemplate.tsx":
/*!*************************************!*\
  !*** ./src/AnterosFormTemplate.tsx ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosFormTemplate = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const anteros_react_containers_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_notification_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-notification */ "@anterostecnologia/anteros-react-notification");
const anteros_react_buttons_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-buttons */ "@anterostecnologia/anteros-react-buttons");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const anteros_react_datasource_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-datasource */ "@anterostecnologia/anteros-react-datasource");
const anteros_react_loaders_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-loaders */ "@anterostecnologia/anteros-react-loaders");
const react_loader_spinner_1 = __webpack_require__(/*! react-loader-spinner */ "react-loader-spinner");
const anteros_react_layout_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-layout */ "@anterostecnologia/anteros-react-layout");
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
                this.setState(Object.assign(Object.assign({}, this.state), { saving: true }));
                this.props.dataSource.post((error) => {
                    if (error) {
                        var result = this.convertMessage((0, anteros_react_core_1.processErrorMessage)(error));
                        var debugMessage = (0, anteros_react_core_1.processDetailErrorMessage)(error);
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, alertMessage: result, debugMessage: debugMessage === "" ? undefined : debugMessage, saving: false }));
                    }
                    else {
                        if (this.props.onAfterSave) {
                            if (!this.props.onAfterSave()) {
                                return;
                            }
                        }
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, alertMessage: "", saving: false }));
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
                    this.props.saveRoute ? react_1.default.createElement(SaveCancelButtons, { readOnly: this.props.dataSource.getState() === "dsBrowse", onButtonClick: this.onButtonClick, routeSave: this.props.saveRoute, routeCancel: this.props.cancelRoute }) : null))));
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


/***/ }),

/***/ "./src/AnterosMainLayoutTemplate.tsx":
/*!*******************************************!*\
  !*** ./src/AnterosMainLayoutTemplate.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosMainLayoutTemplate = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const anteros_react_admin_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-admin */ "@anterostecnologia/anteros-react-admin");
const anteros_react_notification_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-notification */ "@anterostecnologia/anteros-react-notification");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const react_addons_shallow_compare_1 = __importDefault(__webpack_require__(/*! react-addons-shallow-compare */ "react-addons-shallow-compare"));
__webpack_require__(/*! react-router-tabs/styles/react-router-tabs.css */ "react-router-tabs/styles/react-router-tabs.css");
class AnterosMainLayoutTemplate extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: props.sidebarOpen,
            isSideBarVisible: true,
            menuOpened: false,
            update: Math.random(),
        };
        (0, anteros_react_core_1.autoBind)(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (0, react_addons_shallow_compare_1.default)(this, nextProps, nextState);
    }
    componentDidMount() {
        if (this.props.onDidMount) {
            this.props.onDidMount();
        }
    }
    componentWillReceiveProps(_nextProps) {
        let element = document.getElementById("_divRenderPageMainLayout");
        if (element) {
            setTimeout(() => {
                element.style.height = "calc(100vh - 70px)";
                this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), menuOpened: _nextProps.menuOpened }));
            }, 200);
        }
        else {
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), menuOpened: _nextProps.menuOpened }));
        }
    }
    onSelectMenuItem(menuItem) {
        this.props.history.push(menuItem.props.route);
    }
    onSetOpen(open) {
        this.setState(Object.assign(Object.assign({}, this.state), { sidebarOpen: open, update: Math.random() }));
    }
    onChangeMenuFormat(opened) {
        this.setState(Object.assign(Object.assign({}, this.state), { menuOpened: opened, update: Math.random() }));
    }
    toggleScreenFull() {
        if (document.fullscreenElement && document.fullscreenElement !== null) {
            // Entra no modo full screen
            document.documentElement.requestFullscreen();
        }
        else {
            // Sai do modo full screen
            document.exitFullscreen();
        }
    }
    getAvatar() {
        if (this.props.user.avatar) {
            if (this.isBase64(this.props.user.avatar)) {
                if (this.isUrl(atob(this.props.user.avatar))) {
                    return atob(this.props.user.avatar);
                }
                else {
                    return "data:image;base64," + this.props.user.avatar;
                }
            }
            else {
                return this.props.user.avatar;
            }
        }
        else {
            return this.props.defaultAvatar;
        }
    }
    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        }
        catch (err) {
            return false;
        }
    }
    isUrl(string) {
        try {
            new URL(string);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    getUserBlock(actions) {
        const email = this.props.authenticated ? this.props.user.email : "";
        const userName = this.props.authenticated ? this.props.user.name : "";
        let avatar = this.props.defaultAvatar;
        if (this.props.authenticated) {
            avatar = this.props.user.avatar
                ? this.props.user.avatar
                : this.props.defaultAvatar;
        }
        return this.props.showUserBlock ? (react_1.default.createElement(anteros_react_admin_1.AnterosUserBlock, { userName: userName, email: email, avatar: avatar }, actions)) : null;
    }
    render() {
        const horizontal = this.props.menuHorizontal;
        const actions = this.props.userActions;
        const links = this.props.quickLinks;
        const commands = this.props.commands;
        const ToolbarCenterContent = this.props.toolbarCenterContent;
        const ToolbarEndContent = this.props.toolbarEndContent;
        const mainMenuHorizontal = this.props.mainMenuHorizontal;
        const mainMenuVertical = this.props.mainMenuVertical;
        const _switch = this.props.switch;
        let rightSidebar = this.props.rightSidebar;
        let style = { width: "350px" };
        if (!this.state.menuOpened) {
            style = { width: "60px" };
        }
        let logo = this.props.logo;
        if (!this.state.menuOpened &&
            this.props.logoSmall &&
            !this.state.sidebarOpen) {
            logo = this.props.logoSmall;
        }
        return (react_1.default.createElement(anteros_react_admin_1.AnterosMainLayout, { onSetOpenSidebar: this.onSetOpen, sidebarOpen: this.state.sidebarOpen, sidebarVisible: this.props.isSideBarVisible, withoutScroll: this.props.withoutScroll, menuOpened: this.state.menuOpened, rightSidebar: rightSidebar, horizontalMenu: horizontal },
            react_1.default.createElement(anteros_react_notification_1.AnterosNotificationContainer, null),
            react_1.default.createElement(anteros_react_admin_1.AnterosMainHeader, { horizontalMenu: horizontal, logoNormal: logo, onSetOpenSidebar: this.onSetOpen, sidebarOpen: this.state.sidebarOpen, toolbarIconColor: this.props.toolbarIconColor, toolbarIconBackgroundColor: this.props.toolbarIconBackgroundColor, quickLinkHeaderColor: this.props.quickLinkHeaderColor, showInputSearch: this.props.showInputSearch, showToggleSidebar: this.props.showToggleSidebar, userName: this.props.authenticated ? this.props.user.name : "", email: this.props.authenticated ? this.props.user.email : "", avatarWidth: this.props.avatarWidth, avatarHeight: this.props.avatarHeight, commands: commands, avatar: this.props.authenticated ? this.getAvatar() : null },
                actions ? react_1.default.createElement(anteros_react_admin_1.UserActions, null, actions) : null,
                links ? react_1.default.createElement(anteros_react_admin_1.QuickLinks, null, links) : null,
                react_1.default.createElement(anteros_react_admin_1.ToolbarCenter, null, ToolbarCenterContent),
                react_1.default.createElement(anteros_react_admin_1.ToolbarEnd, null, ToolbarEndContent)),
            horizontal ? (react_1.default.createElement(anteros_react_admin_1.AnterosMainMenu, null, mainMenuHorizontal)) : (react_1.default.createElement(anteros_react_admin_1.AnterosSidebarContent, { visible: this.props.isSideBarVisible, enableSidebarBackgroundImage: this.props.enableSidebarBackgroundImage, logoNormal: logo, style: style, selectedSidebarImage: this.props.selectedSidebarImage },
                this.getUserBlock(actions),
                mainMenuVertical)),
            react_1.default.createElement(anteros_react_admin_1.AnterosMainContent, null,
                _switch,
                this.props.children)));
    }
}
exports.AnterosMainLayoutTemplate = AnterosMainLayoutTemplate;
AnterosMainLayoutTemplate.defaultProps = {
    showToggleSidebar: true,
    showInputSearch: true,
    sidebarOpen: false,
    menuHorizontal: false,
    showUserBlock: true,
    layoutReducerName: "layoutReducer",
    logoSmall: undefined,
    withoutScroll: true,
    avatarWidth: "42px",
    avatarHeight: "42px",
    toolbarIconColor: "white",
    quickLinkHeaderColor: "blue",
    toolbarIconBackgroundColor: "rgb(255,255,255,0.2",
    enableSidebarBackgroundImage: false,
    onDidMount: () => { },
    setNeedUpdateView: undefined,
    logo: undefined,
    defaultAvatar: undefined,
    userActions: undefined,
    quickLinks: undefined,
    rightSidebar: undefined,
    selectedSidebarImage: undefined,
    toolbarCenterContent: undefined,
    children: undefined,
    menuOpened: false,
    isMenuItemAccessible: () => {
        return true;
    },
    authenticated: false,
};


/***/ }),

/***/ "./src/AnterosMasonryTemplate.tsx":
/*!****************************************!*\
  !*** ./src/AnterosMasonryTemplate.tsx ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosMasonryTemplate = exports.MasonryTemplateActions = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const react_loader_spinner_1 = __webpack_require__(/*! react-loader-spinner */ "react-loader-spinner");
const anteros_react_datasource_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-datasource */ "@anterostecnologia/anteros-react-datasource");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const anteros_react_querybuilder_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-querybuilder */ "@anterostecnologia/anteros-react-querybuilder");
const anteros_react_containers_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_loaders_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-loaders */ "@anterostecnologia/anteros-react-loaders");
const anteros_react_layout_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-layout */ "@anterostecnologia/anteros-react-layout");
const anteros_react_navigation_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-navigation */ "@anterostecnologia/anteros-react-navigation");
const anteros_react_notification_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-notification */ "@anterostecnologia/anteros-react-notification");
const anteros_react_buttons_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-buttons */ "@anterostecnologia/anteros-react-buttons");
const anteros_react_label_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-label */ "@anterostecnologia/anteros-react-label");
const react_addons_shallow_compare_1 = __importDefault(__webpack_require__(/*! react-addons-shallow-compare */ "react-addons-shallow-compare"));
const lodash_1 = __webpack_require__(/*! lodash */ "lodash");
const anteros_react_masonry_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-masonry */ "@anterostecnologia/anteros-react-masonry");
class AnterosMasonryTemplate extends react_1.Component {
    constructor(props) {
        super(props);
        (0, anteros_react_core_1.autoBind)(this);
        this._dataSourceFilter = this.createDataSourceFilter(props);
        if (props.onCustomCreateDatasource) {
            this._dataSource = props.onCustomCreateDatasource();
        }
        if (!this._dataSource) {
            this.createMainDataSource();
        }
        if (this._dataSource instanceof anteros_react_datasource_1.AnterosRemoteDatasource) {
            this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        }
        this._dataSource.addEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
        this.state = {
            dataSource: [],
            alertIsOpen: false,
            alertMessage: "",
            loading: false,
            width: undefined,
            newHeight: undefined,
            filterExpanded: false,
            update: Math.random(),
            selectedItem: undefined,
        };
    }
    createDataSourceFilter(props) {
        return anteros_react_querybuilder_1.AnterosQueryBuilderData.createDatasource(props.viewName, props.filterName, props.version);
    }
    getUser() {
        let result;
        if (this.props.onCustomUser) {
            result = this.props.onCustomUser();
        }
        else {
            result = this.props.user;
        }
        return result;
    }
    createMainDataSource() {
        if (this.props.dataSource) {
            this._dataSource = this.props.dataSource;
            if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                this._dataSource.cancel();
            }
        }
        else {
            this._dataSource = new anteros_react_datasource_1.AnterosRemoteDatasource();
            this._dataSource.setAjaxPostConfigHandler((entity) => {
                return this.props.remoteResource.save(entity);
            });
            this._dataSource.setValidatePostResponse((response) => {
                return response.data !== undefined;
            });
            this._dataSource.setAjaxDeleteConfigHandler((entity) => {
                return this.props.remoteResource.delete(entity);
            });
            this._dataSource.setValidateDeleteResponse((response) => {
                return response.data !== undefined;
            });
        }
        this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        this._dataSource.addEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
    }
    componentDidMount() {
        setTimeout(() => {
            if (this.props.openMainDataSource) {
                if (!this._dataSource.isOpen()) {
                    this._dataSource.open(this.getData(this.props.currentFilter, 0));
                }
                else if (this.props.needRefresh) {
                    this._dataSource.open(this.getData(this.props.currentFilter, this._dataSource.getCurrentPage()));
                }
                if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                    this._dataSource.cancel();
                }
            }
            if (this.props.onDidMount) {
                this.props.onDidMount();
            }
        }, 100);
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
        this.props.hideTour();
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (0, react_addons_shallow_compare_1.default)(this, nextProps, nextState);
    }
    onFilterChanged(filter, activeFilterIndex, callback = lodash_1.noop) {
        this.props.setFilter(filter, activeFilterIndex);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }), callback);
    }
    onToggleExpandedFilter(expanded) {
        this.setState(Object.assign(Object.assign({}, this.state), { filterExpanded: expanded, update: Math.random() }));
    }
    onSelectedFilter(filter, index) {
        this.props.setFilter(filter, index);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }));
    }
    onBeforePageChanged(_currentPage, _newPage) {
        //
    }
    handlePageChanged(_newPage) {
        //
    }
    getSortFields() {
        if (this.props.withFilter &&
            this.props.currentFilter &&
            this.props.currentFilter.sort) {
            return this.props.currentFilter.sort.quickFilterSort;
        }
        return this.props.defaultSortFields;
    }
    onDatasourceEvent(event, error) {
        if (event === anteros_react_datasource_1.dataSourceEvents.BEFORE_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.BEFORE_GOTO_PAGE) {
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: true }));
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.BEFORE_POST) {
            if (this.props.onBeforePost) {
                this.props.onBeforePost();
            }
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.AFTER_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.AFTER_GOTO_PAGE ||
            event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            this.props.setDatasource(this._dataSource);
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: false }));
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.AFTER_INSERT) {
            if (this.props.onAfterInsert) {
                this.props.onAfterInsert();
            }
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            if (error) {
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, loading: false, update: Math.random(), alertMessage: (0, anteros_react_core_1.processErrorMessage)(error) }));
            }
        }
    }
    onButtonClick(event, button) {
        if (button.props.id === "btnView") {
            if (this.props.onCustomActionView) {
                if (this.props.onCustomActionView(button.props.route)) {
                    return;
                }
            }
        }
        else if (button.props.id === "btnAdd") {
            if (this.props.onCustomActionAdd) {
                if (this.props.onCustomActionAdd(button.props.route)) {
                    return;
                }
            }
            if (this.props.onBeforeInsert) {
                this.props.onBeforeInsert();
            }
            if (!this._dataSource.isOpen())
                this._dataSource.open();
            this._dataSource.insert();
        }
        else if (button.props.id === "btnEdit") {
            if (this.props.onCustomActionEdit) {
                if (this.props.onCustomActionEdit(button.props.route)) {
                    return;
                }
            }
            if (this.props.onBeforeEdit) {
                if (!this.props.onBeforeEdit()) {
                    return;
                }
            }
            this._dataSource.locate({ [this.props.fieldId]: button.props.idRecord });
            this._dataSource.edit();
        }
        else if (button.props.id === "btnRemove") {
            if (this.props.onBeforeRemove) {
                if (!this.props.onBeforeRemove()) {
                    return;
                }
            }
            this._dataSource.locate({ [this.props.fieldId]: button.props.idRecord });
            (0, anteros_react_core_1.AnterosSweetAlert)({
                title: "Deseja remover ?",
                text: "",
                type: "question",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                focusCancel: true,
            })
                .then(() => {
                this._dataSource.delete((error) => {
                    if (error) {
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, update: Math.random(), alertMessage: (0, anteros_react_core_1.processErrorMessage)(error) }));
                    }
                });
            })
                .catch((_error) => { });
        }
        else if (button.props.id === "btnClose") {
            if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, update: Math.random(), alertMessage: "Salve ou cancele os dados antes de sair" }));
                return;
            }
        }
        if (this.props.onButtonClick) {
            this.props.onButtonClick(event, button);
        }
        if (button.props.route) {
            this.props.history.push(button.props.route);
        }
    }
    onSearchByFilter() {
        this.onShowHideLoad(true);
        this._dataSource.open(this.getData(this.props.currentFilter, 0), () => {
            this.onShowHideLoad(false);
        });
    }
    getData(currentFilter, page) {
        if (currentFilter &&
            currentFilter.filter.filterType === anteros_react_querybuilder_1.QUICK &&
            currentFilter.filter.quickFilterText &&
            currentFilter.filter.quickFilterText !== "") {
            return this.getDataWithQuickFilter(currentFilter, page);
        }
        else if (currentFilter &&
            (currentFilter.filter.filterType === anteros_react_querybuilder_1.NORMAL ||
                currentFilter.filter.filterType === anteros_react_querybuilder_1.ADVANCED)) {
            return this.getDataWithFilter(currentFilter, page);
        }
        else {
            return this.getDataWithoutFilter(page);
        }
    }
    getDataWithFilter(currentFilter, page) {
        var filter = new anteros_react_querybuilder_1.AnterosFilterDSL();
        filter.buildFrom(currentFilter.filter, currentFilter.sort);
        let filterStr = filter.toJSON();
        let result = undefined;
        if (filterStr) {
            if (this.props.onCustomFindWithFilter) {
                result = this.props.onCustomFindWithFilter(filter.toJSON(), page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
            }
            if (!result) {
                result = this.props.remoteResource.findWithFilter(filter.toJSON(), page, this.props.pageSize, this.props.fieldsToForceLazy);
            }
        }
        else {
            result = this.getDataWithoutFilter(page);
        }
        return result;
    }
    getDataWithoutFilter(page) {
        let result = undefined;
        if (this.props.onCustomFindAll) {
            return this.props.onCustomFindAll(page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        if (!result) {
            result = this.props.remoteResource.findAll(page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy, undefined);
        }
        return result;
    }
    getDataWithQuickFilter(currentFilter, page) {
        let result = undefined;
        if (this.props.onCustomFindMultipleFields) {
            result = this.props.onCustomFindMultipleFields(currentFilter.filter.quickFilterText, currentFilter.filter.quickFilterFieldsText, 0, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        if (!result) {
            return this.props.remoteResource.findMultipleFields(currentFilter.filter.quickFilterText, currentFilter.filter.quickFilterFieldsText, page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        return result;
    }
    pageConfigHandler(page) {
        return this.getData(this.props.currentFilter, page);
    }
    onCloseAlert() {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, update: Math.random(), alertMessage: "" }));
    }
    onShowHideLoad(show) {
        this.setState(Object.assign(Object.assign({}, this.state), { loading: show, update: Math.random() }));
    }
    handleOnSelectRecord(row, data, tableId) {
        if (this.props.onSelectRecord) {
            this.props.onSelectRecord(row, data, tableId);
        }
    }
    handleOnUnselectRecord(row, data, tableId) {
        if (this.props.onUnselectRecord) {
            this.props.onUnselectRecord(row, data, tableId);
        }
    }
    handleOnSelectAllRecords(records, tableId) {
        if (this.props.onSelectAllRecords) {
            this.props.onSelectAllRecords(records, tableId);
        }
    }
    handleOnUnselectAllRecords(tableId) {
        if (this.props.onUnselectAllRecords) {
            this.props.onUnselectAllRecords(tableId);
        }
    }
    onResize(width, height) {
        let newHeight = height - 120;
        if (this._tableRef) {
            this._tableRef.resize("100%", newHeight);
        }
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), width: width, newHeight: newHeight }));
    }
    onSelectedItem(item) {
        this.setState(Object.assign(Object.assign({}, this.state), { selectedItem: this.state.selectedItem &&
                item[this.props.fieldId] === this.state.selectedItem[this.props.fieldId]
                ? null
                : item }));
    }
    createItems() {
        let itemsProps;
        if (this.props.getCustomItemsProps) {
            itemsProps = this.props.getCustomItemsProps();
        }
        if (!itemsProps) {
            itemsProps = {};
        }
        let ViewItem = this.props.viewItemComponent;
        let result = new Array();
        for (var i = 0; i < this._dataSource.getData().length; i++) {
            let r = this._dataSource.getData()[i];
            result.push(react_1.default.createElement(ViewItem, Object.assign({ selected: this.state.selectedItem
                    ? this.state.selectedItem[this.props.fieldId] ===
                        r[this.props.fieldId]
                    : false, onSelectedItem: this.onSelectedItem, key: r[this.props.fieldId], record: r, dispatch: this.props.dispatch, history: this.props.history, onButtonClick: this.onButtonClick }, itemsProps)));
        }
        return result;
    }
    changeState(state, callback) {
        if (callback) {
            this.setState(Object.assign(Object.assign(Object.assign({}, this.state), state), { update: Math.random() }), callback);
        }
        else {
            this.setState(Object.assign(Object.assign(Object.assign({}, this.state), state), { update: Math.random() }));
        }
    }
    render() {
        let modals = undefined;
        if (this.props.getModals) {
            modals = this.props.getModals();
        }
        let customLoader = undefined;
        let messageLoading;
        if (this.props.getCustomLoader) {
            customLoader = this.props.getCustomLoader();
        }
        if (this.props.getCustomMessageLoading) {
            messageLoading = this.props.getCustomMessageLoading();
        }
        if (!messageLoading) {
            messageLoading = this.props.messageLoading;
        }
        return (react_1.default.createElement(react_1.Fragment, null,
            react_1.default.createElement(anteros_react_core_1.AnterosResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize }),
            react_1.default.createElement(anteros_react_notification_1.AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 15000, onClose: this.onCloseAlert }, this.state.alertMessage),
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
                }, tag: "div", blocking: this.state.loading, message: messageLoading, loader: customLoader ? (customLoader) : (react_1.default.createElement(react_loader_spinner_1.TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: "#f2d335" })) },
                this.props.withFilter ? (react_1.default.createElement("div", { style: {
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-between",
                    } },
                    react_1.default.createElement("div", { style: {
                            width: "calc(100%)",
                        } },
                        react_1.default.createElement(UserActions, { dataSource: this._dataSource, onButtonClick: this.onButtonClick, routes: this.props.routes, allowRemove: this.props.allowRemove, labelButtonAdd: this.props.labelButtonAdd, labelButtonEdit: this.props.labelButtonEdit, labelButtonRemove: this.props.labelButtonRemove, labelButtonSelect: this.props.labelButtonSelect, labelButtonView: this.props.labelButtonView, positionUserActions: this.props.positionUserActions
                                ? this.props.positionUserActions
                                : "first", userActions: this.props.userActions })),
                    react_1.default.createElement(anteros_react_querybuilder_1.AnterosQueryBuilder, { zIndex: 50, id: this.props.filterName, formName: this.props.viewName, ref: (ref) => (this._filterRef = ref), expandedFilter: this.state.filterExpanded, update: this.state.update, dataSource: this._dataSourceFilter, currentFilter: this.props.currentFilter, activeFilterIndex: this.props.activeFilterIndex, onSelectedFilter: this.onSelectedFilter, onFilterChanged: this.onFilterChanged, onSearchByFilter: this.onSearchByFilter, onToggleExpandedFilter: this.onToggleExpandedFilter, width: "660px", height: "170px", allowSort: true, disabled: this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE }, this.props.fieldsFilter))) : (react_1.default.createElement("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    } },
                    react_1.default.createElement(UserActions, { dataSource: this._dataSource, onButtonClick: this.onButtonClick, routes: this.props.routes, allowRemove: this.props.allowRemove, labelButtonAdd: this.props.labelButtonAdd, labelButtonEdit: this.props.labelButtonEdit, labelButtonRemove: this.props.labelButtonRemove, labelButtonSelect: this.props.labelButtonSelect, labelButtonView: this.props.labelButtonView, positionUserActions: this.props.positionUserActions
                            ? this.props.positionUserActions
                            : "first", userActions: this.props.userActions }))),
                this.props.children,
                react_1.default.createElement(anteros_react_masonry_1.AnterosMasonry, { className: "versatil-grid-layout", elementType: "ul", id: "masonry" + this.props.viewName, options: {
                        transitionDuration: 0,
                        gutter: 10,
                        horizontalOrder: true,
                        isOriginLeft: true,
                    }, disableImagesLoaded: false, updateOnEachImageLoad: false }, !this._dataSource.isEmpty() ? this.createItems() : null)),
            react_1.default.createElement(anteros_react_containers_1.FooterActions, { className: "versatil-card-footer" },
                react_1.default.createElement(anteros_react_layout_1.AnterosRow, { className: "row justify-content-start align-items-center" },
                    react_1.default.createElement(anteros_react_layout_1.AnterosCol, { medium: 4 },
                        react_1.default.createElement(anteros_react_label_1.AnterosLabel, { caption: `Total ${this.props.caption} ${this._dataSource.getGrandTotalRecords()}` })),
                    react_1.default.createElement(anteros_react_layout_1.AnterosCol, { medium: 7 },
                        react_1.default.createElement(anteros_react_navigation_1.AnterosPagination, { horizontalEnd: true, dataSource: this._dataSource, visiblePages: 8, onBeforePageChanged: this.onBeforePageChanged, onPageChanged: this.handlePageChanged })))),
            modals));
    }
}
exports.AnterosMasonryTemplate = AnterosMasonryTemplate;
AnterosMasonryTemplate.defaultProps = {
    openDataSourceFilter: true,
    openMainDataSource: true,
    messageLoading: "Por favor aguarde...",
    withFilter: true,
    fieldsToForceLazy: "",
    defaultSortFields: "",
    labelButtonAdd: "Adicionar",
    labelButtonEdit: "Editar",
    labelButtonRemove: "Remover",
    labelButtonSelect: "Selecionar",
    labelButtonView: "Visualizar",
    positionUserActions: "first",
    userActions: undefined,
    fieldId: "id",
    allowRemove: true,
};
class UserActions extends react_1.Component {
    getLabelButtonEdit() {
        return this.props.labelButtonEdit ? this.props.labelButtonEdit : "Editar";
    }
    getLabelButtonRemove() {
        return this.props.labelButtonRemove
            ? this.props.labelButtonRemove
            : "Remover";
    }
    getLabelButtonAdd() {
        return this.props.labelButtonAdd ? this.props.labelButtonAdd : "Adicionar";
    }
    getLabelButtonView() {
        return this.props.labelButtonView
            ? this.props.labelButtonView
            : "Visualizar";
    }
    render() {
        return (react_1.default.createElement("div", { style: { display: "flex" } },
            this.props.positionUserActions === "first"
                ? this.props.userActions
                : null,
            this.props.routes.edit ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnView", route: this.props.routes.edit, icon: "fal fa-eye", small: true, className: "versatil-btn-visualizar", caption: this.getLabelButtonView(), hint: this.getLabelButtonView(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE })) : null,
            this.props.routes.add ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnAdd", route: this.props.routes.add, icon: "fal fa-plus", small: true, className: "versatil-btn-adicionar", caption: this.getLabelButtonAdd(), hint: this.getLabelButtonAdd(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE })) : null,
            this.props.routes.edit ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnEdit", route: this.props.routes.edit, icon: "fal fa-pencil", small: true, className: "versatil-btn-editar", caption: this.getLabelButtonEdit(), hint: this.getLabelButtonEdit(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE })) : null,
            this.props.allowRemove ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnRemove", icon: "fal fa-trash", disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE, small: true, caption: this.getLabelButtonRemove(), hint: this.getLabelButtonRemove(), className: "versatil-btn-remover", onButtonClick: this.props.onButtonClick })) : null,
            " ",
            this.props.positionUserActions === "last"
                ? this.props.userActions
                : null));
    }
}
class MasonryTemplateActions extends react_1.Component {
    render() {
        return react_1.default.createElement(react_1.Fragment, null, this.props.children);
    }
}
exports.MasonryTemplateActions = MasonryTemplateActions;


/***/ }),

/***/ "./src/AnterosReactComponent.tsx":
/*!***************************************!*\
  !*** ./src/AnterosReactComponent.tsx ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosReactComponent = void 0;
const react_1 = __webpack_require__(/*! react */ "react");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
class AnterosReactComponent extends react_1.Component {
    constructor(props) {
        super(props);
        this.datasourceEvents = [];
    }
    registerDatasourceEvent(ds, event, fn) {
        ds.addEventListener(event, fn);
        this.datasourceEvents.push({ ds, event, fn });
    }
    componentWillUnmount() {
        this.datasourceEvents.map((record) => {
            record.ds.removeEventListener(record.event, record.fn);
            return null;
        });
    }
    getPhoto(value, defaultImg) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value);
                }
                else {
                    return "data:image;base64," + value;
                }
            }
            else {
                return value;
            }
        }
        else {
            return defaultImg;
        }
    }
    getProduct(value) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value);
                }
                else {
                    return "data:image;base64," + value;
                }
            }
            else {
                return value;
            }
        }
        else {
            return "https://via.placeholder.com/150x150.png?text=Sem+foto";
        }
    }
    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        }
        catch (err) {
            return false;
        }
    }
    isUrl(string) {
        try {
            new URL(string);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    onLookupError(error) {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, alertMessage: error }));
    }
    onStartLookupData(item) {
        this.setState(Object.assign(Object.assign({}, this.state), { lookup: item.props.userData }));
    }
    onFinishedLookupData(_item) {
        this.setState(Object.assign(Object.assign({}, this.state), { lookup: "" }));
    }
    hasOnDataSource(value, datasource, field, subfield) {
        for (let index = 0; index < datasource.getData().length; index++) {
            const data = datasource.getData()[index];
            if (data[field]) {
                if (subfield) {
                    if (data[field][subfield] === value[subfield]) {
                        return true;
                    }
                }
                else if (data[field] === value[field]) {
                    return true;
                }
            }
        }
        return false;
    }
    defaulInsertValueOnDataSource(datasource, field, value) {
        datasource.setFieldByName(field, value);
    }
    checkAndInsertOnDataSource(records, datasource, field, subfield, callback) {
        let _this = this;
        records.forEach((record, indice) => {
            if (!_this.hasOnDataSource(record, datasource, field, subfield)) {
                if ((record.tpStatus &&
                    (record.tpStatus === "INATIVO" ||
                        record.tpStatus === "BLOQUEADO")) ||
                    (record.status &&
                        (record.status === "INATIVO" || record.status === "BLOQUEADO"))) {
                    (0, anteros_react_core_1.AnterosSweetAlert)({
                        title: `O item escolhido está ${record.tpStatus
                            ? record.tpStatus
                            : record.status
                                ? record.status
                                : "INATIVO"}`,
                        text: "Deseja inserir o item mesmo assim?",
                        type: "question",
                        showCancelButton: true,
                        confirmButtonText: "Inserir item",
                        cancelButtonText: "Cancelar",
                        focusCancel: false,
                    })
                        .then(() => {
                        if (callback) {
                            callback(datasource, field, record);
                        }
                        else {
                            this.defaulInsertValueOnDataSource(datasource, field, record);
                        }
                    })
                        .catch((error) => {
                        //
                    });
                }
                else {
                    if (callback) {
                        callback(datasource, field, record);
                    }
                    else {
                        this.defaulInsertValueOnDataSource(datasource, field, record);
                    }
                }
            }
            else {
                (0, anteros_react_core_1.AnterosSweetAlert)({
                    title: "Item já inserido!",
                    text: "",
                    type: "warning",
                });
            }
        });
    }
}
exports.AnterosReactComponent = AnterosReactComponent;


/***/ }),

/***/ "./src/AnterosSearchTemplate.tsx":
/*!***************************************!*\
  !*** ./src/AnterosSearchTemplate.tsx ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosSearchTemplate = exports.PositionUserActions = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const react_loader_spinner_1 = __webpack_require__(/*! react-loader-spinner */ "react-loader-spinner");
const anteros_react_datasource_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-datasource */ "@anterostecnologia/anteros-react-datasource");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const anteros_react_querybuilder_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-querybuilder */ "@anterostecnologia/anteros-react-querybuilder");
const anteros_react_containers_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_loaders_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-loaders */ "@anterostecnologia/anteros-react-loaders");
const anteros_react_layout_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-layout */ "@anterostecnologia/anteros-react-layout");
const anteros_react_navigation_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-navigation */ "@anterostecnologia/anteros-react-navigation");
const anteros_react_notification_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-notification */ "@anterostecnologia/anteros-react-notification");
const anteros_react_table_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-table */ "@anterostecnologia/anteros-react-table");
const anteros_react_buttons_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-buttons */ "@anterostecnologia/anteros-react-buttons");
const react_addons_shallow_compare_1 = __importDefault(__webpack_require__(/*! react-addons-shallow-compare */ "react-addons-shallow-compare"));
const lodash_1 = __webpack_require__(/*! lodash */ "lodash");
const anteros_react_containers_2 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_label_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-label */ "@anterostecnologia/anteros-react-label");
var PositionUserActions;
(function (PositionUserActions) {
    PositionUserActions[PositionUserActions["first"] = 0] = "first";
    PositionUserActions[PositionUserActions["last"] = 1] = "last";
})(PositionUserActions = exports.PositionUserActions || (exports.PositionUserActions = {}));
class AnterosSearchTemplate extends react_1.Component {
    constructor(props) {
        super(props);
        this.selectedRecords = [];
        (0, anteros_react_core_1.autoBind)(this);
        this._dataSourceFilter = this.createDataSourceFilter(props);
        if (props.onCustomCreateDatasource) {
            this._dataSource = props.onCustomCreateDatasource();
        }
        if (!this._dataSource) {
            this.createMainDataSource();
        }
        if (this._dataSource instanceof anteros_react_datasource_1.AnterosRemoteDatasource) {
            this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        }
        this._dataSource.addEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
        this.state = {
            dataSource: [],
            alertIsOpen: false,
            alertMessage: "",
            loading: false,
            width: undefined,
            newHeight: undefined,
            filterExpanded: false,
            update: Math.random(),
        };
    }
    createDataSourceFilter(props) {
        return anteros_react_querybuilder_1.AnterosQueryBuilderData.createDatasource(props.viewName, props.filterName, props.version);
    }
    getUser() {
        let result;
        if (this.props.onCustomUser) {
            result = this.props.onCustomUser();
        }
        else {
            result = this.props.user;
        }
        return result;
    }
    createMainDataSource() {
        if (this.props.dataSource) {
            this._dataSource = this.props.dataSource;
            if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                this._dataSource.cancel();
            }
        }
        else {
            this._dataSource = new anteros_react_datasource_1.AnterosRemoteDatasource('ds' + this.props.viewName);
            this._dataSource.setAjaxPostConfigHandler((entity) => {
                return this.props.remoteResource.save(entity);
            });
            this._dataSource.setValidatePostResponse((response) => {
                return response.data !== undefined;
            });
            this._dataSource.setAjaxDeleteConfigHandler((entity) => {
                return this.props.remoteResource.delete(entity);
            });
            this._dataSource.setValidateDeleteResponse((response) => {
                return response.data !== undefined;
            });
        }
        this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        this._dataSource.addEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
    }
    componentDidMount() {
        setTimeout(() => {
            if (this.props.openMainDataSource) {
                if (!this._dataSource.isOpen()) {
                    this._dataSource.open(this.getData(this.props.currentFilter, 0));
                }
                else if (this.props.needRefresh) {
                    this._dataSource.open(this.getData(this.props.currentFilter, this._dataSource.getCurrentPage()));
                }
                if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                    this._dataSource.cancel();
                }
            }
            if (this.props.onDidMount) {
                this.props.onDidMount();
            }
        }, 100);
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
        this.props.hideTour();
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (0, react_addons_shallow_compare_1.default)(this, nextProps, nextState);
    }
    onFilterChanged(filter, activeFilterIndex, callback = lodash_1.noop) {
        this.props.setFilter(filter, activeFilterIndex);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }), callback);
    }
    onToggleExpandedFilter(expanded) {
        this.setState(Object.assign(Object.assign({}, this.state), { filterExpanded: expanded, update: Math.random() }));
    }
    onSelectedFilter(filter, index) {
        this.props.setFilter(filter, index);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }));
    }
    onBeforePageChanged(_currentPage, _newPage) {
        //
    }
    handlePageChanged(_newPage) {
        //
    }
    getSortFields() {
        if (this.props.withFilter &&
            this.props.currentFilter &&
            this.props.currentFilter.sort) {
            return this.props.currentFilter.sort.quickFilterSort;
        }
        return this.props.defaultSortFields;
    }
    onDatasourceEvent(event, error) {
        if (event === anteros_react_datasource_1.dataSourceEvents.BEFORE_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.BEFORE_GOTO_PAGE) {
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: true }));
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.AFTER_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.AFTER_GOTO_PAGE ||
            event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            this.props.setDatasource(this._dataSource);
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: false }));
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            if (error) {
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, loading: false, update: Math.random(), alertMessage: (0, anteros_react_core_1.processErrorMessage)(error) }));
            }
        }
    }
    onSearchByFilter() {
        this.onShowHideLoad(true);
        this._dataSource.open(this.getData(this.props.currentFilter, 0), () => {
            this.onShowHideLoad(false);
        });
    }
    getData(currentFilter, page) {
        if (currentFilter &&
            currentFilter.filter.filterType === anteros_react_querybuilder_1.QUICK &&
            currentFilter.filter.quickFilterText &&
            currentFilter.filter.quickFilterText !== "") {
            return this.getDataWithQuickFilter(currentFilter, page);
        }
        else if (currentFilter &&
            (currentFilter.filter.filterType === anteros_react_querybuilder_1.NORMAL ||
                currentFilter.filter.filterType === anteros_react_querybuilder_1.ADVANCED)) {
            return this.getDataWithFilter(currentFilter, page);
        }
        else {
            return this.getDataWithoutFilter(page);
        }
    }
    getDataWithFilter(currentFilter, page) {
        var filter = new anteros_react_querybuilder_1.AnterosFilterDSL();
        filter.buildFrom(currentFilter.filter, currentFilter.sort);
        let filterStr = filter.toJSON();
        let result = undefined;
        if (filterStr) {
            if (this.props.onCustomFindWithFilter) {
                result = this.props.onCustomFindWithFilter(filter.toJSON(), page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
            }
            if (!result) {
                result = this.props.remoteResource.findWithFilter(filter.toJSON(), page, this.props.pageSize, this.props.fieldsToForceLazy);
            }
        }
        else {
            result = this.getDataWithoutFilter(page);
        }
        return result;
    }
    getDataWithoutFilter(page) {
        let result = undefined;
        if (this.props.onCustomFindAll) {
            return this.props.onCustomFindAll(page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        if (!result) {
            result = this.props.remoteResource.findAll(page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy, undefined);
        }
        return result;
    }
    getDataWithQuickFilter(currentFilter, page) {
        let result = undefined;
        if (this.props.onCustomFindMultipleFields) {
            result = this.props.onCustomFindMultipleFields(currentFilter.filter.quickFilterText, currentFilter.filter.quickFilterFieldsText, 0, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        if (!result) {
            return this.props.remoteResource.findMultipleFields(currentFilter.filter.quickFilterText, currentFilter.filter.quickFilterFieldsText, page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        return result;
    }
    onDoubleClickTable(data) {
        if (this.props.onCustomDoubleClick) {
            this.props.onCustomDoubleClick(data);
        }
    }
    pageConfigHandler(page) {
        return this.getData(this.props.currentFilter, page);
    }
    onCloseAlert() {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, update: Math.random(), alertMessage: "" }));
    }
    onShowHideLoad(show) {
        this.setState(Object.assign(Object.assign({}, this.state), { loading: show, update: Math.random() }));
    }
    onSelectRecord(row, data, tableId) {
        let sr = this.selectedRecords;
        if (sr === undefined)
            sr = [];
        sr.push(data);
        this.selectedRecords = sr;
    }
    onUnSelectRecord(row, data, tableId) {
        for (var i = 0; i < this.selectedRecords.length; i++) {
            if (this.selectedRecords[i] === data) {
                this.selectedRecords.splice(i, 1);
            }
        }
    }
    onSelectAllRecords(records, tableId) {
        this.selectedRecords = [];
        records.forEach((element) => {
            this.selectedRecords.push(element);
        });
    }
    onUnSelectAllRecords(tableId) {
        this.selectedRecords = [];
    }
    handleOnSelectRecord(row, data, tableId) {
        this.onSelectRecord(row, data, tableId);
        if (this.props.onSelectRecord) {
            this.props.onSelectRecord(row, data, tableId);
        }
    }
    handleOnUnselectRecord(row, data, tableId) {
        this.onUnSelectRecord(row, data, tableId);
        if (this.props.onUnselectRecord) {
            this.props.onUnselectRecord(row, data, tableId);
        }
    }
    handleOnSelectAllRecords(records, tableId) {
        this.onSelectAllRecords(records, tableId);
        if (this.props.onSelectAllRecords) {
            this.props.onSelectAllRecords(records, tableId);
        }
    }
    handleOnUnselectAllRecords(tableId) {
        this.onUnSelectAllRecords(tableId);
        if (this.props.onUnselectAllRecords) {
            this.props.onUnselectAllRecords(tableId);
        }
    }
    changeState(state, callback) {
        if (callback) {
            this.setState(Object.assign(Object.assign(Object.assign({}, this.state), state), { update: Math.random() }), callback);
        }
        else {
            this.setState(Object.assign(Object.assign(Object.assign({}, this.state), state), { update: Math.random() }));
        }
    }
    onClick(event) {
        if (event.target.getAttribute("data-user") === "btnOK") {
            if (this._dataSource.isEmpty()) {
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, alertMessage: "Selecione um registro para continuar." }));
            }
            else {
                if (this.selectedRecords) {
                    if (this.selectedRecords.length === 0) {
                        this.selectedRecords.push(this._dataSource.getCurrentRecord());
                    }
                }
                this.props.onClickOk(event, this.selectedRecords);
            }
        }
        else if (event.target.getAttribute("data-user") === "btnCancel") {
            if (this.props.onClickCancel) {
                this.props.onClickCancel(event);
            }
        }
    }
    handleDelete(i) {
        this.props.selectedRecords.splice(i, 1);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }));
    }
    onClear() {
        this.props.selectedRecords.splice(0, this.props.selectedRecords.length);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }));
    }
    render() {
        var _a, _b;
        let customLoader = undefined;
        let messageLoading;
        if (this.props.getCustomLoader) {
            customLoader = this.props.getCustomLoader();
        }
        if (this.props.getCustomMessageLoading) {
            messageLoading = this.props.getCustomMessageLoading();
        }
        if (!messageLoading) {
            messageLoading = this.props.messageLoading;
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(anteros_react_notification_1.AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 15000, onClose: this.onCloseAlert }, this.state.alertMessage),
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
                }, tag: "div", blocking: this.state.loading, message: messageLoading, loader: customLoader ? (customLoader) : (react_1.default.createElement(react_loader_spinner_1.TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: "#f2d335" })) },
                this.props.withFilter ? (react_1.default.createElement("div", { style: {
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-between",
                    } },
                    react_1.default.createElement(anteros_react_querybuilder_1.AnterosQueryBuilder, { zIndex: 50, id: this.props.filterName, formName: this.props.viewName, ref: (ref) => (this._filterRef = ref), expandedFilter: this.state.filterExpanded, update: this.state.update, dataSource: this._dataSourceFilter, currentFilter: this.props.currentFilter, activeFilterIndex: this.props.activeFilterIndex, onSelectedFilter: this.onSelectedFilter, onFilterChanged: this.onFilterChanged, onSearchByFilter: this.onSearchByFilter, onToggleExpandedFilter: this.onToggleExpandedFilter, width: "660px", height: "170px", allowSort: true, disabled: this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE }, this.props.fieldsFilter))) : (react_1.default.createElement("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    } })),
                this.props.children,
                react_1.default.createElement(anteros_react_table_1.AnterosDataTable, { id: "table" + this.props.viewName, height: "200px", ref: (ref) => (this._tableRef = ref), dataSource: this._dataSource, width: "100%", enablePaging: false, enableSearching: false, showExportButtons: false, onDoubleClick: this.onDoubleClickTable, onSelectRecord: this.handleOnSelectRecord, onUnSelectRecord: this.handleOnUnselectRecord, onSelectAllRecords: this.handleOnSelectAllRecords, onUnSelectAllRecords: this.handleOnUnselectAllRecords }, this.props.columns),
                this.props.isCumulativeSelection ? (react_1.default.createElement("div", { style: { height: "55px", maxHeight: "120px", overflowY: "auto" } },
                    react_1.default.createElement(anteros_react_label_1.AnterosTags, { addTags: false, tags: this.props.selectedRecords, labelField: this.props.labelField, handleDelete: this.handleDelete, allowUnique: true, onClear: this.onClear }))) : null),
            react_1.default.createElement(anteros_react_containers_1.FooterActions, { className: "versatil-card-footer" },
                react_1.default.createElement(anteros_react_layout_1.AnterosRow, { className: "row justify-content-start align-items-center" },
                    react_1.default.createElement(anteros_react_layout_1.AnterosCol, { medium: 4 },
                        react_1.default.createElement(anteros_react_label_1.AnterosLabel, { caption: `Total ${this.props.caption} ${this._dataSource.getGrandTotalRecords()}` })),
                    react_1.default.createElement(anteros_react_layout_1.AnterosCol, { medium: 7 },
                        react_1.default.createElement(anteros_react_navigation_1.AnterosPagination, { horizontalEnd: true, dataSource: this._dataSource, visiblePages: 8, onBeforePageChanged: this.onBeforePageChanged, onPageChanged: this.handlePageChanged })))),
            react_1.default.createElement(anteros_react_containers_2.ModalActions, null,
                this.props.positionUserActions === PositionUserActions.first
                    ? (_a = this.props.userActions) !== null && _a !== void 0 ? _a : null
                    : null,
                react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { success: true, dataUser: "btnOK", onClick: this.onClick }, this.props.labelButtonOk),
                " ",
                react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { danger: true, dataUser: "btnCancel", onClick: this.onClick }, this.props.labelButtonCancel),
                this.props.positionUserActions === PositionUserActions.last
                    ? (_b = this.props.userActions) !== null && _b !== void 0 ? _b : null
                    : null)));
    }
}
exports.AnterosSearchTemplate = AnterosSearchTemplate;
AnterosSearchTemplate.defaultProps = {
    openDataSourceFilter: true,
    openMainDataSource: true,
    messageLoading: "Por favor aguarde...",
    withFilter: true,
    fieldsToForceLazy: "",
    defaultSortFields: "",
    labelButtonOk: "Ok",
    labelButtonCancel: "Fechar",
    positionUserActions: PositionUserActions.first,
    userActions: undefined,
    isCumulativeSelection: false,
};


/***/ }),

/***/ "./src/AnterosTableTemplate.tsx":
/*!**************************************!*\
  !*** ./src/AnterosTableTemplate.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosTableTemplate = exports.TableTemplateActions = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const react_loader_spinner_1 = __webpack_require__(/*! react-loader-spinner */ "react-loader-spinner");
const anteros_react_datasource_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-datasource */ "@anterostecnologia/anteros-react-datasource");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const anteros_react_querybuilder_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-querybuilder */ "@anterostecnologia/anteros-react-querybuilder");
const anteros_react_containers_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_loaders_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-loaders */ "@anterostecnologia/anteros-react-loaders");
const anteros_react_layout_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-layout */ "@anterostecnologia/anteros-react-layout");
const anteros_react_navigation_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-navigation */ "@anterostecnologia/anteros-react-navigation");
const anteros_react_notification_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-notification */ "@anterostecnologia/anteros-react-notification");
const anteros_react_table_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-table */ "@anterostecnologia/anteros-react-table");
const anteros_react_buttons_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-buttons */ "@anterostecnologia/anteros-react-buttons");
const anteros_react_label_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-label */ "@anterostecnologia/anteros-react-label");
const react_addons_shallow_compare_1 = __importDefault(__webpack_require__(/*! react-addons-shallow-compare */ "react-addons-shallow-compare"));
const lodash_1 = __webpack_require__(/*! lodash */ "lodash");
class AnterosTableTemplate extends react_1.Component {
    constructor(props) {
        super(props);
        (0, anteros_react_core_1.autoBind)(this);
        this._dataSourceFilter = this.createDataSourceFilter(props);
        if (props.onCustomCreateDatasource) {
            this._dataSource = props.onCustomCreateDatasource();
        }
        if (!this._dataSource) {
            this.createMainDataSource();
        }
        if (this._dataSource instanceof anteros_react_datasource_1.AnterosRemoteDatasource) {
            this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        }
        this._dataSource.addEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
        this.state = {
            dataSource: [],
            alertIsOpen: false,
            alertMessage: "",
            loading: false,
            width: undefined,
            newHeight: undefined,
            filterExpanded: false,
            update: Math.random(),
        };
    }
    createDataSourceFilter(props) {
        return anteros_react_querybuilder_1.AnterosQueryBuilderData.createDatasource(props.viewName, props.filterName, props.version);
    }
    getUser() {
        let result;
        if (this.props.onCustomUser) {
            result = this.props.onCustomUser();
        }
        else {
            result = this.props.user;
        }
        return result;
    }
    createMainDataSource() {
        if (this.props.dataSource) {
            this._dataSource = this.props.dataSource;
            if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                this._dataSource.cancel();
            }
        }
        else {
            this._dataSource = new anteros_react_datasource_1.AnterosRemoteDatasource('ds' + this.props.viewName);
            this._dataSource.setAjaxPostConfigHandler((entity) => {
                return this.props.remoteResource.save(entity);
            });
            this._dataSource.setValidatePostResponse((response) => {
                return response.data !== undefined;
            });
            this._dataSource.setAjaxDeleteConfigHandler((entity) => {
                return this.props.remoteResource.delete(entity);
            });
            this._dataSource.setValidateDeleteResponse((response) => {
                return response.data !== undefined;
            });
        }
        this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        this._dataSource.addEventListener(anteros_react_datasource_1.DATASOURCE_EVENTS, this.onDatasourceEvent);
    }
    componentDidMount() {
        setTimeout(() => {
            this.refreshData(this.props);
            if (this.props.onDidMount) {
                this.props.onDidMount();
            }
        }, 100);
    }
    componentWillReceiveProps(nextProps) {
        this.refreshData(nextProps);
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: nextProps.alertIsOpen, alertMessage: nextProps.alertMessage, loading: nextProps.loading }));
    }
    refreshData(props) {
        if (props.openMainDataSource) {
            this.onShowHideLoad(true, () => {
                if (!this._dataSource.isOpen()) {
                    this._dataSource.open(this.getData(this.props.currentFilter, 0), () => {
                        this.onShowHideLoad(false, () => { });
                    });
                }
                else if (props.needRefresh) {
                    this._dataSource.open(this.getData(props.currentFilter, this._dataSource.getCurrentPage()), () => {
                        this.onShowHideLoad(false, () => { });
                    });
                }
                else {
                    this.onShowHideLoad(false, () => { });
                }
                if (this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE) {
                    this._dataSource.cancel();
                }
            });
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
        this.props.hideTour();
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (0, react_addons_shallow_compare_1.default)(this, nextProps, nextState);
    }
    onFilterChanged(filter, activeFilterIndex, callback = lodash_1.noop) {
        this.props.setFilter(filter, activeFilterIndex);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }), callback);
    }
    onToggleExpandedFilter(expanded) {
        this.setState(Object.assign(Object.assign({}, this.state), { filterExpanded: expanded, update: Math.random() }));
    }
    onSelectedFilter(filter, index) {
        this.props.setFilter(filter, index);
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random() }));
    }
    onBeforePageChanged(_currentPage, _newPage) {
        //
    }
    handlePageChanged(_newPage) {
        //
    }
    getSortFields() {
        if (this.props.withFilter &&
            this.props.currentFilter &&
            this.props.currentFilter.sort) {
            return this.props.currentFilter.sort.quickFilterSort;
        }
        return this.props.defaultSortFields;
    }
    onDatasourceEvent(event, error) {
        if (event === anteros_react_datasource_1.dataSourceEvents.BEFORE_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.BEFORE_GOTO_PAGE) {
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: true }));
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.BEFORE_POST) {
            if (this.props.onBeforePost) {
                this.props.onBeforePost();
            }
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.AFTER_OPEN ||
            event === anteros_react_datasource_1.dataSourceEvents.AFTER_GOTO_PAGE ||
            event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            this.props.setDatasource(this._dataSource);
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: false }));
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.AFTER_INSERT) {
            if (this.props.onAfterInsert) {
                this.props.onAfterInsert();
            }
        }
        if (event === anteros_react_datasource_1.dataSourceEvents.ON_ERROR) {
            if (error) {
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, loading: false, update: Math.random(), alertMessage: (0, anteros_react_core_1.processErrorMessage)(error) }));
            }
        }
    }
    onButtonClick(event, button) {
        if (button.props.id === "btnView") {
            if (this.props.onCustomActionView) {
                if (this.props.onCustomActionView(button.props.route)) {
                    return;
                }
            }
        }
        else if (button.props.id === "btnAdd") {
            if (this.props.onCustomActionAdd) {
                if (this.props.onCustomActionAdd(button.props.route)) {
                    return;
                }
            }
            if (this.props.onBeforeInsert) {
                this.props.onBeforeInsert();
            }
            if (!this._dataSource.isOpen())
                this._dataSource.open();
            this._dataSource.insert();
        }
        else if (button.props.id === "btnEdit") {
            if (this.props.onCustomActionEdit) {
                if (this.props.onCustomActionEdit(button.props.route)) {
                    return;
                }
            }
            if (this.props.onBeforeEdit) {
                if (!this.props.onBeforeEdit()) {
                    return;
                }
            }
            this._dataSource.edit();
        }
        else if (button.props.id === "btnRemove") {
            if (this.props.onBeforeRemove) {
                if (!this.props.onBeforeRemove()) {
                    return;
                }
            }
            (0, anteros_react_core_1.AnterosSweetAlert)({
                title: "Deseja remover ?",
                text: "",
                type: "question",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                focusCancel: true,
            })
                .then(() => {
                this._dataSource.delete((error) => {
                    if (error) {
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, update: Math.random(), alertMessage: (0, anteros_react_core_1.processErrorMessage)(error) }));
                    }
                });
            })
                .catch((_error) => { });
        }
        if (this.props.onButtonClick) {
            this.props.onButtonClick(event, button);
        }
        if (button.props.route) {
            this.props.history.push(button.props.route);
        }
    }
    onSearchByFilter() {
        this.onShowHideLoad(true, () => {
            this._dataSource.open(this.getData(this.props.currentFilter, 0), () => {
                this.onShowHideLoad(false, () => { });
            });
        });
    }
    getData(currentFilter, page) {
        if (currentFilter &&
            currentFilter.filter.filterType === anteros_react_querybuilder_1.QUICK &&
            currentFilter.filter.quickFilterText &&
            currentFilter.filter.quickFilterText !== "") {
            return this.getDataWithQuickFilter(currentFilter, page);
        }
        else if (currentFilter &&
            (currentFilter.filter.filterType === anteros_react_querybuilder_1.NORMAL ||
                currentFilter.filter.filterType === anteros_react_querybuilder_1.ADVANCED)) {
            return this.getDataWithFilter(currentFilter, page);
        }
        else {
            return this.getDataWithoutFilter(page);
        }
    }
    getDataWithFilter(currentFilter, page) {
        var filter = new anteros_react_querybuilder_1.AnterosFilterDSL();
        filter.buildFrom(currentFilter.filter, currentFilter.sort);
        let filterStr = filter.toJSON();
        let result = undefined;
        if (filterStr) {
            if (this.props.onCustomFindWithFilter) {
                result = this.props.onCustomFindWithFilter(filter.toJSON(), page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
            }
            if (!result) {
                result = this.props.remoteResource.findWithFilter(filter.toJSON(), page, this.props.pageSize, this.props.fieldsToForceLazy);
            }
        }
        else {
            result = this.getDataWithoutFilter(page);
        }
        return result;
    }
    getDataWithoutFilter(page) {
        let result = undefined;
        if (this.props.onCustomFindAll) {
            return this.props.onCustomFindAll(page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        if (!result) {
            result = this.props.remoteResource.findAll(page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy, undefined);
        }
        return result;
    }
    getDataWithQuickFilter(currentFilter, page) {
        let result = undefined;
        if (this.props.onCustomFindMultipleFields) {
            result = this.props.onCustomFindMultipleFields(currentFilter.filter.quickFilterText, currentFilter.filter.quickFilterFieldsText, 0, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        if (!result) {
            return this.props.remoteResource.findMultipleFields(currentFilter.filter.quickFilterText, currentFilter.filter.quickFilterFieldsText, page, this.props.pageSize, this.getSortFields(), this.props.fieldsToForceLazy);
        }
        return result;
    }
    onDoubleClickTable(data) {
        if (this.props.onCustomDoubleClick) {
            this.props.onCustomDoubleClick(data);
        }
    }
    pageConfigHandler(page) {
        return this.getData(this.props.currentFilter, page);
    }
    onCloseAlert() {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: false, update: Math.random(), alertMessage: "" }));
    }
    onShowHideLoad(show, callback) {
        this.setState(Object.assign(Object.assign({}, this.state), { loading: show, update: Math.random() }), callback);
    }
    handleOnSelectRecord(row, data, tableId) {
        if (this.props.onSelectRecord) {
            this.props.onSelectRecord(row, data, tableId);
        }
    }
    handleOnUnselectRecord(row, data, tableId) {
        if (this.props.onUnselectRecord) {
            this.props.onUnselectRecord(row, data, tableId);
        }
    }
    handleOnSelectAllRecords(records, tableId) {
        if (this.props.onSelectAllRecords) {
            this.props.onSelectAllRecords(records, tableId);
        }
    }
    handleOnUnselectAllRecords(tableId) {
        if (this.props.onUnselectAllRecords) {
            this.props.onUnselectAllRecords(tableId);
        }
    }
    onResize(width, height) {
        let newHeight = height - 120;
        if (this._tableRef) {
            this._tableRef.resize("100%", newHeight);
        }
        this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), width: width, newHeight: newHeight }));
    }
    changeState(state, callback) {
        if (callback) {
            this.setState(Object.assign(Object.assign(Object.assign({}, this.state), state), { update: Math.random() }), callback);
        }
        else {
            this.setState(Object.assign(Object.assign(Object.assign({}, this.state), state), { update: Math.random() }));
        }
    }
    render() {
        let modals = undefined;
        if (this.props.getModals) {
            modals = this.props.getModals();
        }
        let customLoader = undefined;
        let messageLoading;
        if (this.props.getCustomLoader) {
            customLoader = this.props.getCustomLoader();
        }
        if (this.props.getCustomMessageLoading) {
            messageLoading = this.props.getCustomMessageLoading();
        }
        if (!messageLoading) {
            messageLoading = this.props.messageLoading;
        }
        return (react_1.default.createElement(react_1.Fragment, null,
            react_1.default.createElement(anteros_react_core_1.AnterosResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize }),
            react_1.default.createElement(anteros_react_notification_1.AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 15000, onClose: this.onCloseAlert }, this.state.alertMessage),
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
                }, tag: "div", blocking: this.state.loading, message: messageLoading, loader: customLoader ? (customLoader) : (react_1.default.createElement(react_loader_spinner_1.TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: "#f2d335" })) },
                this.props.withFilter ? (react_1.default.createElement("div", { style: {
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-between",
                    } },
                    react_1.default.createElement("div", { style: {
                            width: "calc(100%)",
                        } },
                        react_1.default.createElement(UserActions, { dataSource: this._dataSource, onButtonClick: this.onButtonClick, routes: this.props.routes, allowRemove: this.props.allowRemove, labelButtonAdd: this.props.labelButtonAdd, labelButtonEdit: this.props.labelButtonEdit, labelButtonRemove: this.props.labelButtonRemove, labelButtonSelect: this.props.labelButtonSelect, labelButtonView: this.props.labelButtonView, positionUserActions: this.props.positionUserActions
                                ? this.props.positionUserActions
                                : "first", userActions: this.props.userActions })),
                    react_1.default.createElement(anteros_react_querybuilder_1.AnterosQueryBuilder, { zIndex: 50, id: this.props.filterName, formName: this.props.viewName, ref: (ref) => (this._filterRef = ref), expandedFilter: this.state.filterExpanded, update: this.state.update, dataSource: this._dataSourceFilter, currentFilter: this.props.currentFilter, activeFilterIndex: this.props.activeFilterIndex, onSelectedFilter: this.onSelectedFilter, onFilterChanged: this.onFilterChanged, onSearchByFilter: this.onSearchByFilter, onToggleExpandedFilter: this.onToggleExpandedFilter, width: "660px", height: "170px", allowSort: true, disabled: this._dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE }, this.props.fieldsFilter))) : (react_1.default.createElement("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    } },
                    react_1.default.createElement(UserActions, { dataSource: this._dataSource, onButtonClick: this.onButtonClick, routes: this.props.routes, allowRemove: this.props.allowRemove, labelButtonAdd: this.props.labelButtonAdd, labelButtonEdit: this.props.labelButtonEdit, labelButtonRemove: this.props.labelButtonRemove, labelButtonSelect: this.props.labelButtonSelect, labelButtonView: this.props.labelButtonView, positionUserActions: this.props.positionUserActions
                            ? this.props.positionUserActions
                            : "first", userActions: this.props.userActions }))),
                this.props.children,
                react_1.default.createElement(anteros_react_table_1.AnterosDataTable, { id: "table" + this.props.viewName, height: "200px", ref: (ref) => (this._tableRef = ref), dataSource: this._dataSource, width: "100%", enablePaging: false, enableSearching: false, showExportButtons: false, onDoubleClick: this.onDoubleClickTable, onSelectRecord: this.handleOnSelectRecord, onUnSelectRecord: this.handleOnUnselectRecord, onSelectAllRecords: this.handleOnSelectAllRecords, onUnSelectAllRecords: this.handleOnUnselectAllRecords }, this.props.columns)),
            react_1.default.createElement(anteros_react_containers_1.FooterActions, { className: "versatil-card-footer" },
                react_1.default.createElement(anteros_react_layout_1.AnterosRow, { className: "row justify-content-start align-items-center" },
                    react_1.default.createElement(anteros_react_layout_1.AnterosCol, { medium: 4 },
                        react_1.default.createElement(anteros_react_label_1.AnterosLabel, { caption: `Total ${this.props.caption} ${this._dataSource.getGrandTotalRecords()}` })),
                    react_1.default.createElement(anteros_react_layout_1.AnterosCol, { medium: 7 },
                        react_1.default.createElement(anteros_react_navigation_1.AnterosPagination, { horizontalEnd: true, dataSource: this._dataSource, visiblePages: 8, onBeforePageChanged: this.onBeforePageChanged, onPageChanged: this.handlePageChanged })))),
            modals));
    }
}
exports.AnterosTableTemplate = AnterosTableTemplate;
AnterosTableTemplate.defaultProps = {
    openDataSourceFilter: true,
    openMainDataSource: true,
    messageLoading: "Por favor aguarde...",
    withFilter: true,
    fieldsToForceLazy: "",
    defaultSortFields: "",
    labelButtonAdd: "Adicionar",
    labelButtonEdit: "Editar",
    labelButtonRemove: "Remover",
    labelButtonSelect: "Selecionar",
    labelButtonView: "Visualizar",
    positionUserActions: "first",
    userActions: undefined,
    allowRemove: true,
    alertIsOpen: false,
    alertMessage: undefined,
    loading: false,
};
class UserActions extends react_1.Component {
    getLabelButtonEdit() {
        return this.props.labelButtonEdit ? this.props.labelButtonEdit : "Editar";
    }
    getLabelButtonRemove() {
        return this.props.labelButtonRemove
            ? this.props.labelButtonRemove
            : "Remover";
    }
    getLabelButtonAdd() {
        return this.props.labelButtonAdd ? this.props.labelButtonAdd : "Adicionar";
    }
    getLabelButtonView() {
        return this.props.labelButtonView
            ? this.props.labelButtonView
            : "Visualizar";
    }
    render() {
        return (react_1.default.createElement("div", { style: { display: "flex" } },
            this.props.positionUserActions === "first"
                ? this.props.userActions
                : null,
            this.props.routes.edit ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnView", route: this.props.routes.edit, icon: "fal fa-eye", small: true, className: "versatil-btn-visualizar", caption: this.getLabelButtonView(), hint: this.getLabelButtonView(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE })) : null,
            this.props.routes.add ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnAdd", route: this.props.routes.add, icon: "fal fa-plus", small: true, className: "versatil-btn-adicionar", caption: this.getLabelButtonAdd(), hint: this.getLabelButtonAdd(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE })) : null,
            this.props.routes.edit ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnEdit", route: this.props.routes.edit, icon: "fal fa-pencil", small: true, className: "versatil-btn-editar", caption: this.getLabelButtonEdit(), hint: this.getLabelButtonEdit(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE })) : null,
            this.props.allowRemove ? (react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnRemove", icon: "fal fa-trash", disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== anteros_react_datasource_1.dataSourceConstants.DS_BROWSE, small: true, caption: this.getLabelButtonRemove(), hint: this.getLabelButtonRemove(), className: "versatil-btn-remover", onButtonClick: this.props.onButtonClick })) : null,
            " ",
            this.props.positionUserActions === "last"
                ? this.props.userActions
                : null));
    }
}
class TableTemplateActions extends react_1.Component {
    render() {
        return react_1.default.createElement(react_1.Fragment, null, this.props.children);
    }
}
exports.TableTemplateActions = TableTemplateActions;


/***/ }),

/***/ "@anterostecnologia/anteros-react-admin":
/*!*********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-admin" ***!
  \*********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-admin");

/***/ }),

/***/ "@anterostecnologia/anteros-react-api2":
/*!********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-api2" ***!
  \********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-api2");

/***/ }),

/***/ "@anterostecnologia/anteros-react-buttons":
/*!***********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-buttons" ***!
  \***********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-buttons");

/***/ }),

/***/ "@anterostecnologia/anteros-react-containers":
/*!**************************************************************!*\
  !*** external "@anterostecnologia/anteros-react-containers" ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-containers");

/***/ }),

/***/ "@anterostecnologia/anteros-react-core":
/*!********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-core" ***!
  \********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-core");

/***/ }),

/***/ "@anterostecnologia/anteros-react-datasource":
/*!**************************************************************!*\
  !*** external "@anterostecnologia/anteros-react-datasource" ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-datasource");

/***/ }),

/***/ "@anterostecnologia/anteros-react-label":
/*!*********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-label" ***!
  \*********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-label");

/***/ }),

/***/ "@anterostecnologia/anteros-react-layout":
/*!**********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-layout" ***!
  \**********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-layout");

/***/ }),

/***/ "@anterostecnologia/anteros-react-loaders":
/*!***********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-loaders" ***!
  \***********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-loaders");

/***/ }),

/***/ "@anterostecnologia/anteros-react-masonry":
/*!***********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-masonry" ***!
  \***********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-masonry");

/***/ }),

/***/ "@anterostecnologia/anteros-react-navigation":
/*!**************************************************************!*\
  !*** external "@anterostecnologia/anteros-react-navigation" ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-navigation");

/***/ }),

/***/ "@anterostecnologia/anteros-react-notification":
/*!****************************************************************!*\
  !*** external "@anterostecnologia/anteros-react-notification" ***!
  \****************************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-notification");

/***/ }),

/***/ "@anterostecnologia/anteros-react-querybuilder":
/*!****************************************************************!*\
  !*** external "@anterostecnologia/anteros-react-querybuilder" ***!
  \****************************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-querybuilder");

/***/ }),

/***/ "@anterostecnologia/anteros-react-table":
/*!*********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-table" ***!
  \*********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-table");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("lodash");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react-addons-shallow-compare":
/*!***********************************************!*\
  !*** external "react-addons-shallow-compare" ***!
  \***********************************************/
/***/ ((module) => {

module.exports = require("react-addons-shallow-compare");

/***/ }),

/***/ "react-loader-spinner":
/*!***************************************!*\
  !*** external "react-loader-spinner" ***!
  \***************************************/
/***/ ((module) => {

module.exports = require("react-loader-spinner");

/***/ }),

/***/ "react-router-tabs/styles/react-router-tabs.css":
/*!*****************************************************************!*\
  !*** external "react-router-tabs/styles/react-router-tabs.css" ***!
  \*****************************************************************/
/***/ ((module) => {

module.exports = require("react-router-tabs/styles/react-router-tabs.css");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosReactComponent = exports.ModalSize = exports.AnterosFormModalTemplate = exports.AnterosFormComponent = exports.AnterosFormTemplate = exports.AnterosMainLayoutTemplate = exports.AnterosMasonryTemplate = exports.AnterosSearchTemplate = exports.AnterosTableTemplate = void 0;
const AnterosFormComponent_1 = __webpack_require__(/*! ./AnterosFormComponent */ "./src/AnterosFormComponent.tsx");
Object.defineProperty(exports, "AnterosFormComponent", ({ enumerable: true, get: function () { return AnterosFormComponent_1.AnterosFormComponent; } }));
const AnterosFormModalTemplate_1 = __webpack_require__(/*! ./AnterosFormModalTemplate */ "./src/AnterosFormModalTemplate.tsx");
Object.defineProperty(exports, "AnterosFormModalTemplate", ({ enumerable: true, get: function () { return AnterosFormModalTemplate_1.AnterosFormModalTemplate; } }));
Object.defineProperty(exports, "ModalSize", ({ enumerable: true, get: function () { return AnterosFormModalTemplate_1.ModalSize; } }));
const AnterosFormTemplate_1 = __webpack_require__(/*! ./AnterosFormTemplate */ "./src/AnterosFormTemplate.tsx");
Object.defineProperty(exports, "AnterosFormTemplate", ({ enumerable: true, get: function () { return AnterosFormTemplate_1.AnterosFormTemplate; } }));
const AnterosMainLayoutTemplate_1 = __webpack_require__(/*! ./AnterosMainLayoutTemplate */ "./src/AnterosMainLayoutTemplate.tsx");
Object.defineProperty(exports, "AnterosMainLayoutTemplate", ({ enumerable: true, get: function () { return AnterosMainLayoutTemplate_1.AnterosMainLayoutTemplate; } }));
const AnterosMasonryTemplate_1 = __webpack_require__(/*! ./AnterosMasonryTemplate */ "./src/AnterosMasonryTemplate.tsx");
Object.defineProperty(exports, "AnterosMasonryTemplate", ({ enumerable: true, get: function () { return AnterosMasonryTemplate_1.AnterosMasonryTemplate; } }));
const AnterosSearchTemplate_1 = __webpack_require__(/*! ./AnterosSearchTemplate */ "./src/AnterosSearchTemplate.tsx");
Object.defineProperty(exports, "AnterosSearchTemplate", ({ enumerable: true, get: function () { return AnterosSearchTemplate_1.AnterosSearchTemplate; } }));
const AnterosTableTemplate_1 = __webpack_require__(/*! ./AnterosTableTemplate */ "./src/AnterosTableTemplate.tsx");
Object.defineProperty(exports, "AnterosTableTemplate", ({ enumerable: true, get: function () { return AnterosTableTemplate_1.AnterosTableTemplate; } }));
const AnterosReactComponent_1 = __webpack_require__(/*! ./AnterosReactComponent */ "./src/AnterosReactComponent.tsx");
Object.defineProperty(exports, "AnterosReactComponent", ({ enumerable: true, get: function () { return AnterosReactComponent_1.AnterosReactComponent; } }));

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=anteros-react-template2.js.map