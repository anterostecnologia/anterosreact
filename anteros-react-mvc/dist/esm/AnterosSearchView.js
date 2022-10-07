var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//@ts-nocheck
import React, { Component } from "react";
import { boundClass } from "@anterostecnologia/anteros-react-core";
import { AnterosModal } from "@anterostecnologia/anteros-react-containers";
import { ModalSize } from "@anterostecnologia/anteros-react-template2";
let AnterosSearchView = class AnterosSearchView extends Component {
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
        return (React.createElement(AnterosModal, Object.assign({ id: this.props.viewName, title: this.getCaption(), primary: true }, modalSize, { showHeaderColor: true, showContextIcon: false, isOpen: this.props.isOpenModal, onCloseButton: this.onCloseView, withScroll: false, hideExternalScroll: true }), this.getComponentSearch(this.props)));
    }
};
AnterosSearchView.defaultProps = {
    modalSize: ModalSize.semifull,
    isOpenModal: false,
    needUpdateView: false,
};
AnterosSearchView = __decorate([
    boundClass
], AnterosSearchView);
export { AnterosSearchView };
export function makeDefaultReduxPropsSearchView(controller) {
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
//# sourceMappingURL=AnterosSearchView.js.map