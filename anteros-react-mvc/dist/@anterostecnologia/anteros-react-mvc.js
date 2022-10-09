(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@anterostecnologia/anteros-react-mvc", [], factory);
	else if(typeof exports === 'object')
		exports["@anterostecnologia/anteros-react-mvc"] = factory();
	else
		root["@anterostecnologia/anteros-react-mvc"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/AnterosController.ts":
/*!**********************************!*\
  !*** ./src/AnterosController.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosController = void 0;
class AnterosController {
}
exports.AnterosController = AnterosController;


/***/ }),

/***/ "./src/AnterosSearchView.tsx":
/*!***********************************!*\
  !*** ./src/AnterosSearchView.tsx ***!
  \***********************************/
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeDefaultReduxPropsSearchView = exports.AnterosSearchView = void 0;
//@ts-nocheck
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const anteros_react_containers_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_template2_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-template2 */ "@anterostecnologia/anteros-react-template2");
let AnterosSearchView = class AnterosSearchView extends react_1.Component {
    constructor(props) {
        super(props);
        this._controller = props.controller;
    }
    /**
     * Getter controller
     * @return {AnterosController<E,TypeID>}
     */
    get controller() {
        return this._controller;
    }
    /**
     * Setter controller
     * @param {any} value
     */
    set controller(value) {
        this._controller = value;
    }
    render() {
        let modalSize = {};
        if (this.props.modalSize === anteros_react_template2_1.ModalSize.extrasmall) {
            modalSize = { extraSmall: true };
        }
        else if (this.props.modalSize === anteros_react_template2_1.ModalSize.small) {
            modalSize = { small: true };
        }
        else if (this.props.modalSize === anteros_react_template2_1.ModalSize.medium) {
            modalSize = { medium: true };
        }
        else if (this.props.modalSize === anteros_react_template2_1.ModalSize.large) {
            modalSize = { large: true };
        }
        else if (this.props.modalSize === anteros_react_template2_1.ModalSize.semifull) {
            modalSize = { semifull: true };
        }
        else if (this.props.modalSize === anteros_react_template2_1.ModalSize.full) {
            modalSize = { full: true };
        }
        return (react_1.default.createElement(anteros_react_containers_1.AnterosModal, Object.assign({ id: this.props.viewName, title: this.getCaption(), primary: true }, modalSize, { showHeaderColor: true, showContextIcon: false, isOpen: this.props.isOpenModal, onCloseButton: this.onCloseView, withScroll: false, hideExternalScroll: true }), this.getComponentSearch(this.props)));
    }
};
AnterosSearchView.defaultProps = {
    modalSize: anteros_react_template2_1.ModalSize.semifull,
    isOpenModal: false,
    needUpdateView: false,
};
AnterosSearchView = __decorate([
    anteros_react_core_1.boundClass
], AnterosSearchView);
exports.AnterosSearchView = AnterosSearchView;
function makeDefaultReduxPropsSearchView(controller) {
    const mapStateToProps = (state) => {
        let dataSource, currentFilter = undefined, activeFilterIndex = -1, needRefresh = false, needUpdateView = false, user;
        let reducer = state[controller.getResource().getSearchReducerName()];
        if (reducer) {
            dataSource = reducer.dataSource;
            currentFilter = reducer.currentFilter;
            activeFilterIndex = reducer.activeFilterIndex;
            needRefresh = reducer.needRefresh;
        }
        user = state[controller.getAuthenticationReducerName()].user;
        reducer = state[controller.getLayoutReducerName()];
        if (reducer) {
            needUpdateView = reducer.needUpdateView;
        }
        return {
            dataSource: dataSource,
            currentFilter: currentFilter,
            activeFilterIndex: activeFilterIndex,
            user: user,
            needRefresh: needRefresh,
            needUpdateView: needUpdateView,
            controller: controller,
        };
    };
    const mapDispatchToProps = (dispatch) => {
        return {
            setDatasource: (dataSource) => {
                dispatch(controller.getResource().searchActions.setDatasource(dataSource));
            },
            hideTour: () => {
                dispatch({ type: "HIDE_TOUR" });
            },
            setFilter: (currentFilter, activeFilterIndex) => {
                dispatch(controller
                    .getResource()
                    .searchActions.setFilter(currentFilter, activeFilterIndex));
            },
        };
    };
    return { mapStateToProps, mapDispatchToProps };
}
exports.makeDefaultReduxPropsSearchView = makeDefaultReduxPropsSearchView;


