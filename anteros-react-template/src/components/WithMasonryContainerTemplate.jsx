import React from 'react';
import { autoBind } from '@anterostecnologia/anteros-react-core';
import {
    AnterosRemoteDatasource,
    dataSourceEvents,
    DATASOURCE_EVENTS,
    dataSourceConstants
} from '@anterostecnologia/anteros-react-datasource';
import { AnterosSweetAlert, AnterosError } from '@anterostecnologia/anteros-react-core';
import { connect } from 'react-redux';
import { processErrorMessage } from '@anterostecnologia/anteros-react-core';
import {
    AnterosFilterDSL,
    AnterosQueryBuilderData
} from '@anterostecnologia/anteros-react-querybuilder';
import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import {
    AnterosCard,
    HeaderActions,
    FooterActions
} from '@anterostecnologia/anteros-react-containers';
import { AnterosAlert } from '@anterostecnologia/anteros-react-notification';
import { AnterosResizeDetector } from '@anterostecnologia/anteros-react-core';
import { AnterosBlockUi } from '@anterostecnologia/anteros-react-loaders';
import { AnterosLoader } from '@anterostecnologia/anteros-react-loaders';
import { AnterosQueryBuilder } from '@anterostecnologia/anteros-react-querybuilder';
import { AnterosCol, AnterosRow } from '@anterostecnologia/anteros-react-layout';
import { AnterosLabel } from '@anterostecnologia/anteros-react-label';
import { AnterosPagination } from '@anterostecnologia/anteros-react-navigation';
import { AnterosMasonry } from '@anterostecnologia/anteros-react-masonry';

const defaultValues = {
    openDataSourceFilter: true,
    openMainDataSource: true,
    messageLoading: 'Por favor aguarde...',
    withFilter: true,
    fieldsToForceLazy: '',
    defaultSortFields: '',
    version: 'v1'
};

