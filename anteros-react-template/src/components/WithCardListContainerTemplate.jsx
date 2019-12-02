import React, { Component, Fragment } from 'react';
import { autoBind } from 'anteros-react-core';
import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  DATASOURCE_EVENTS,
  dataSourceConstants
} from 'anteros-react-datasource';
import { AnterosSweetAlert, AnterosError } from 'anteros-react-core';
import { connect } from 'react-redux';
import { processErrorMessage } from 'anteros-react-core';
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
import { AnterosQueryBuilder, CustomFilter } from 'anteros-react-querybuilder';
import { AnterosCol, AnterosRow } from 'anteros-react-layout';
import { AnterosDataTable } from 'anteros-react-table';
import { AnterosLabel } from 'anteros-react-label';
import { AnterosPagination } from 'anteros-react-navigation';
import { AnterosMasonry } from 'anteros-react-masonry';

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  defaultView: 'cards',
  messageLoading: 'Carregando, por favor aguarde...',
  withFilter: true,
  fieldsToForceLazy: ''
};

export default function WithCardListContainerTemplate(_loadingProps) {
  let loadingProps = { ...defaultValues, ..._loadingProps };

  const mapStateToProps = state => {
    let dataSource,
      dataSourceEdicao,
      query,
      sort,
      activeSortIndex,
      activeFilter,
      quickFilterText,
      user;
    let reducer = state[loadingProps.reducerName];
    if (reducer) {
      dataSource = reducer.dataSource;
      dataSourceEdicao = reducer.dataSourceEdicao
        ? reducer.dataSourceEdicao
        : null;
      query = reducer.query;
      sort = reducer.sort;
      activeSortIndex = reducer.activeSortIndex;
      activeFilter = reducer.activeFilter;
      quickFilterText = reducer.quickFilterText;
    }
    user = state[loadingProps.userReducerName].user;
    return {
      dataSource: dataSource,
      dataSourceEdicao: dataSourceEdicao,
      query: query,
      sort: sort,
      activeSortIndex: activeSortIndex,
      activeFilter: activeFilter,
      quickFilterText: quickFilterText,
      user: user
    };
  };

  const mapDispatchToProps = dispatch => {
    return loadingProps.actions.hasOwnProperty('setDatasourceEdicao')
      ? {
          setDatasource: dataSource => {
            dispatch(loadingProps.actions.setDatasource(dataSource));
          },
          setDatasourceEdicao: dataSource => {
            dispatch(loadingProps.actions.setDatasourceEdicao(dataSource));
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
        }
      : {
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
    class MasonryContainerView extends WrappedComponent {
      constructor(props, context) {
        super(props);

        if (
          WrappedComponent.prototype.hasOwnProperty('getFieldsFilter') === false
        ) {
          throw new AnterosError(
            'Implemente o método getFieldsFilter na classe ' +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty('getCardItem') === false
        ) {
          throw new AnterosError(
            'Implemente o método getCardItem na classe ' + WrappedComponent.type
          );
        }

        this.hasUserActions = WrappedComponent.prototype.hasOwnProperty(
          'getUserActions'
        );

        if (this.hasUserActions === false) {
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

        autoBind(this);
        this.filterRef = React.createRef();
        this.loading = false;
        this.createDataSourceFilter();
        this.createMainDataSource();
        this.createEditionDataSource();

        this.state = {
          alertIsOpen: false,
          alertMessage: '',
          modalOpen: null,
          update: Math.random(),
          idRecord: 0,
          contentHeight: '540px',
          selectedItem: this.dataSource
            ? this.dataSource.getCurrentRecord()
            : undefined,
          selectedView: loadingProps.defaultView
        };
      }

      createDataSourceFilter() {
        this.dsFilter = new AnterosRemoteDatasource();
        AnterosQueryBuilderData.configureDatasource(this.dsFilter);
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
            loadingProps.pageSize
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
              this.filterRef.current.getQuickFilterSort()
            );
          } else {
            return loadingProps.endPoints.FIND_ALL(
              loadingProps.resource,
              page,
              loadingProps.pageSize,
              this.filterRef.current.getQuickFilterSort()
            );
          }
        }
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
            return loadingProps.endPoints.POST(loadingProps.resource, entity);
          });
          this.dataSource.setValidatePostResponse(response => {
            return response.data !== undefined;
          });
          this.dataSource.setAjaxDeleteConfigHandler(entity => {
            return loadingProps.endPoints.DELETE(loadingProps.resource, entity);
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

      createEditionDataSource() {
        if (loadingProps.actions.hasOwnProperty('setDatasourceEdicao')) {
          if (this.props.dataSourceEdicao) {
            this.dataSourceEdicao = this.props.dataSourceEdicao;
            if (
              this.dataSourceEdicao.getState() !== dataSourceConstants.DS_BROWSE
            ) {
              this.dataSourceEdicao.cancel();
            }
          } else {
            this.dataSourceEdicao = new AnterosRemoteDatasource();
            this.dataSourceEdicao.setAjaxPostConfigHandler(entity => {
              return loadingProps.endPoints.POST(loadingProps.resource, entity);
            });
            this.dataSourceEdicao.setValidatePostResponse(response => {
              return response.data !== undefined;
            });
            this.dataSourceEdicao.setAjaxDeleteConfigHandler(entity => {
              return loadingProps.endPoints.DELETE(
                loadingProps.resource,
                entity
              );
            });
            this.dataSourceEdicao.setValidateDeleteResponse(response => {
              return response.data !== undefined;
            });

            this.dataSourceEdicao.setAjaxPageConfigHandler(page => {
              return loadingProps.endPoints.FIND_FULL(
                loadingProps.resource,
                page,
                loadingProps.pageSize
              );
            });
            this.props.setDatasourceEdicao(this.dataSourceEdicao);
          }
          this.dataSourceEdicao.addEventListener(
            DATASOURCE_EVENTS,
            this.onDatasourceEdicaoEvent
          );
        } else {
          this.dataSourceEdicao = null;
        }
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
                this.filterRef.current.getQuickFilterSort(), loadingProps.fieldsToForceLazy
              )
            );
          }
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.dataSource.cancel();
          }
          if (this.dataSourceEdicao) {
            if (
              this.dataSourceEdicao.isOpen() &&
              !this.dataSourceEdicao.isEmpty()
            ) {
              this.dataSourceEdicao.close();
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

        if (this.dataSourceEdicao) {
          this.dataSourceEdicao.removeEventListener(
            DATASOURCE_EVENTS,
            this.onDatasourceEdicaoEvent
          );
          this.dataSourceEdicao.setAjaxPageConfigHandler(null);
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
        this.dataSource.open(
          loadingProps.endPoints.FIND_MULTIPLE_FIELDS(
            loadingProps.resource,
            filter,
            fields,
            0,
            loadingProps.pageSize,
            sort, loadingProps.fieldsToForceLazy
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
        let newHeight = height - this.filterRef.current.divFilter.clientHeight;
        let currentHeight = parseFloat(
          this.state.contentHeight.substring(
            0,
            this.state.contentHeight.indexOf('px')
          )
        );
        if (Math.abs(currentHeight - newHeight) > 20) {
          this.setState({
            ...this.state,
            contentHeight: newHeight + 'px'
          });
        }

        // if (this.table) {
        //   this.table.resize(width, newHeight);
        // }
      }

      onSelectedItem(item) {
        this.hasSelectedItem =
          this.state.selectedItem && item.id === this.state.selectedItem.id
            ? false
            : true;
        this.setState({
          ...this.state,
          selectedItem:
            this.state.selectedItem && item.id === this.state.selectedItem.id
              ? null
              : item
        });
      }

      onDatasourceEvent(event, error) {
        let loading = this.loading;
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
          this.setState({
            ...this.state,
            update: Math.random()
          });
        }

        if (event === dataSourceEvents.AFTER_INSERT) {
        }

        if (event === dataSourceEvents.ON_ERROR) {
          if (error) {
            this.loading = false;
            this.setState({
              ...this.state,
              alertIsOpen: true,
              alertMessage: processErrorMessage(error)
            });
          }
        } else {
          this.loading = loading;
          this.setState({
            ...this.state,
            update: Math.random()
          });
        }
      }

      onDatasourceEdicaoEvent(event, error) {
        if (
          event === dataSourceEvents.BEFORE_OPEN ||
          event === dataSourceEvents.BEFORE_GOTO_PAGE
        ) {
        }

        if (
          event === dataSourceEvents.AFTER_OPEN ||
          event === dataSourceEvents.AFTER_GOTO_PAGE ||
          event === dataSourceEvents.ON_ERROR
        ) {
          this.props.setDatasourceEdicao(this.dataSourceEdicao);
        }

        if (event === dataSourceEvents.AFTER_DELETE) {
        }

        if (event === dataSourceEvents.AFTER_INSERT) {
          this.onAfterInsertEdition(event, error);
        }

        if (event === dataSourceEvents.AFTER_EDIT) {
          this.onAfterEditEdition(event, error);
        }

        if (event === dataSourceEvents.ON_ERROR) {
          this.setState({
            ...this.state,
            alertIsOpen: true,
            alertMessage: processErrorMessage(error)
          });
        }
      }

      onButtonClick(event, button) {
        if (button.props.id === 'btnAdd') {
          if (!this.dataSource.isOpen()) this.dataSource.open();
          this.dataSource.insert();
          if (this.dataSourceEdicao) {
            this.dataSourceEdicao.close();
            this.dataSourceEdicao.open();
            this.dataSourceEdicao.insert();
          }
        } else if (button.props.id === 'btnEdit') {
          let _this = this;
          this.loading = true;
          this.dataSource.locate({ id: this.state.selectedItem.id });
          if (this.dataSourceEdicao) {
            this.dataSourceEdicao.locate({ id: this.state.selectedItem.id });
            this.dataSourceEdicao.open(
              loadingProps.endPoints.FIND_ONE(
                loadingProps.resource,
                this.dataSource.fieldByName('id')
              ),
              error => {
                _this.loading = false;
                if (!error) {
                  _this.dataSourceEdicao.edit();
                  _this.props.history.push(button.props.route);
                }
              }
            );
            return;
          } else {
            this.dataSource.edit();
            this.loading = false;
          }
        } else if (button.props.id === 'btnRemove') {
          this.dataSource.locate({ id: this.state.selectedItem.id });
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
            .then(function() {
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
            .catch(error => {});
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

      onSearchButtonClick(field, event) {}

      onDoubleClickTable(data) {
        this.props.history.push(loadingProps.routes.edit);
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
              0, loadingProps.fieldsToForceLazy
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
              loadingProps.pageSize, loadingProps.fieldsToForceLazy
            )
          );
        }
      }

      layoutChange(evt, button) {
        this.setState({
          ...this.state,
          selectedItem: null,
          selectedView: button.props.id
        });
      }

      onCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: ''
        });
      }

      render() {
        let CardItem = this.getCardItem();
        let ViewItem = this.getViewItem();
        return (
          <AnterosCard
            withScroll={false}
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
              blocking={this.loading}
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
                  <CustomFilter>{this.getCustomFilter()}</CustomFilter>
                  {loadingProps.canChangeLayout ? (
                    <Fragment>
                      <AnterosButton
                        primary
                        id="list"
                        icon="fal fa-th-list"
                        onButtonClick={this.layoutChange}
                      />
                      <AnterosButton
                        primary
                        id="cards"
                        icon="fal fa-th-large"
                        onClick={this.layoutChange}
                      />
                    </Fragment>
                  ) : null}
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
                    hasSelectedItem={this.state.selectedItem ? true : false}
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
                    hasSelectedItem={this.state.selectedItem ? true : false}
                    userActions={
                      this.hasUserActions ? this.getUserActions() : null
                    }
                  />
                </div>
              )}

              {this.state.selectedView === 'cards' ? (
                <Fragment>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'start',
                      height: '68vh'
                    }}
                  >
                    <div
                      style={{
                        height: this.state.contentHeight,
                        overflow: 'auto',
                        width: '-webkit-fill-available'
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
                        style={{
                          height: 'auto'
                        }}
                      >
                        {!this.dataSource.isEmpty()
                          ? this.dataSource.getData().map(r => {
                              return (
                                <CardItem
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
                    {ViewItem && this.state.selectedItem ? (
                      <ViewItem record={this.state.selectedItem} />
                    ) : null}
                  </div>
                </Fragment>
              ) : (
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
              )}

              <WrappedComponent
                user={this.props.user}
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
              !this.props.hasSelectedItem ||
              this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
            }
          />
        ) : null}
        {this.props.allowRemove ? (
          <AnterosButton
            id="btnRemove"
            icon="fal fa-trash"
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
            disabled={
              !this.props.hasSelectedItem ||
              this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
            }
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