/***/ }),

/***/ "./src/AnterosView.tsx":
/*!*****************************!*\
  !*** ./src/AnterosView.tsx ***!
  \*****************************/
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeDefaultReduxPropsView = exports.AnterosView = exports.SEARCH = exports.VIEW = exports.EDIT = exports.ADD = void 0;
//@ts-nocheck
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const react_router_dom_1 = __webpack_require__(/*! react-router-dom */ "react-router-dom");
const anteros_react_containers_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-containers */ "@anterostecnologia/anteros-react-containers");
const anteros_react_buttons_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-buttons */ "@anterostecnologia/anteros-react-buttons");
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const anteros_react_loaders_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-loaders */ "@anterostecnologia/anteros-react-loaders");
const react_loader_spinner_1 = __webpack_require__(/*! react-loader-spinner */ "react-loader-spinner");
exports.ADD = "add";
exports.EDIT = "edit";
exports.VIEW = "view";
exports.SEARCH = "search";
let AnterosView = class AnterosView extends react_1.Component {
    constructor(props) {
        super(props);
        this._controller = props.controller;
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
    getViewHeight() {
        return "calc(100% - 100px)";
    }
    showHideLoad(show) {
        this.setState(Object.assign(Object.assign({}, this.state), { loading: show, update: Math.random() }));
    }
    /**
     * Getter controller
     * @return {AnterosController<E,TypeID>}
     */
    get controller() {
        return this._controller;
    }
    /**
     * Setter controller
     * @param {any} value
     */
    set controller(value) {
        this._controller = value;
    }
    onResize(width, height) { }
    render() {
        const routeName = this.getRouteName();
        return (react_1.default.createElement(anteros_react_containers_1.AnterosCard, { caption: this.getCaption(), className: "versatil-card-full", withScroll: this.props.history.location &&
                (this.props.history.location.pathname.includes(exports.ADD) ||
                    this.props.history.location.pathname.includes(exports.EDIT) ||
                    this.props.history.location.pathname.includes(exports.VIEW)), styleBlock: {
                height: this.getViewHeight(),
            } },
            react_1.default.createElement(anteros_react_containers_1.HeaderActions, null,
                react_1.default.createElement(anteros_react_buttons_1.AnterosButton, { id: "btnClose", onButtonClick: this.onCloseView, icon: "fa fa-times", small: true, circle: true, disabled: !this.isCloseViewEnabled() })),
            react_1.default.createElement(anteros_react_core_1.AnterosResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize }),
            react_1.default.createElement(anteros_react_loaders_1.AnterosBlockUi, { tagStyle: {
                    height: "100%",
                }, styleBlockMessage: {
                    border: "2px solid white",
                    width: "200px",
                    height: "80px",
                    padding: "8px",
                    backgroundColor: this.props.loadingBackgroundColor,
                    borderRadius: "8px",
                    color: "white",
                }, styleOverlay: {
                    opacity: 0.1,
                    backgroundColor: "black",
                }, tag: "div", blocking: this.props.loading, message: this.props.loadingMessage, loader: react_1.default.createElement(react_loader_spinner_1.TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: this.props.loadingColor }) },
                react_1.default.createElement(react_router_dom_1.Switch, null,
                    react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: [`${routeName}`, `${routeName}/${exports.SEARCH}`], render: (props) => {
                            return this.getComponentSearch(props);
                        } }),
                    react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: [
                            `${routeName}/${exports.ADD}`,
                            `${routeName}/${exports.EDIT}`,
                            `${routeName}/${exports.VIEW}`,
                        ], render: (props) => {
                            return this.getComponentForm(props);
                        } })))));
    }
};
AnterosView.defaultProps = {
    loadingMessage: "Aguarde...",
    loadingBackgroundColor: "rgb(56 70 112)",
    loadingColor: "#f2d335",
};
AnterosView = __decorate([
    anteros_react_core_1.boundClass
], AnterosView);
exports.AnterosView = AnterosView;
function makeDefaultReduxPropsView(controller) {
    const mapStateToProps = (state) => {
        let dataSource, dataSourceEdition, currentFilter = undefined, activeFilterIndex = -1, needRefresh = false, needUpdateView = false, user;
        let reducer = state[controller.getResource().getReducerName()];
        if (reducer) {
            dataSource = reducer.dataSource;
            dataSourceEdition = reducer.dataSourceEdition;
            currentFilter = reducer.currentFilter;
            activeFilterIndex = reducer.activeFilterIndex;
            needRefresh = reducer.needRefresh;
        }
        user = state[controller.getAuthenticationReducerName()].user;
        reducer = state[controller.getLayoutReducerName()];
        if (reducer) {
            needUpdateView = reducer.needUpdateView;
        }
        return {
            dataSource: dataSource,
            dataSourceEdition: dataSourceEdition,
            currentFilter: currentFilter,
            activeFilterIndex: activeFilterIndex,
            user: user,
            needRefresh: needRefresh,
            needUpdateView: needUpdateView,
            controller: controller,
        };
    };
    const mapDispatchToProps = (dispatch) => {
        return {
            setNeedRefresh: () => {
                dispatch(controller.getResource().actions.setNeedRefresh());
            },
            setDatasource: (dataSource) => {
                dispatch(controller.getResource().actions.setDatasource(dataSource));
            },
            setDatasourceEdition: (dataSource) => {
                dispatch(controller.getResource().actions.setDatasourceEdition(dataSource));
            },
            hideTour: () => {
                dispatch({ type: "HIDE_TOUR" });
            },
            setFilter: (currentFilter, activeFilterIndex) => {
                dispatch(controller
                    .getResource()
                    .actions.setFilter(currentFilter, activeFilterIndex));
            },
        };
    };
    return { mapStateToProps, mapDispatchToProps };
}
exports.makeDefaultReduxPropsView = makeDefaultReduxPropsView;


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

