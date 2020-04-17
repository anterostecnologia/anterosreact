import React from 'react';
import { connect } from 'react-redux';

import { processErrorMessage, AnterosError } from 'anteros-react-core';
import { AnterosModal, ModalActions } from 'anteros-react-containers';
import { AnterosRow, AnterosCol } from 'anteros-react-layout';
import { AnterosPagination } from 'anteros-react-navigation';
import { AnterosAlert } from 'anteros-react-notification';
import { AnterosMasonry } from 'anteros-react-masonry';
import { AnterosButton } from 'anteros-react-buttons';
import { autoBind } from 'anteros-react-core';
import {
    AnterosQueryBuilder,
    AnterosQueryBuilderData,
    AnterosFilterDSL,
    CustomFilter
} from 'anteros-react-querybuilder';
import {
    AnterosRemoteDatasource,
    dataSourceEvents,
    DATASOURCE_EVENTS,
    dataSourceConstants
} from 'anteros-react-datasource';

const defaultValues = {
    openDataSourceFilter: true,
    openMainDataSource: true,
    messageLoading: 'Carregando, por favor aguarde...',
    withFilter: true,
    fieldsToForceLazy: '',
    modalSize: 'semifull',
    defaultSortFields: ''
};

export default function WithSearchMasonryModalTemplate(_loadingProps) {
    let loadingProps = { ...defaultValues, ..._loadingProps };

    const mapStateToProps = state => {
        let query, sort, activeSortIndex, activeFilter, user, quickFilterText;
        let reducer = state[loadingProps.reducerName];
        if (reducer) {
            query = reducer.query;
            sort = reducer.sort;
            activeSortIndex = reducer.activeSortIndex;
            activeFilter = reducer.activeFilter;
            quickFilterText = reducer.quickFilterText;
        }
        user = state[loadingProps.userReducerName].user;
        return {
            query: query,
            sort: sort,
            activeSortIndex: activeSortIndex,
            activeFilter: activeFilter,
            user: user,
            quickFilterText: quickFilterText
        };
    };

    const mapDispatchToProps = dispatch => {
        return {
            setDatasource: dataSource => {
                dispatch(loadingProps.actions.setDatasource(dataSource));
            },
            setFilter: (activeFilter, query, sort, activeSortIndex, quickFilterText) => {
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

    return WrappedComponent => {
        class SearchMasonryModal extends WrappedComponent {
            constructor(props, context) {
                super(props);
                autoBind(this);
                this.filterRef = React.createRef();

                if (!loadingProps.endPoints) {
                    throw new AnterosError(
                        'Informe o objeto com os endPoints de consulta. '
                    );
                }
                if (!loadingProps.resource) {
                    throw new AnterosError('Informe o nome do RESOURCE de consulta. ');
                }
                if (!loadingProps.reducerName) {
                    throw new AnterosError('Informe o nome do REDUCER. ');
                }
                if (!loadingProps.viewName) {
                    throw new AnterosError('Informe o nome da View. ');
                }
                if (!loadingProps.caption) {
                    throw new AnterosError('Informe o caption(titulo) da View. ');
                }
                if (loadingProps.withFilter === true && !loadingProps.filterName) {
                    throw new AnterosError('Informe o nome do filtro. ');
                }

                if (WrappedComponent.prototype.hasOwnProperty('getViewItem') === false) {
                    throw new AnterosError('Implemente o método getViewItem na classe.');
                }

                if (
                    loadingProps.withFilter &&
                    WrappedComponent.prototype.hasOwnProperty('getFieldsFilter') === false
                ) {
                    throw new AnterosError(
                        'Implemente o método getFieldsFilter na classe.'
                    );
                }

                if (WrappedComponent.prototype.hasOwnProperty('getRoutes') && this.getRoutes()) {
                    loadingProps.routes = this.getRoutes();
                }

                this.hasUserActions = WrappedComponent.prototype.hasOwnProperty(
                    'getUserActions'
                );
                this.positionUserActions =
                    WrappedComponent.prototype.hasOwnProperty(
                        'getPositionUserActions'
                    ) === true
                        ? this.getPositionUserActions()
                        : 'first';

                this.createDataSourceFilter();

                if (
                    WrappedComponent.prototype.hasOwnProperty(
                        'onCreateDatasource'
                    ) === true
                ) {
                    this.dataSource = this.onCreateDatasource();
                    this.dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
                    this.dataSource.addEventListener(
                        DATASOURCE_EVENTS,
                        this.onDatasourceEvent
                    );
                } else {
                    this.createMainDataSource();
                }

                this.state = {
                    dataSource: [],
                    selectedItem: null,
                    alertIsOpen: false,
                    alertMessage: '',
                    modalOpen: '',
                    modalCallback: null
                };

                autoBind(this);
            }
            createDataSourceFilter() {
                this.dsFilter = new AnterosRemoteDatasource();
                AnterosQueryBuilderData.configureDatasource(this.dsFilter);
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
                        loadingProps.pageSize,
                        this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy
                    );
                } else {
                    if (
                        this.filterRef.current.getQuickFilterText() &&
                        this.filterRef.current.getQuickFilterText() !== ''
                    ) {
                        return loadingProps.endPoints.FIND_MULTIPLE_FIELDS(
                            loadingProps.resource,
                            this.props.quickFilterText,
                            this.filterRef.current.getQuickFilterFields(),
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

            componentDidMount() {
                this.openData();
                if (WrappedComponent.prototype.hasOwnProperty('onDidMount') === true) {
                    this.onDidMount();
                }
            }

            openData() {
                if (loadingProps.defaultSort) {
                    if (loadingProps.openDataSourceFilter) {
                        if (!this.dsFilter.isOpen()) {
                            this.dsFilter.open(
                                AnterosQueryBuilderData.getFilters(
                                    loadingProps.viewName,
                                    loadingProps.filterName
                                )
                            );
                        }
                    }
                    if (loadingProps.openMainDataSource) {
                        if (!this.dataSource.isOpen()) {
                            if (WrappedComponent.prototype.hasOwnProperty('onFindAll') === true) {
                                this.dataSource.open(this.onFindAll(0, loadingProps.pageSize, loadingProps.defaultSort, this.getUser(), loadingProps.fieldsToForceLazy));
                            } else {
                                this.dataSource.open(
                                    loadingProps.endPoints.FIND_ALL(
                                        loadingProps.resource,
                                        0,
                                        loadingProps.pageSize,
                                        loadingProps.defaultSort, this.getUser(), loadingProps.fieldsToForceLazy
                                    )
                                );
                            }
                            this.handlePageChanged(0);
                        }
                        if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                            this.dataSource.cancel();
                        }
                    }
                }
            }

            componentWillUnmount() {
                if (this.dataSource) {
                    this.dataSource.removeEventListener(
                        DATASOURCE_EVENTS,
                        this.onDatasourceEvent
                    );
                    this.dataSource.setAjaxPageConfigHandler(null);
                }
                if (WrappedComponent.prototype.hasOwnProperty('onWillUnmount') === true) {
                    this.onWillUnmount();
                }
            }

            componentDidUpdate() {
                this.openData();
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
                            sort, this.getUser(), loadingProps.fieldsToForceLazy
                        )
                    );
                }
            }

            onToggleFilter(opened) {
                this.onResize(
                    this.card.getCardBlockWidth(),
                    this.card.getCardBlockHeight()
                );
            }

            getSortFields() {
                if (this.filterRef.current.getQuickFilterSort() && this.filterRef.current.getQuickFilterSort() !== '') {
                    return this.filterRef.current.getQuickFilterSort();
                }
                return loadingProps.defaultSortFields;
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
                                0,
                                loadingProps.pageSize,
                                this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy
                            )
                        );
                    }
                } else {
                    if (WrappedComponent.prototype.hasOwnProperty('onFindAll') === true) {
                        this.dataSource.open(this.onFindAll(0, loadingProps.pageSize,
                            this.getSortFields(),
                            this.getUser(), loadingProps.fieldsToForceLazy));
                    } else {
                        this.dataSource.open(
                            loadingProps.endPoints.FIND_ALL(
                                loadingProps.resource,
                                0,
                                loadingProps.pageSize,
                                this.getSortFields(), this.getUser(), loadingProps.fieldsToForceLazy
                            )
                        );
                    }
                }
            }

            autoCloseAlert() {
                this.setState({
                    ...this.state,
                    alertIsOpen: false,
                    alertMessage: ''
                });
            }

            onClick(event) {
                if (event.target.getAttribute('data-user') === 'btnOK') {
                    if (!this.state.selectedItem) {
                        this.setState({
                            ...this.state,
                            alertIsOpen: true,
                            alertMessage: 'Selecione um registro para continuar.'
                        });
                    } else {
                        if (this.props.selectedRecords.length === 0) {
                            this.props.selectedRecords.push(
                                this.dataSource.getCurrentRecord()
                            );
                        }
                        this.props.onClickOk(event, this.props.selectedRecords);
                    }
                } else if (event.target.getAttribute('data-user') === 'btnCancel') {
                    if (this.props.onClickCancel) {
                        this.props.onClickCancel(event);
                    }
                }
            }

            onCloseButton() {
                if (this.props.onClickCancel) {
                    this.props.onClickCancel();
                }
            }

            onSelectedItem(item) {
                this.setState({
                    ...this.state,
                    selectedItem:
                        this.state.selectedItem && item.id === this.state.selectedItem.id
                            ? null
                            : item
                });
                this.dataSource.locate({ id: item.id });
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
                        />
                    );
                }
                return result;
            }

            render() {
                let modalOpen = this.props.modalOpen;
                if (modalOpen && modalOpen.includes('#')) {
                    modalOpen = modalOpen.split('#')[0];
                }
                let modalSize = {};
                if (loadingProps.modalSize === "extrasmall") {
                    modalSize = { extraSmall: true }
                } else if (loadingProps.modalSize === "small") {
                    modalSize = { small: true }
                } else if (loadingProps.modalSize === "medium") {
                    modalSize = { medium: true }
                } else if (loadingProps.modalSize === "large") {
                    modalSize = { large: true }
                } else if (loadingProps.modalSize === "semifull") {
                    modalSize = { semifull: true }
                } else if (loadingProps.modalSize === "full") {
                    modalSize = { full: true }
                }
                return (
                    <AnterosModal
                        id={loadingProps.viewName}
                        title={loadingProps.caption}
                        primary
                        {...modalSize}
                        showHeaderColor={true}
                        showContextIcon={false}
                        isOpen={modalOpen === loadingProps.viewName}
                        onCloseButton={this.onCloseButton}
                    >
                        <AnterosAlert
                            danger
                            fill
                            isOpen={this.state.alertIsOpen}
                            autoCloseInterval={15000}
                        >
                            {this.state.alertMessage}
                        </AnterosAlert>
                        <ModalActions>
                            {this.positionUserActions === 'first'
                                ? this.hasUserActions
                                    ? this.getUserActions()
                                    : null
                                : null}
                            <AnterosButton success dataUser="btnOK" onClick={this.onClick}>
                                OK
                            </AnterosButton>{' '}
                            <AnterosButton danger dataUser="btnCancel" onClick={this.onClick}>
                                Fechar
                            </AnterosButton>
                            {this.positionUserActions === 'last'
                                ? this.hasUserActions
                                    ? this.getUserActions()
                                    : null
                                : null}
                        </ModalActions>

                        <div>
                            {loadingProps.withFilter ? (
                                <AnterosQueryBuilder
                                    query={this.props.query}
                                    sort={this.props.sort}
                                    ref={this.filterRef}
                                    id={loadingProps.filterName}
                                    formName={loadingProps.viewName}
                                    activeSortIndex={this.props.activeSortIndex}
                                    dataSource={this.dsFiltro}
                                    activeFilter={this.props.activeFilter}
                                    onSaveFilter={this.onSaveFilter}
                                    onSelectActiveFilter={this.onSelectActiveFilter}
                                    onQueryChange={this.onQueryChange}
                                    onSortChange={this.onSortChange}
                                    quickFilterWidth="50%"
                                    onQuickFilter={this.onQuickFilter}
                                    quickFilterText={this.props.quickFilterText}
                                    height="170px"
                                    allowSort={true}
                                    disabled={
                                        this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                    }
                                    onSearchButtonClick={this.onSearchButtonClick}
                                >
                                    <CustomFilter>{this.getCustomFilter ? this.getCustomFilter() : null}</CustomFilter>
                                    <AnterosButton
                                        id="btnSelecionar"
                                        icon="fa fa-bolt"
                                        disabled={
                                            this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                        }
                                        warning
                                        onButtonClick={this.onButtonSearch}
                                    >
                                        Selecionar
                                    </AnterosButton>
                                    {this.getFieldsFilter()}
                                </AnterosQueryBuilder>
                            ) : null}


                            <div
                                style={{
                                    height: loadingProps.contentHeight,
                                    overflow: 'auto'
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


                            <AnterosRow>
                                <AnterosCol medium={12}>
                                    <AnterosPagination
                                        horizontalEnd
                                        dataSource={this.dataSource}
                                        visiblePages={3}
                                        onPageChanged={this.handlePageChanged}
                                    />
                                </AnterosCol>
                            </AnterosRow>
                            <WrappedComponent {...this.props} dataSource={this.dataSource} />
                        </div>
                    </AnterosModal>
                );
            }
        }

        return connect(
            mapStateToProps,
            mapDispatchToProps
        )(SearchMasonryModal);
    };
}