export default function WithMasonryContainerTemplate(_loadingProps) {
    let loadingProps = { ...defaultValues, ..._loadingProps };

    const mapStateToProps = state => {
        let dataSource,
            query,
            sort,
            activeSortIndex,
            activeFilter,
            quickFilterText,
            needUpdateView = false,
            user;
        let reducer = state[loadingProps.reducerName];
        if (reducer) {
            dataSource = reducer.dataSource;
            query = reducer.query;
            sort = reducer.sort;
            activeSortIndex = reducer.activeSortIndex;
            activeFilter = reducer.activeFilter;
            quickFilterText = reducer.quickFilterText;
        }
        user = state[loadingProps.userReducerName].user;

        reducer = state[loadingProps.layoutReducerName];
        if (reducer) {
            needUpdateView = reducer.needUpdateView;
        }

        return {
            dataSource: dataSource,
            query: query,
            sort: sort,
            activeSortIndex: activeSortIndex,
            activeFilter: activeFilter,
            quickFilterText: quickFilterText,
            user: user,
            needUpdateView: needUpdateView
        };
    };

    const mapDispatchToProps = dispatch => {
        return {
            setDatasource: dataSource => {
                dispatch(loadingProps.actions.setDatasource(dataSource));
            },
            hideTour: () => {
                dispatch({ type: "HIDE_TOUR" });
            },
            setFilter: (
                activeFilter,
                query,
                sort,
                activeSortIndex,
                quickFilterText
            ) => {
                dispatch(
                    loadingProps.actions.setFilter(
                        activeFilter,
                        query,
                        sort,
                        activeSortIndex,
                        quickFilterText
                    )
                );
            }
        };
    };

    if (!loadingProps.endPoints) {
        throw new AnterosError('Defina o objeto com os endPoints de consulta.');
    }

    return WrappedComponent => {
        class MasonryContainerView extends WrappedComponent {
            constructor(props, context) {
                super(props);

                this.filterRef = React.createRef();

                if (
                    WrappedComponent.prototype.hasOwnProperty('getFieldsFilter') === false
                ) {
                    throw new AnterosError(
                        'Implemente o método getFieldsFilter na classe ' +
                        WrappedComponent.type
                    );
                }

                if (
                    WrappedComponent.prototype.hasOwnProperty('getViewItem') === false
                ) {
                    throw new AnterosError(
                        'Implemente o método getViewItem na classe ' + WrappedComponent.type
                    );
                }

                if (
                    WrappedComponent.prototype.hasOwnProperty('getUserActions') === false
                ) {
                    throw new AnterosError(
                        'Implemente o método getUserActions na classe ' +
                        WrappedComponent.type
                    );
                }

                if (
                    WrappedComponent.prototype.hasOwnProperty(
                        'getPositionUserActions'
                    ) === false
                ) {
                    throw new AnterosError(
                        'Implemente o método getPositionUserActions na classe ' +
                        WrappedComponent.type
                    );
                }

                if (WrappedComponent.prototype.hasOwnProperty('getRoutes') && this.getRoutes()) {
                    loadingProps.routes = this.getRoutes();
                }

                autoBind(this);
                if (loadingProps.withFilter) {
                    this.createDataSourceFilter();
                }

                if (
                    WrappedComponent.prototype.hasOwnProperty(
                        'customCreateDatasource'
                    ) === true
                ) {
                    this.dataSource = this.customCreateDatasource();
                    this.dataSource.addEventListener(
                        DATASOURCE_EVENTS,
                        this.onDatasourceEvent
                    );
                } else {
                    this.createMainDataSource();
                }

                this.state = {
                    alertIsOpen: false,
                    alertMessage: '',
                    modalOpen: null,
                    update: Math.random(),
                    idRecord: 0,
                    contentHeight: 'auto',
                    selectedItem: undefined,
                    filterExpanded: undefined,
                    loading: false
                };
            }

            createDataSourceFilter() {
                this.dsFilter = new AnterosRemoteDatasource();
                AnterosQueryBuilderData.configureDatasource(this.dsFilter, loadingProps.version);
            }

            getUser() {
                if (this.props.user) {
                    return this.props.user;
                }
                return undefined;
            }

            createMainDataSource() {
                if (this.props.dataSource) {
                    this.dataSource = this.props.dataSource;
                    if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                        this.dataSource.cancel();
                    }
                } else {
                    this.dataSource = new AnterosRemoteDatasource();
                    this.dataSource.setAjaxPostConfigHandler(entity => {
                        return loadingProps.endPoints.POST(loadingProps.resource, entity, this.getUser());
                    });
                    this.dataSource.setValidatePostResponse(response => {
                        return response.data !== undefined;
                    });
                    this.dataSource.setAjaxDeleteConfigHandler(entity => {
                        return loadingProps.endPoints.DELETE(loadingProps.resource, entity, this.getUser());
                    });
                    this.dataSource.setValidateDeleteResponse(response => {
                        return response.data !== undefined;
                    });
                }

                this.dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
                this.dataSource.addEventListener(
                    DATASOURCE_EVENTS,
                    this.onDatasourceEvent
                );
            }

            componentDidMount() {
                if (loadingProps.openDataSourceFilter && loadingProps.withFilter === true) {
                    if (!this.dsFilter.isOpen()) {
                        this.dsFilter.open(
                            AnterosQueryBuilderData.getFilters(
                                loadingProps.viewName,
                                loadingProps.filterName,
                                loadingProps.version
                            )
                        );
                    }
                }

                if (loadingProps.openMainDataSource) {
                    if (WrappedComponent.prototype.hasOwnProperty('onFindAll') === true) {
                        this.dataSource.open(this.onFindAll(0, loadingProps.pageSize, this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy));
                    } else {
                        if (!this.dataSource.isOpen()) {
                            this._openMainDataSource();
                        }
                        if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                            this.dataSource.cancel();
                        }
                    }
                }
            }

            _openMainDataSource() {
                this.dataSource.open(loadingProps.endPoints.FIND_ALL(loadingProps.resource, 0, loadingProps.pageSize, this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy));
            }

            componentWillUnmount() {
                if (this.dataSource) {
                    this.dataSource.removeEventListener(
                        DATASOURCE_EVENTS,
                        this.onDatasourceEvent
                    );
                    if (this.dataSource instanceof AnterosRemoteDatasource) {
                        this.dataSource.setAjaxPageConfigHandler(null);
                    }
                }
                this.props.hideTour();
            }

            componentWillReceiveProps(nextProps) {
                this.onResize(
                    this.card.getCardBlockWidth(),
                    this.card.getCardBlockHeight()
                );
            }

            onQueryChange(query) {
                this.props.setFilter(
                    this.props.activeFilter,
                    query,
                    this.props.sort,
                    this.props.activeSortIndex,
                    this.props.quickFilterText
                );
            }

            onSortChange(sort, activeSortIndex) {
                this.props.setFilter(
                    this.props.activeFilter,
                    this.props.query,
                    sort,
                    activeSortIndex,
                    this.props.quickFilterText
                );
            }

            getSortFields() {
                if (loadingProps.withFilter && this.filterRef && this.filterRef.current) {
                    if (this.filterRef.current.getQuickFilterSort() && this.filterRef.current.getQuickFilterSort() !== '') {
                        return this.filterRef.current.getQuickFilterSort();
                    }
                }
                return loadingProps.defaultSortFields;
            }

            onSelectActiveFilter(
                activeFilter,
                filter,
                sort,
                activeSortIndex,
                quickFilterText
            ) {
                this.props.setFilter(
                    activeFilter,
                    filter,
                    sort,
                    activeSortIndex,
                    quickFilterText
                );
            }

            handlePageChanged(newPage) {
                this.setState({
                    ...this.state,
                    currentPage: newPage
                });
            }

            onQuickFilter(filter, fields, sort) {
                if (WrappedComponent.prototype.hasOwnProperty('onFindMultipleFields') === true) {
                    this.dataSource.open(this.onFindMultipleFields(filter, fields, 0, loadingProps.pageSize, sort, this.getUser(), loadingProps.fieldsToForceLazy));
                } else {
                    this.dataSource.open(
                        loadingProps.endPoints.FIND_MULTIPLE_FIELDS(
                            loadingProps.resource,
                            filter,
                            fields,
                            0,
                            loadingProps.pageSize,
                            sort,
                            this.getUser(), loadingProps.fieldsToForceLazy
                        )
                    );
                }
            }

            setStateTemplate(state) {
                this.setState({ ...state });
            }

            onSelectedItem(item) {
                this.setState({
                    ...this.state,
                    selectedItem:
                        this.state.selectedItem && item.id === this.state.selectedItem.id
                            ? null
                            : item
                });
            }

            onDatasourceEvent(event, error) {
                let loading = this.state.loading;
                if (
                    event === dataSourceEvents.BEFORE_OPEN ||
                    event === dataSourceEvents.BEFORE_GOTO_PAGE
                ) {
                    loading = true;
                }

                if (
                    event === dataSourceEvents.AFTER_OPEN ||
                    event === dataSourceEvents.AFTER_GOTO_PAGE ||
                    event === dataSourceEvents.ON_ERROR
                ) {
                    this.props.setDatasource(this.dataSource);
                    loading = false;
                }

                if (event === dataSourceEvents.AFTER_INSERT) {
                }

                if (event === dataSourceEvents.ON_ERROR) {
                    if (error) {
                        this.setState({
                            ...this.state,
                            alertIsOpen: true,
                            loading: false,
                            alertMessage: processErrorMessage(error)
                        });
                    }
                } else {
                    this.setState({
                        ...this.state,
                        loading,
                        update: Math.random()
                    });
                }
            }

            onButtonClick(event, button) {
                if (WrappedComponent.prototype.hasOwnProperty('onCustomButtonClick') === true) {
                    if (!(this.onCustomButtonClick(event, button))) {
                        return;
                    }
                }

                if (button.props.id === 'btnAdd') {
                    if (WrappedComponent.prototype.hasOwnProperty('onCustomAdd') === true) {
                        this.onCustomAdd(button.props.route);
                        return;
                    } else {
                        if (!this.dataSource.isOpen()) this.dataSource.open();
                        this.dataSource.insert();
                    }
                } else if (button.props.id === 'btnEdit') {
                    if (WrappedComponent.prototype.hasOwnProperty('onCustomEdit') === true) {
                        this.dataSource.locate({ id: button.props.idRecord });
                        this.onCustomEdit(button.props.route);
                        return;
                    } else {
                        this.dataSource.locate({ id: button.props.idRecord });
                        this.dataSource.edit();
                    }
                } else if (button.props.id === 'btnRemove') {
                    this.dataSource.locate({ id: button.props.idRecord });
                    let _this = this;
                    AnterosSweetAlert({
                        title: 'Deseja remover ?',
                        text: '',
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sim',
                        cancelButtonText: 'Não',
                        focusCancel: true
                    })
                        .then(function () {
                            _this.dataSource.delete(error => {
                                if (error) {
                                    _this.setState({
                                        ..._this.state,
                                        alertIsOpen: true,
                                        alertMessage: processErrorMessage(error)
                                    });
                                }
                            });
                        })
                        .catch(error => { });
                } else if (button.props.id === 'btnClose') {
                    if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                        this.setState({
                            ...this.state,
                            alertIsOpen: true,
                            alertMessage: 'Salve ou cancele os dados antes de sair'
                        });
                        return;
                    }
                }
                this.props.history.push(button.props.route);
            }

            onSearchButtonClick(field, event) { }

            onDoubleClickTable(data) {
                this.props.history.push(loadingProps.routes.edit);
            }

            pageConfigHandler(page) {
                if (
                    this.props.query &&
                    this.props.query.rules &&
                    this.props.query.rules.length > 0
                ) {
                    var filter = new AnterosFilterDSL();
                    filter.buildFrom(this.props.query, this.props.sort);
                    return loadingProps.endPoints.FIND_WITH_FILTER(
                        loadingProps.resource,
                        filter.toJSON(),
                        page,
                        loadingProps.pageSize, this.getUser(), loadingProps.fieldsToForceLazy
                    );
                } else {
                    if (
                        this.filterRef.getQuickFilterText() &&
                        this.filterRef.getQuickFilterText() !== ''
                    ) {
                        return loadingProps.endPoints.FIND_MULTIPLE_FIELDS(
                            loadingProps.resource,
                            this.props.quickFilterText,
                            this.filterRef.getQuickFilterFields(),
                            page,
                            loadingProps.pageSize,
                            this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy
                        );
                    } else {
                        return loadingProps.endPoints.FIND_ALL(
                            loadingProps.resource,
                            page,
                            loadingProps.pageSize,
                            this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy
                        );
                    }
                }
            }

            onButtonSearch(event) {
                if (
                    this.props.query &&
                    this.props.query.rules &&
                    this.props.query.rules.length > 0
                ) {
                    var filter = new AnterosFilterDSL();
                    filter.buildFrom(this.props.query, this.props.sort);
                    if (WrappedComponent.prototype.hasOwnProperty('onFindWithFilter') === true) {
                        this.dataSource.open(this.onFindWithFilter(filter.toJSON(), 0, loadingProps.pageSize, this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy));
                    } else {
                        this.dataSource.open(
                            loadingProps.endPoints.FIND_WITH_FILTER(
                                loadingProps.resource,
                                filter.toJSON(),
                                loadingProps.pageSize,
                                0,
                                this.getUser(), loadingProps.fieldsToForceLazy
                            )
                        );
                    }
                } else {
                    this.props.setFilter(
                        this.props.activeFilter,
                        '',
                        this.props.sort,
                        this.props.activeSortIndex,
                        ''
                    );
                    if (WrappedComponent.prototype.hasOwnProperty('onFindAll') === true) {
                        this.dataSource.open(this.onFindAll(0, loadingProps.pageSize,
                            this.getSortFields(),
                            this.getUser(), loadingProps.fieldsToForceLazy));
                    } else {
                        this.dataSource.open(
                            loadingProps.endPoints.FIND_ALL(
                                loadingProps.resource,
                                0,
                                loadingProps.pageSize, this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy
                            )
                        );
                    }
                }
            }

            onCloseAlert() {
                this.setState({
                    ...this.state,
                    alertIsOpen: false,
                    alertMessage: ''
                });
            }

            createItems() {
                let ViewItem = this.getViewItem();
                let result = [];
                for (var i = 0; i < this.dataSource.getData().length; i++) {
                    let r = this.dataSource.getData()[i];
                    result.push(
                        <ViewItem
                            selected={
                                this.state.selectedItem
                                    ? this.state.selectedItem.id === r.id
                                    : false
                            }
                            onSelectedItem={this.onSelectedItem}
                            key={r.id}
                            record={r}
                            dispatch={this.props.dispatch}
                            history={this.props.history}
                            onButtonClick={this.onButtonClick}
                        />
                    );
                }
                return result;
            }

            onClickOk(event, selectedRecords) {
                this.setState({ ...this.state, modalOpen: null });
                this._openMainDataSource();
            }

            onClickCancel(event) {
                this.setState({ ...this.state, modalOpen: null });
            }

            onToggleExpandedFilter(expanded) {
                this.setState({
                    ...this.state,
                    filterExpanded: expanded
                })
            }

            onResize(width, height) {
                this.setState({
                    ...this.state,
                    contentHeight: height - 60
                })
            }

            render() {

                return (
                    <AnterosCard
                        caption={loadingProps.caption}
                        className="versatil-card-full"
                        ref={ref => (this.card = ref)}
                        withScroll={false}
                        styleBlock={{
                            height: 'calc(100% - 120px)'
                        }}
                    >
                        <AnterosResizeDetector
                            handleWidth
                            handleHeight
                            onResize={this.onResize}
                        />
                        <AnterosAlert
                            danger
                            fill
                            isOpen={this.state.alertIsOpen}
                            autoCloseInterval={15000}
                            onClose={this.onCloseAlert}
                        >
                            {this.state.alertMessage}
                        </AnterosAlert>
                        <HeaderActions>
                            <AnterosButton
                                id="btnClose"
                                onButtonClick={this.onButtonClick}
                                route={loadingProps.routes.close}
                                visible={loadingProps.routes.close !== undefined}
                                icon="fa fa-times"
                                small
                                circle
                                disabled={
                                    this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                }
                            />
                        </HeaderActions>
                        <AnterosBlockUi
                            tagStyle={{
                                height: this.state.filterExpanded ? '100%' : 'auto'
                            }}
                            styleBlockMessage={{
                                border: '2px solid white',
                                width: '200px',
                                backgroundColor: '#8BC34A',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                            styleOverlay={{
                                opacity: 0.1,
                                backgroundColor: 'black'
                            }}
                            tag="div"
                            blocking={this.state.loading}
                            message={loadingProps.messageLoading}
                            loader={
                                <AnterosLoader active type="ball-pulse" color="#02a17c" />
                            }
                        >

                            <div style={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                justifyContent: 'space-between',
                                width: 'calc(100%)',
                                height: 'calc(100%)'
                            }}>
                                <div
                                    style={{
                                        width: this.state.filterExpanded ? 'calc(100% - 350px)' : 'calc(100%)',
                                    }}
                                >
                                    <div>
                                        {this.getPositionUserActions() === 'first'
                                            ? this.getUserActions()
                                            : null}
                                        <AnterosButton
                                            id="btnAdd"
                                            route={loadingProps.routes.add}
                                            icon="fal fa-plus"
                                            small
                                            className="versatil-btn-adicionar"
                                            caption="Adicionar"
                                            hint="Adicionar"
                                            onButtonClick={this.onButtonClick}
                                            disabled={
                                                this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                            }
                                        />
                                        <AnterosButton
                                            id="btnSelect"
                                            icon="far fa-sync"
                                            disabled={
                                                this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                            }
                                            small
                                            secondary
                                            hint="Atualizar"
                                            caption="Atualizar"
                                            className="versatil-btn-selecionar"
                                            onButtonClick={this.onButtonSearch}
                                        />{' '}
                                        {this.getPositionUserActions() === 'last'
                                            ? this.getUserActions()
                                            : null}
                                    </div>

                                    {this.state.filterExpanded ? (
                                        <div
                                            style={{
                                                height: this.state.contentHeight,
                                                overflow: 'auto',
                                                paddingTop: '15px'
                                            }}
                                        >
                                            <AnterosMasonry
                                                className={'versatil-grid-layout'}
                                                elementType={'ul'}
                                                id={'masonry' + loadingProps.viewName}
                                                options={{
                                                    transitionDuration: 0,
                                                    gutter: 10,
                                                    horizontalOrder: true,
                                                    isOriginLeft: true
                                                }}
                                                disableImagesLoaded={false}
                                                updateOnEachImageLoad={false}
                                            >
                                                {!this.dataSource.isEmpty()
                                                    ? this.createItems()
                                                    : null}
                                            </AnterosMasonry>
                                        </div>
                                    ) : null}

                                </div>

                                <AnterosQueryBuilder
                                    zIndex={50}
                                    query={this.props.query}
                                    sort={this.props.sort}
                                    id={loadingProps.filtroDispositivos}
                                    formName={loadingProps.viewName}
                                    ref={this.filterRef}
                                    activeSortIndex={this.props.activeSortIndex}
                                    dataSource={this.dsFilter}
                                    activeFilter={this.props.activeFilter}
                                    onSaveFilter={this.onSaveFilter}
                                    onSelectActiveFilter={this.onSelectActiveFilter}
                                    onQueryChange={this.onQueryChange}
                                    onSortChange={this.onSortChange}
                                    onQuickFilter={this.onQuickFilter}
                                    quickFilterText={this.props.quickFilterText}
                                    quickFilterWidth={
                                        loadingProps.quickFilterWidth
                                            ? loadingProps.quickFilterWidth
                                            : '30%'
                                    }
                                    height="170px"
                                    allowSort={true}
                                    disabled={
                                        this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                    }
                                    onSearchButtonClick={this.onSearchButtonClick}
                                    onToggleExpandedFilter={this.onToggleExpandedFilter}
                                >
                                    {this.getFieldsFilter()}
                                </AnterosQueryBuilder>
                            </div>

                            {this.state.filterExpanded ? null : (
                                <div
                                    style={{
                                        height: this.state.contentHeight,
                                        overflow: 'auto',
                                        paddingTop: '15px'
                                    }}
                                >
                                    <AnterosMasonry
                                        className={'versatil-grid-layout'}
                                        elementType={'ul'}
                                        id={'masonry' + loadingProps.viewName}
                                        options={{
                                            transitionDuration: 0,
                                            gutter: 10,
                                            horizontalOrder: true,
                                            isOriginLeft: true
                                        }}
                                        disableImagesLoaded={false}
                                        updateOnEachImageLoad={false}
                                    >
                                        {!this.dataSource.isEmpty()
                                            ? this.createItems()
                                            : null}
                                    </AnterosMasonry>
                                </div>
                            )}
                            <WrappedComponent
                                {...this.props}
                                state={this.state}
                                user={this.props.user}
                                dataSource={this.dataSource}
                                onClickOk={this.onClickOk}
                                onClickCancel={this.onClickCancel}
                                history={this.props.history}
                            />
                        </AnterosBlockUi>
                        <FooterActions className="versatil-card-footer">
                            <AnterosRow>
                                <AnterosCol medium={4}>
                                    <AnterosLabel
                                        caption={`Total ${
                                            loadingProps.caption
                                            } ${this.dataSource.getGrandTotalRecords()}`}
                                    />
                                </AnterosCol>
                                <AnterosCol medium={8}>
                                    <AnterosPagination
                                        horizontalEnd
                                        dataSource={this.dataSource}
                                        visiblePages={3}
                                        onPageChanged={this.handlePageChanged}
                                    />
                                </AnterosCol>
                            </AnterosRow>
                        </FooterActions>
                    </AnterosCard>
                );
            }
        }
        return connect(
            mapStateToProps,
            mapDispatchToProps
        )(MasonryContainerView);
    };
}
