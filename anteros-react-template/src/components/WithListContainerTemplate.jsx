import React, { Component } from 'react';
import { connect } from 'react-redux';

import { autoBind, processErrorMessage, AnterosResizeDetector, AnterosSweetAlert, AnterosJacksonParser, AnterosError } from 'anteros-react-core';
import { AnterosQueryBuilderData, AnterosQueryBuilder, AnterosFilterDSL } from 'anteros-react-querybuilder';
import { AnterosRemoteDatasource, DATASOURCE_EVENTS, dataSourceEvents } from 'anteros-react-datasource';
import { AnterosCard, HeaderActions, FooterActions } from 'anteros-react-containers';
import { AnterosBlockUi, AnterosLoader } from 'anteros-react-loaders';
import { AnterosCol, AnterosRow } from 'anteros-react-layout';
import { AnterosPagination } from 'anteros-react-navigation';
import { AnterosAlert } from 'anteros-react-notification';
import { AnterosMasonry } from 'anteros-react-masonry';
import { AnterosButton } from 'anteros-react-buttons';
import { AnterosLabel } from 'anteros-react-label';

export default function WithListContainerTemplate(loadingProps, ViewItem) {
    const mapStateToProps = state => {
        return {
            dataSource: state[loadingProps.reducerName].dataSource,
            query: state[loadingProps.reducerName].query,
            sort: state[loadingProps.reducerName].sort,
            activeSortIndex: state[loadingProps.reducerName].activeSortIndex,
            activeFilter: state[loadingProps.reducerName].activeFilter,
            quickFilterText: state[loadingProps.reducerName].quickFilterText,
            user: state.authenticationReducer.user
        };
    };

    const mapDispatchToProps = dispatch => {
        return {
            setDatasource: dataSource => {
                dispatch(loadingProps.actions.setDatasource(dataSource));
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
        class ListContainerView extends Component {
            constructor(props, context) {
                super(props);
                autoBind(this);
                this.createDataSourceFilter();
                this.createMainDataSource();

                this.state = {
                    alertIsOpen: false,
                    alertMessage: '',
                    modalOpen: null,
                    update: Math.random(),
                    idRecord: 0,
                    contentHeight: '540px',
                    selectedItem: undefined,
                    loading: false
                };
            }

            createDataSourceFilter() {
                this.dsFilter = new AnterosRemoteDatasource();
                AnterosQueryBuilderData.configureDatasource(this.dsFilter, loadingProps.version);
            }

            createMainDataSource() {
                if (this.props.dataSource) {
                    this.dataSource = this.props.dataSource;
                } else {
                    this.dataSource = new AnterosRemoteDatasource();
                    this.dataSource.setAjaxPostConfigHandler(entity => {
                        let entityJson = AnterosJacksonParser.convertObjectToJson(entity);
                        return {
                            url: loadingProps.resource,
                            method: 'post',
                            data: entityJson
                        };
                    });
                    this.dataSource.setValidatePostResponse(response => {
                        return response.data !== undefined;
                    });
                    this.dataSource.setAjaxDeleteConfigHandler(dispositivo => {
                        return {
                            url: `${loadingProps.resource}${dispositivo.id}`,
                            method: 'delete'
                        };
                    });
                    this.dataSource.setValidateDeleteResponse(response => {
                        return response.data !== undefined;
                    });
                }

                if (WrappedComponent.prototype.hasOwnProperty('getRoutes') && this.getRoutes()) {
                    loadingProps.routes = this.getRoutes();
                }

                this.dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
                this.dataSource.addEventListener(
                    DATASOURCE_EVENTS,
                    this.onDatasourceEvent
                );
            }

            componentDidMount() {
                if (loadingProps.openDataSourceFilter) {
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
                    if (!this.dataSource.isOpen()) {
                        this.dataSource.open({
                            url: `${loadingProps.resource}${
                                loadingProps.getAllEndPoint
                                }?page=0&size=${loadingProps.pageSize}`,
                            method: 'get'
                        });
                    }
                    if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                        this.dataSource.cancel();
                    }
                }

                if (WrappedComponent.prototype.hasOwnProperty('onDidMount') === true) {
                    this.onDidMount();
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
                this.dataSource.open({
                    url: `${
                        loadingProps.resource
                        }findMultipleFields?filter=${filter}&fields=${fields}&size=${
                        loadingProps.pageSize
                        }&page=${0}&sort=${sort}`,
                    method: 'post'
                });
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
                if (button.props.id === 'btnAdd') {
                    if (!this.dataSource.isOpen()) this.dataSource.open();
                    this.dataSource.insert();
                } else if (button.props.id === 'btnEdit') {
                    this.dataSource.locate({ id: button.props.idRecord });
                    this.dataSource.edit();
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
                if (this.props.query.rules.length === 0) {
                    return {
                        url: `${loadingProps.resource}findAll?size=${
                            loadingProps.pageSize
                            }&page=${page}`,
                        method: 'get'
                    };
                } else {
                    var filter = new AnterosFilterDSL();
                    filter.buildFrom(this.props.query, this.props.sort);

                    return {
                        url: `${loadingProps.resource}findWithFilter?size=${
                            loadingProps.pageSize
                            }&page=${page}`,
                        method: 'post',
                        data: filter.toJSON()
                    };
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
                    this.dataSource.open({
                        url: `${loadingProps.resource}findWithFilter?size=${
                            loadingProps.pageSize
                            }&page=${0}`,
                        method: 'post',
                        data: filter.toJSON()
                    });
                } else {
                    this.dataSource.open({
                        url: `${loadingProps.resource}findAll?size=${
                            loadingProps.pageSize
                            }&page=${0}`,
                        method: 'get'
                    });
                }
            }

            onCloseAlert() {
                this.setState({
                    ...this.state,
                    alertIsOpen: false,
                    alertMessage: ''
                });
            }

            render() {
                return (
                    <AnterosCard
                        caption={loadingProps.caption}
                        className="versatil-card-full"
                        ref={ref => (this.card = ref)}
                    >
                        <AnterosResizeDetector
                            handleWidth
                            handleHeight
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
                                icon="fa fa-times"
                                small
                                circle
                                disabled={
                                    this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                }
                            />
                        </HeaderActions>
                        <AnterosBlockUi
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
                                justifyContent: 'space-between'
                            }}>

                                <div>
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
                                        id="btnEdit"
                                        route={loadingProps.routes.edit}
                                        icon="fal fa-pencil"
                                        small
                                        className="versatil-btn-editar"
                                        caption="Editar"
                                        onButtonClick={this.onButtonClick}
                                        disabled={
                                            this.dataSource.isEmpty() ||
                                            this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                        }
                                    />
                                    <AnterosButton
                                        id="btnRemove"
                                        icon="fal fa-trash"
                                        disabled={
                                            this.dataSource.isEmpty() ||
                                            this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                        }
                                        small
                                        caption="Remover"
                                        className="versatil-btn-remover"
                                        onButtonClick={this.onButtonClick}
                                    />
                                    <AnterosButton
                                        id="btnSelect"
                                        icon="far fa-sync"
                                        disabled={
                                            this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                                        }
                                        small
                                        secondary
                                        hint="Atualizar sem filtro"
                                        caption="Sem filtro"
                                        className="versatil-btn-selecionar"
                                        onButtonClick={this.onButtonSearch}
                                    />
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
                                >
                                    {loadingProps.filterFields}
                                </AnterosQueryBuilder>
                            </div>
                            <div
                                style={{
                                    height: this.state.contentHeight,
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
                                        ? this.dataSource.getData().map(r => {
                                            return (
                                                <ViewItem
                                                    selected={
                                                        this.state.selectedItem
                                                            ? this.state.selectedItem.id === r.id
                                                            : false
                                                    }
                                                    onSelectedItem={this.onSelectedItem}
                                                    key={r.id}
                                                    record={r}
                                                    onButtonClick={this.onButtonClick}
                                                />
                                            );
                                        })
                                        : null}
                                </AnterosMasonry>
                            </div>
                            <WrappedComponent
                                {...this.props}
                                state={this.state}
                                user={this.props.user}
                                history={this.props.history}
                                dataSource={this.dataSource}
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
