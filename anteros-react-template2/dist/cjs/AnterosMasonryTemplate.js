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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnterosMasonryTemplate = exports.MasonryTemplateActions = void 0;
const react_1 = __importStar(require("react"));
const react_loader_spinner_1 = require("react-loader-spinner");
const anteros_react_datasource_1 = require("@anterostecnologia/anteros-react-datasource");
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
const anteros_react_querybuilder_1 = require("@anterostecnologia/anteros-react-querybuilder");
const anteros_react_containers_1 = require("@anterostecnologia/anteros-react-containers");
const anteros_react_loaders_1 = require("@anterostecnologia/anteros-react-loaders");
const anteros_react_layout_1 = require("@anterostecnologia/anteros-react-layout");
const anteros_react_navigation_1 = require("@anterostecnologia/anteros-react-navigation");
const AnterosAlert_1 = require("./AnterosAlert");
const anteros_react_buttons_1 = require("@anterostecnologia/anteros-react-buttons");
const anteros_react_label_1 = require("@anterostecnologia/anteros-react-label");
const react_addons_shallow_compare_1 = __importDefault(require("react-addons-shallow-compare"));
const lodash_1 = require("lodash");
const anteros_react_masonry_1 = require("@anterostecnologia/anteros-react-masonry");
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
            react_1.default.createElement(AnterosAlert_1.AnterosAlert, { danger: true, fill: true, isOpen: this.state.alertIsOpen, autoCloseInterval: 15000, onClose: this.onCloseAlert }, this.state.alertMessage),
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
//# sourceMappingURL=AnterosMasonryTemplate.js.map