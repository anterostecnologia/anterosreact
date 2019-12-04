import React, { Component, Fragment } from 'react';
import { autoBind, processErrorMessage } from 'anteros-react-core';
import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  dataSourceConstants,
  DATASOURCE_EVENTS
} from 'anteros-react-datasource';
import { AnterosSweetAlert, AnterosError } from 'anteros-react-core';
import { connect } from 'react-redux';
import {
  AnterosFilterDSL,
  AnterosQueryBuilderData
} from 'anteros-react-querybuilder';
import { AnterosButton } from 'anteros-react-buttons';
import {
  AnterosCard,
  HeaderActions,
  FooterActions
} from 'anteros-react-containers';
import { AnterosAlert } from 'anteros-react-notification';
import { AnterosResizeDetector } from 'anteros-react-core';
import { AnterosBlockUi } from 'anteros-react-loaders';
import { AnterosLoader } from 'anteros-react-loaders';
import { AnterosDataTable } from 'anteros-react-table';
import { AnterosQueryBuilder, CustomFilter } from 'anteros-react-querybuilder';
import { AnterosCol, AnterosRow } from 'anteros-react-layout';
import { AnterosLabel } from 'anteros-react-label';
import { AnterosPagination } from 'anteros-react-navigation';

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  messageLoading: 'Carregando, por favor aguarde...',
  withFilter: true,
  fieldsToForceLazy: ''
};

