var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//@ts-nocheck
import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { AnterosCard, HeaderActions, } from "@anterostecnologia/anteros-react-containers";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { boundClass, AnterosResizeDetector, } from "@anterostecnologia/anteros-react-core";
import { AnterosBlockUi } from "@anterostecnologia/anteros-react-loaders";
import { TailSpin } from "react-loader-spinner";
export const ADD = "add";
export const EDIT = "edit";
export const VIEW = "view";
export const SEARCH = "search";
let AnterosView = class AnterosView extends Component {
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
        return (React.createElement(AnterosCard, { caption: this.getCaption(), className: "versatil-card-full", withScroll: this.props.history.location &&
                (this.props.history.location.pathname.includes(ADD) ||
                    this.props.history.location.pathname.includes(EDIT) ||
                    this.props.history.location.pathname.includes(VIEW)), styleBlock: {
                height: this.getViewHeight(),
            } },
            React.createElement(HeaderActions, null,
                React.createElement(AnterosButton, { id: "btnClose", onButtonClick: this.onCloseView, icon: "fa fa-times", small: true, circle: true, disabled: !this.isCloseViewEnabled() })),
            React.createElement(AnterosResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize }),
            React.createElement(AnterosBlockUi, { tagStyle: {
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
                }, tag: "div", blocking: this.props.loading, message: this.props.loadingMessage, loader: React.createElement(TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: this.props.loadingColor }) },
                React.createElement(Switch, null,
                    React.createElement(Route, { exact: true, path: [`${routeName}`, `${routeName}/${SEARCH}`], render: (props) => {
                            return this.getComponentSearch(props);
                        } }),
                    React.createElement(Route, { exact: true, path: [
                            `${routeName}/${ADD}`,
                            `${routeName}/${EDIT}`,
                            `${routeName}/${VIEW}`,
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
    boundClass
], AnterosView);
export { AnterosView };
export function makeDefaultReduxPropsView(controller) {
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
//# sourceMappingURL=AnterosView.js.map