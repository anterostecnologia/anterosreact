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
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDefaultReduxPropsView = exports.AnterosView = exports.SEARCH = exports.VIEW = exports.EDIT = exports.ADD = void 0;
//@ts-nocheck
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const anteros_react_containers_1 = require("@anterostecnologia/anteros-react-containers");
const anteros_react_buttons_1 = require("@anterostecnologia/anteros-react-buttons");
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
const anteros_react_loaders_1 = require("@anterostecnologia/anteros-react-loaders");
const react_loader_spinner_1 = require("react-loader-spinner");
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
//# sourceMappingURL=AnterosView.js.map