/***/ "@anterostecnologia/anteros-react-loaders":
/*!***********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-loaders" ***!
  \***********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-loaders");

/***/ }),

/***/ "@anterostecnologia/anteros-react-template2":
/*!*************************************************************!*\
  !*** external "@anterostecnologia/anteros-react-template2" ***!
  \*************************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-template2");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react-loader-spinner":
/*!***************************************!*\
  !*** external "react-loader-spinner" ***!
  \***************************************/
/***/ ((module) => {

module.exports = require("react-loader-spinner");

/***/ }),

/***/ "react-router-dom":
/*!***********************************!*\
  !*** external "react-router-dom" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("react-router-dom");

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
exports.SEARCH = exports.VIEW = exports.EDIT = exports.ADD = exports.makeDefaultReduxPropsSearchView = exports.makeDefaultReduxPropsView = exports.AnterosView = exports.AnterosSearchView = exports.AnterosController = void 0;
const AnterosController_1 = __webpack_require__(/*! ./AnterosController */ "./src/AnterosController.ts");
Object.defineProperty(exports, "AnterosController", ({ enumerable: true, get: function () { return AnterosController_1.AnterosController; } }));
const AnterosSearchView_1 = __webpack_require__(/*! ./AnterosSearchView */ "./src/AnterosSearchView.tsx");
Object.defineProperty(exports, "AnterosSearchView", ({ enumerable: true, get: function () { return AnterosSearchView_1.AnterosSearchView; } }));
Object.defineProperty(exports, "makeDefaultReduxPropsSearchView", ({ enumerable: true, get: function () { return AnterosSearchView_1.makeDefaultReduxPropsSearchView; } }));
const AnterosView_1 = __webpack_require__(/*! ./AnterosView */ "./src/AnterosView.tsx");
Object.defineProperty(exports, "AnterosView", ({ enumerable: true, get: function () { return AnterosView_1.AnterosView; } }));
Object.defineProperty(exports, "makeDefaultReduxPropsView", ({ enumerable: true, get: function () { return AnterosView_1.makeDefaultReduxPropsView; } }));
Object.defineProperty(exports, "ADD", ({ enumerable: true, get: function () { return AnterosView_1.ADD; } }));
Object.defineProperty(exports, "EDIT", ({ enumerable: true, get: function () { return AnterosView_1.EDIT; } }));
Object.defineProperty(exports, "VIEW", ({ enumerable: true, get: function () { return AnterosView_1.VIEW; } }));
Object.defineProperty(exports, "SEARCH", ({ enumerable: true, get: function () { return AnterosView_1.SEARCH; } }));

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=anteros-react-mvc.js.map