export default function WithTableContainerTemplate(_loadingProps) {
  let loadingProps = { ...defaultValues, ..._loadingProps };

  const mapStateToProps = state => {
    let dataSource,
      query,
      sort,
      activeSortIndex,
      activeFilter,
      quickFilterText,
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
    return {
      dataSource: dataSource,
      query: query,
      sort: sort,
      activeSortIndex: activeSortIndex,
      activeFilter: activeFilter,
      quickFilterText: quickFilterText,
      user: user
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

  return WrappedComponent => {
    class TableContainerView extends WrappedComponent {
      constructor(props, context) {
        super(props);
        autoBind(this);
        if (!loadingProps.endPoints) {
          throw new AnterosError(
            'Informe o objeto com os endPoints de consulta.'
          );
        }
        if (!loadingProps.resource) {
          throw new AnterosError('Informe o nome do RESOURCE de consulta. ');
        }
        if (!loadingProps.reducerName) {
          throw new AnterosError('Informe o nome do REDUCER. ');
        }
        if (!loadingProps.userReducerName) {
          throw new AnterosError('Informe o nome do REDUCER de Usuários. ');
        }
        if (!loadingProps.actions) {
          throw new AnterosError(
            'Informe o objeto com as actions do REDUCER. '
          );
        }
        if (!loadingProps.viewName) {
          throw new AnterosError('Informe o nome da View. ');
        }
        if (!loadingProps.caption) {
          throw new AnterosError('Informe o caption(titulo) da View. ');
        }
        if (loadingProps.withFilter && !loadingProps.filterName) {
          throw new AnterosError('Informe o nome do filtro. ');
        }
        if (!loadingProps.routes) {
          throw new AnterosError('Informe as rotas das ações. ');
        }

        if (WrappedComponent.prototype.hasOwnProperty('getColumns') === false) {
          throw new AnterosError('Implemente o método getColumns na classe.');
        }

        if (
          WrappedComponent.prototype.hasOwnProperty('getFieldsFilter') === false
        ) {
          throw new AnterosError(
            'Implemente o método getFieldsFilter na classe '
          );
        }

        this.filterRef = React.createRef();

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
        this.createMainDataSource();

        if (WrappedComponent.prototype.hasOwnProperty('getRoutes') && this.getRoutes()) {
          loadingProps.routes = this.getRoutes();
        }

        this.state = {
          dataSource: [],
          alertIsOpen: false,
          alertMessage: '',
          loading: false,
          update: Math.random()
        };
      }

      createDataSourceFilter() {
        this.dsFilter = new AnterosRemoteDatasource();
        AnterosQueryBuilderData.configureDatasource(this.dsFilter);
      }

      getDispatch() {
        return this.props.dispatch;
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
            this.dataSource.open(
              loadingProps.endPoints.FIND_ALL(
                loadingProps.resource,
                0,
                loadingProps.pageSize,
                this.filterRef.current.getQuickFilterSort(), this.getUser(), loadingProps.fieldsToForceLazy
              )
            );
          }
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.dataSource.cancel();
          }
        }
        this.table.refreshData();

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
      componentWillReceiveProps(nextProps) {
        if (this.dataSource) {
          if (this.table) {
            this.table.refreshData();
          }
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
      onBeforePageChanged(currentPage, newPage) {
        this.setState({
          ...this.state,
          loading: true
        });
      }

      handlePageChanged(newPage) {
        this.setState({
          ...this.state,
          currentPage: newPage,
          loading: false
        });
      }

      onQuickFilter(filter, fields, sort) {
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

      onToggleFilter(opened) {
        this.onResize(
          this.card.getCardBlockWidth(),
          this.card.getCardBlockHeight()
        );
      }

      onResize(width, height) {
        let newHeight;
        if (loadingProps.withFilter) {
          newHeight =
            height - this.filterRef.current.divFilter.clientHeight - 120;
        } else {
          newHeight = height - 120;
        }

        this.table.resize(width, newHeight);
      }

      onDatasourceEvent(event, error) {
        let loading = this.state.loading;
        if (
          event === dataSourceEvents.BEFORE_OPEN ||
          event === dataSourceEvents.BEFORE_GOTO_PAGE
        ) {
          loading = true;
        }

        if (event === dataSourceEvents.BEFORE_POST) {
          if (WrappedComponent.prototype.hasOwnProperty('onBeforePost') === true) {
            this.onBeforePost();
          }
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
          if (WrappedComponent.prototype.hasOwnProperty('onAfterInsert') === true) {
            this.onAfterInsert();
          }
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
          if (WrappedComponent.prototype.hasOwnProperty('onCustomAdd') === true) {
            this.onCustomAdd(button.props.route);
            return;
          } else {
            if (!this.dataSource.isOpen()) 
                 this.dataSource.open();
              this.dataSource.insert();
          }
        } else if (button.props.id === 'btnEdit') {
          if (WrappedComponent.prototype.hasOwnProperty('onCustomEdit') === true) {
            this.onCustomEdit(button.props.route);
            return;
          } else {
            this.dataSource.edit();
          }
        } else if (button.props.id === 'btnRemove') {
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

        if (this.props.onButtonClick) {
          this.props.onButtonClick(event, button);
        }
        if (button.props.route) {
          this.props.history.push(button.props.route);
        }
      }

      onSearchButtonClick(field, event) { }

      onDoubleClickTable(data) {
        if (loadingProps.routes.edit) {
          this.props.history.push(loadingProps.routes.edit);
        }
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
            this.filterRef.current.current.getQuickFilterSort()
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
              this.filterRef.current.getQuickFilterSort(), this.getUser()
            );
          } else {
            return loadingProps.endPoints.FIND_ALL(
              loadingProps.resource,
              page,
              loadingProps.pageSize,
              this.filterRef.current.getQuickFilterSort(), this.getUser()
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
          this.dataSource.open(
            loadingProps.endPoints.FIND_WITH_FILTER(
              loadingProps.resource,
              filter.toJSON(),
              loadingProps.pageSize,
              0, this.getUser(), loadingProps.fieldsToForceLazy
            )
          );
        } else {
          this.props.setFilter(
            this.props.activeFilter,
            '',
            this.props.sort,
            this.props.activeSortIndex,
            ''
          );

          this.dataSource.open(
            loadingProps.endPoints.FIND_ALL(
              loadingProps.resource,
              0,
              loadingProps.pageSize,
              this.filterRef.current.getQuickFilterSort(), this.getUser(), loadingProps.fieldsToForceLazy
            )
          );
        }
      }

      onCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: ''
        });
      }

      onShowHideLoad(show){
        this.setState({
          ...this.state, 
          loading: show,
          update: Math.random()
        })
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
                secondary
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
              {loadingProps.withFilter ? (
                <AnterosQueryBuilder
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
                  onToggleFilter={this.onToggleFilter}
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
                  <CustomFilter>{this.getCustomFilter ? this.getCustomFilter() : null}</CustomFilter>
                  <UserActions
                    dataSource={this.dataSource}
                    onButtonClick={this.onButtonClick}
                    onButtonSearch={this.onButtonSearch}
                    routes={loadingProps.routes}
                    allowRemove={loadingProps.disableRemove ? false : true}
                    labelButtonAdd={loadingProps.labelButtonAdd}
                    labelButtonEdit={loadingProps.labelButtonEdit}
                    labelButtonRemove={loadingProps.labelButtonRemove}
                    labelButtonSelect={loadingProps.labelButtonSelect}
                    positionUserActions={this.positionUserActions}
                    userActions={
                      this.hasUserActions ? this.getUserActions() : null
                    }
                  />
                  {this.getFieldsFilter()}
                </AnterosQueryBuilder>
              ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <UserActions
                      dataSource={this.dataSource}
                      onButtonClick={this.onButtonClick}
                      onButtonSearch={this.onButtonSearch}
                      routes={loadingProps.routes}
                      allowRemove={loadingProps.disableRemove ? false : true}
                      labelButtonAdd={loadingProps.labelButtonAdd}
                      labelButtonEdit={loadingProps.labelButtonEdit}
                      labelButtonRemove={loadingProps.labelButtonRemove}
                      labelButtonSelect={loadingProps.labelButtonSelect}
                      positionUserActions={this.positionUserActions}
                      userActions={
                        this.hasUserActions ? this.getUserActions() : null
                      }
                    />
                  </div>
                )}

              <AnterosDataTable
                id={'table' + loadingProps.viewName}
                height={'200px'}
                ref={ref => (this.table = ref)}
                dataSource={this.dataSource}
                width="100%"
                enablePaging={false}
                enableSearching={false}
                showExportButtons={false}
                onDoubleClick={this.onDoubleClickTable}
              >
                {this.getColumns()}
              </AnterosDataTable>
              <WrappedComponent
                ref={ref => (this.wrappedRef = ref)}
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
                    onBeforePageChanged={this.onBeforePageChanged}
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
    )(TableContainerView);
  };
}

class UserActions extends Component {
  render() {
    return (
      <Fragment>
        {this.props.positionUserActions === 'first'
          ? this.props.userActions
          : null}
        {this.props.routes.add ? (
          <AnterosButton
            id="btnAdd"
            route={this.props.routes.add}
            icon="fal fa-plus"
            small
            className="versatil-btn-adicionar"
            caption={
              this.props.labelButtonAdd
                ? this.props.labelButtonAdd
                : 'Adicionar'
            }
            hint={
              this.props.labelButtonAdd
                ? this.props.labelButtonAdd
                : 'Adicionar'
            }
            onButtonClick={this.props.onButtonClick}
            disabled={
              this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
            }
          />
        ) : null}
        {this.props.routes.edit ? (
          <AnterosButton
            id="btnEdit"
            route={this.props.routes.edit}
            icon="fal fa-pencil"
            small
            className="versatil-btn-editar"
            caption={
              this.props.labelButtonEdit ? this.props.labelButtonEdit : 'Editar'
            }
            hint={
              this.props.labelButtonEdit ? this.props.labelButtonEdit : 'Editar'
            }
            onButtonClick={this.props.onButtonClick}
            disabled={
              this.props.dataSource.isEmpty() ||
              this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
            }
          />
        ) : null}
        {this.props.allowRemove ? (
          <AnterosButton
            id="btnRemove"
            icon="fal fa-trash"
            disabled={
              this.props.dataSource.isEmpty() ||
              this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
            }
            small
            caption={
              this.props.labelButtonRemove
                ? this.props.labelButtonRemove
                : 'Remover'
            }
            hint={
              this.props.labelButtonRemove
                ? this.props.labelButtonRemove
                : 'Remover'
            }
            className="versatil-btn-remover"
            onButtonClick={this.props.onButtonClick}
          />
        ) : null}
        <AnterosButton
          id="btnSelect"
          icon="fal fa-bolt"
          disabled={
            this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
          }
          small
          caption={
            this.props.labelButtonSelect
              ? this.props.labelButtonSelect
              : 'Selecionar'
          }
          hint={
            this.props.labelButtonSelect
              ? this.props.labelButtonSelect
              : 'Selecionar'
          }
          className="versatil-btn-selecionar"
          onButtonClick={this.props.onButtonSearch}
        />{' '}
        {this.props.positionUserActions === 'last'
          ? this.props.userActions
          : null}
      </Fragment>
    );
  }
}

export class TableTemplateActions extends Component {
  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}
