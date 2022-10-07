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
exports.makeDefaultReduxPropsSearchView = exports.AnterosSearchView = void 0;
//@ts-nocheck
const react_1 = __importStar(require("react"));
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
const anteros_react_containers_1 = require("@anterostecnologia/anteros-react-containers");
const anteros_react_template2_1 = require("@anterostecnologia/anteros-react-template2");
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
//# sourceMappingURL=AnterosSearchView.js.map