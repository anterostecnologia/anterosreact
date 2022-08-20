import React, { Component, Fragment } from "react";
import { TailSpin } from "react-loader-spinner";
import { AnterosRemoteDatasource, dataSourceEvents, dataSourceConstants, DATASOURCE_EVENTS, } from "@anterostecnologia/anteros-react-datasource";
import { AnterosSweetAlert, autoBind, processErrorMessage, AnterosResizeDetector, } from "@anterostecnologia/anteros-react-core";
import { AnterosQueryBuilder, NORMAL, QUICK, ADVANCED, AnterosFilterDSL, AnterosQueryBuilderData, } from "@anterostecnologia/anteros-react-querybuilder";
import { FooterActions } from "@anterostecnologia/anteros-react-containers";
import { AnterosBlockUi } from "@anterostecnologia/anteros-react-loaders";
import { AnterosCol, AnterosRow, } from "@anterostecnologia/anteros-react-layout";
import { AnterosPagination } from "@anterostecnologia/anteros-react-navigation";
import { AnterosAlert } from "./AnterosAlert";
import { AnterosDataTable } from "@anterostecnologia/anteros-react-table";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosLabel } from "@anterostecnologia/anteros-react-label";
import shallowCompare from "react-addons-shallow-compare";
import { noop } from "lodash";
class AnterosTableTemplate extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
        this._dataSourceFilter = this.createDataSourceFilter(props);
        if (props.onCustomCreateDatasource) {
            this._dataSource = props.onCustomCreateDatasource();
        }
        if (!this._dataSource) {
            this.createMainDataSource();
        }
        if (this._dataSource instanceof AnterosRemoteDatasource) {
            this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        }
        this._dataSource.addEventListener(DATASOURCE_EVENTS, this.onDatasourceEvent);
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
        return AnterosQueryBuilderData.createDatasource(props.viewName, props.filterName, props.version);
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
            if (this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                this._dataSource.cancel();
            }
        }
        else {
            this._dataSource = new AnterosRemoteDatasource();
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
        this._dataSource.addEventListener(DATASOURCE_EVENTS, this.onDatasourceEvent);
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
                if (this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
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
            this._dataSource.removeEventListener(DATASOURCE_EVENTS, this.onDatasourceEvent);
            if (this._dataSource instanceof AnterosRemoteDatasource) {
                this._dataSource.setAjaxPageConfigHandler(null);
            }
        }
        if (this.props.onWillUnmount) {
            this.props.onWillUnmount();
        }
        this.props.hideTour();
    }
    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }
    onFilterChanged(filter, activeFilterIndex, callback = noop) {
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
        if (event === dataSourceEvents.BEFORE_OPEN ||
            event === dataSourceEvents.BEFORE_GOTO_PAGE) {
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: true }));
        }
        if (event === dataSourceEvents.BEFORE_POST) {
            if (this.props.onBeforePost) {
                this.props.onBeforePost();
            }
        }
        if (event === dataSourceEvents.AFTER_OPEN ||
            event === dataSourceEvents.AFTER_GOTO_PAGE ||
            event === dataSourceEvents.ON_ERROR) {
            this.props.setDatasource(this._dataSource);
            this.setState(Object.assign(Object.assign({}, this.state), { update: Math.random(), alertIsOpen: false, loading: false }));
        }
        if (event === dataSourceEvents.AFTER_INSERT) {
            if (this.props.onAfterInsert) {
                this.props.onAfterInsert();
            }
        }
        if (event === dataSourceEvents.ON_ERROR) {
            if (error) {
                this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, loading: false, update: Math.random(), alertMessage: processErrorMessage(error) }));
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
            AnterosSweetAlert({
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
                        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, update: Math.random(), alertMessage: processErrorMessage(error) }));
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
        this.onShowHideLoad(true);
        this._dataSource.open(this.getData(this.props.currentFilter, 0), () => {
            this.onShowHideLoad(false);
        });
    }
    getData(currentFilter, page) {
        if (currentFilter &&
            currentFilter.filter.filterType === QUICK &&
            currentFilter.filter.quickFilterText &&
            currentFilter.filter.quickFilterText !== "") {
            return this.getDataWithQuickFilter(currentFilter, page);
        }
        else if (currentFilter &&
            (currentFilter.filter.filterType === NORMAL ||
                currentFilter.filter.filterType === ADVANCED)) {
            return this.getDataWithFilter(currentFilter, page);
        }
        else {
            return this.getDataWithoutFilter(page);
        }
    }
    getDataWithFilter(currentFilter, page) {
        var filter = new AnterosFilterDSL();
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
        return (React.createElement(Fragment, null,
            React.createElement(AnterosResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize }),
            React.createElement(AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 15000, onClose: this.onCloseAlert }, this.state.alertMessage),
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
                }, tag: "div", blocking: this.state.loading, message: messageLoading, loader: customLoader ? (customLoader) : (React.createElement(TailSpin, { width: "40px", height: "40px", ariaLabel: "loading-indicator", color: "#f2d335" })) },
                this.props.withFilter ? (React.createElement("div", { style: {
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-between",
                    } },
                    React.createElement("div", { style: {
                            width: "calc(100%)",
                        } },
                        React.createElement(UserActions, { dataSource: this._dataSource, onButtonClick: this.onButtonClick, routes: this.props.routes, allowRemove: this.props.allowRemove, labelButtonAdd: this.props.labelButtonAdd, labelButtonEdit: this.props.labelButtonEdit, labelButtonRemove: this.props.labelButtonRemove, labelButtonSelect: this.props.labelButtonSelect, labelButtonView: this.props.labelButtonView, positionUserActions: this.props.positionUserActions
                                ? this.props.positionUserActions
                                : "first", userActions: this.props.userActions })),
                    React.createElement(AnterosQueryBuilder, { zIndex: 50, id: this.props.filterName, formName: this.props.viewName, ref: (ref) => (this._filterRef = ref), expandedFilter: this.state.filterExpanded, update: this.state.update, dataSource: this._dataSourceFilter, currentFilter: this.props.currentFilter, activeFilterIndex: this.props.activeFilterIndex, onSelectedFilter: this.onSelectedFilter, onFilterChanged: this.onFilterChanged, onSearchByFilter: this.onSearchByFilter, onToggleExpandedFilter: this.onToggleExpandedFilter, width: "660px", height: "170px", allowSort: true, disabled: this._dataSource.getState() !== dataSourceConstants.DS_BROWSE }, this.props.fieldsFilter))) : (React.createElement("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    } },
                    React.createElement(UserActions, { dataSource: this._dataSource, onButtonClick: this.onButtonClick, routes: this.props.routes, allowRemove: this.props.allowRemove, labelButtonAdd: this.props.labelButtonAdd, labelButtonEdit: this.props.labelButtonEdit, labelButtonRemove: this.props.labelButtonRemove, labelButtonSelect: this.props.labelButtonSelect, labelButtonView: this.props.labelButtonView, positionUserActions: this.props.positionUserActions
                            ? this.props.positionUserActions
                            : "first", userActions: this.props.userActions }))),
                this.props.children,
                React.createElement(AnterosDataTable, { id: "table" + this.props.viewName, height: "200px", ref: (ref) => (this._tableRef = ref), dataSource: this._dataSource, width: "100%", enablePaging: false, enableSearching: false, showExportButtons: false, onDoubleClick: this.onDoubleClickTable, onSelectRecord: this.handleOnSelectRecord, onUnSelectRecord: this.handleOnUnselectRecord, onSelectAllRecords: this.handleOnSelectAllRecords, onUnSelectAllRecords: this.handleOnUnselectAllRecords }, this.props.columns)),
            React.createElement(FooterActions, { className: "versatil-card-footer" },
                React.createElement(AnterosRow, { className: "row justify-content-start align-items-center" },
                    React.createElement(AnterosCol, { medium: 4 },
                        React.createElement(AnterosLabel, { caption: `Total ${this.props.caption} ${this._dataSource.getGrandTotalRecords()}` })),
                    React.createElement(AnterosCol, { medium: 7 },
                        React.createElement(AnterosPagination, { horizontalEnd: true, dataSource: this._dataSource, visiblePages: 8, onBeforePageChanged: this.onBeforePageChanged, onPageChanged: this.handlePageChanged })))),
            modals));
    }
}
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
};
class UserActions extends Component {
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
        return (React.createElement("div", { style: { display: "flex" } },
            this.props.positionUserActions === "first"
                ? this.props.userActions
                : null,
            this.props.routes.edit ? (React.createElement(AnterosButton, { id: "btnView", route: this.props.routes.edit, icon: "fal fa-eye", small: true, className: "versatil-btn-visualizar", caption: this.getLabelButtonView(), hint: this.getLabelButtonView(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE })) : null,
            this.props.routes.add ? (React.createElement(AnterosButton, { id: "btnAdd", route: this.props.routes.add, icon: "fal fa-plus", small: true, className: "versatil-btn-adicionar", caption: this.getLabelButtonAdd(), hint: this.getLabelButtonAdd(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE })) : null,
            this.props.routes.edit ? (React.createElement(AnterosButton, { id: "btnEdit", route: this.props.routes.edit, icon: "fal fa-pencil", small: true, className: "versatil-btn-editar", caption: this.getLabelButtonEdit(), hint: this.getLabelButtonEdit(), onButtonClick: this.props.onButtonClick, disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE })) : null,
            this.props.allowRemove ? (React.createElement(AnterosButton, { id: "btnRemove", icon: "fal fa-trash", disabled: this.props.dataSource.isEmpty() ||
                    this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE, small: true, caption: this.getLabelButtonRemove(), hint: this.getLabelButtonRemove(), className: "versatil-btn-remover", onButtonClick: this.props.onButtonClick })) : null,
            " ",
            this.props.positionUserActions === "last"
                ? this.props.userActions
                : null));
    }
}
export class TableTemplateActions extends Component {
    render() {
        return React.createElement(Fragment, null, this.props.children);
    }
}
export { AnterosTableTemplate };
//# sourceMappingURL=AnterosTableTemplate.js.map