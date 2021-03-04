import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  DATASOURCE_EVENTS,
  dataSourceConstants,
} from "@anterostecnologia/anteros-react-datasource";
import {
  AnterosSweetAlert,
  AnterosError,
  AnterosResizeDetector,
  processErrorMessage,
  autoBind,
} from "@anterostecnologia/anteros-react-core";
import {
  AnterosFilterDSL,
  AnterosQueryBuilderData,
  AnterosQueryBuilder,
} from "@anterostecnologia/anteros-react-querybuilder";
import {
  AnterosCard,
  HeaderActions,
  FooterActions,
} from "@anterostecnologia/anteros-react-containers";
import {
  AnterosBlockUi,
  AnterosLoader,
} from "@anterostecnologia/anteros-react-loaders";
import {
  AnterosCol,
  AnterosRow,
} from "@anterostecnologia/anteros-react-layout";
import { AnterosPagination } from "@anterostecnologia/anteros-react-navigation";
import { AnterosAlert } from "@anterostecnologia/anteros-react-notification";
import { AnterosDataTable } from "@anterostecnologia/anteros-react-table";
import { AnterosMasonry } from "@anterostecnologia/anteros-react-masonry";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosLabel } from "@anterostecnologia/anteros-react-label";

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  defaultView: "cards",
  messageLoading: "Carregando, por favor aguarde...",
  withFilter: true,
  fieldsToForceLazy: "",
  defaultSortFields: "",
  filterName: "filter",
  version: "v1",
};

export default function WithCardListContainerTemplate(_loadingProps) {
  let loadingProps = { ...defaultValues, ..._loadingProps };

  const mapStateToProps = (state) => {
    let dataSource,
      currentFilter = undefined,
      activeFilterIndex = -1,
      needRefresh = false,
      needUpdateView = false,
      user;
    let reducer = state[loadingProps.reducerName];
    if (reducer) {
      dataSource = reducer.dataSource;
      currentFilter = reducer.currentFilter;
      activeFilterIndex = reducer.activeFilterIndex;
      needRefresh = reducer.needRefresh;
    }
    user = state[loadingProps.userReducerName].user;
    reducer = state[loadingProps.layoutReducerName];
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
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return loadingProps.actions.hasOwnProperty("setDatasourceEdicao")
      ? {
          setDatasource: (dataSource) => {
            dispatch(loadingProps.actions.setDatasource(dataSource));
          },
          hideTour: () => {
            dispatch({ type: "HIDE_TOUR" });
          },
          setDatasourceEdicao: (dataSource) => {
            dispatch(loadingProps.actions.setDatasourceEdicao(dataSource));
          },
          setFilter: (currentFilter, activeFilterIndex) => {
            dispatch(
              loadingProps.actions.setFilter(
                currentFilter,
                activeFilterIndex
              )
            );
          },
        }
      : {
          setDatasource: (dataSource) => {
            dispatch(loadingProps.actions.setDatasource(dataSource));
          },
          setFilter: (currentFilter, activeFilterIndex) => {
            dispatch(
              loadingProps.actions.setFilter(
                currentFilter,
                activeFilterIndex
              )
            );
          },
        };
  };

  if (!loadingProps.endPoints) {
    throw new AnterosError("Defina o objeto com os endPoints de consulta.");
  }

  return (WrappedComponent) => {
    class MasonryContainerView extends WrappedComponent {
      constructor(props, context) {
        super(props);

        this.filterRef = React.createRef();

        if (
          WrappedComponent.prototype.hasOwnProperty("getFieldsFilter") === false
        ) {
          throw new AnterosError(
            "Implemente o método getFieldsFilter na classe " +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getCardItem") === false
        ) {
          throw new AnterosError(
            "Implemente o método getCardItem na classe " + WrappedComponent.type
          );
        }

        this.hasUserActions = WrappedComponent.prototype.hasOwnProperty(
          "getUserActions"
        );

        if (this.hasUserActions === false) {
          throw new AnterosError(
            "Implemente o método getUserActions na classe " +
              WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty(
            "getPositionUserActions"
          ) === false
        ) {
          throw new AnterosError(
            "Implemente o método getPositionUserActions na classe " +
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
          alertMessage: "",
          modalOpen: null,
          update: Math.random(),
          idRecord: 0,
          contentHeight: "540px",
          selectedItem: this.dataSource
            ? this.dataSource.getCurrentRecord()
            : undefined,
          selectedView: loadingProps.defaultView,
          filterExpanded: false
        };
      }

      createDataSourceFilter() {
        this.dsFilter = AnterosQueryBuilderData.createDatasource(
          loadingProps.viewName,
          loadingProps.filterName,
          loadingProps.version
        );
      }

      getSortFields() {
        if (
          loadingProps.withFilter &&
          this.filterRef &&
          this.filterRef.current
        ) {
          if (
            this.filterRef.current.getQuickFilterSort() &&
            this.filterRef.current.getQuickFilterSort() !== ""
          ) {
            return this.filterRef.current.getQuickFilterSort();
          }
        }
        return loadingProps.defaultSortFields;
      }
      createMainDataSource() {
        if (this.props.dataSource) {
          this.dataSource = this.props.dataSource;
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.dataSource.cancel();
          }
        } else {
          this.dataSource = new AnterosRemoteDatasource();
          this.dataSource.setAjaxPostConfigHandler((entity) => {
            return loadingProps.endPoints.POST(loadingProps.resource, entity);
          });
          this.dataSource.setValidatePostResponse((response) => {
            return response.data !== undefined;
          });
          this.dataSource.setAjaxDeleteConfigHandler((entity) => {
            return loadingProps.endPoints.DELETE(loadingProps.resource, entity);
          });
          this.dataSource.setValidateDeleteResponse((response) => {
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
        if (loadingProps.actions.hasOwnProperty("setDatasourceEdicao")) {
          if (this.props.dataSourceEdicao) {
            this.dataSourceEdicao = this.props.dataSourceEdicao;
            if (
              this.dataSourceEdicao.getState() !== dataSourceConstants.DS_BROWSE
            ) {
              this.dataSourceEdicao.cancel();
            }
          } else {
            this.dataSourceEdicao = new AnterosRemoteDatasource();
            this.dataSourceEdicao.setAjaxPostConfigHandler((entity) => {
              return loadingProps.endPoints.POST(loadingProps.resource, entity);
            });
            this.dataSourceEdicao.setValidatePostResponse((response) => {
              return response.data !== undefined;
            });
            this.dataSourceEdicao.setAjaxDeleteConfigHandler((entity) => {
              return loadingProps.endPoints.DELETE(
                loadingProps.resource,
                entity
              );
            });
            this.dataSourceEdicao.setValidateDeleteResponse((response) => {
              return response.data !== undefined;
            });

            this.dataSourceEdicao.setAjaxPageConfigHandler((page) => {
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
        if (loadingProps.openMainDataSource) {
          if (!this.dataSource.isOpen()) {
            this.dataSource.open(this.getData(this.props.currentFilter, 0));
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
        this.props.hideTour();
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
              : item,
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
            update: Math.random(),
          });
        }

        if (event === dataSourceEvents.AFTER_INSERT) {
          //
        }

        if (event === dataSourceEvents.ON_ERROR) {
          if (error) {
            this.loading = false;
            this.setState({
              ...this.state,
              alertIsOpen: true,
              alertMessage: processErrorMessage(error),
            });
          }
        } else {
          this.loading = loading;
          this.setState({
            ...this.state,
            update: Math.random(),
          });
        }
      }

      onDatasourceEdicaoEvent(event, error) {
        if (
          event === dataSourceEvents.BEFORE_OPEN ||
          event === dataSourceEvents.BEFORE_GOTO_PAGE
        ) {
          //
        }

        if (
          event === dataSourceEvents.AFTER_OPEN ||
          event === dataSourceEvents.AFTER_GOTO_PAGE ||
          event === dataSourceEvents.ON_ERROR
        ) {
          this.props.setDatasourceEdicao(this.dataSourceEdicao);
        }

        if (event === dataSourceEvents.AFTER_DELETE) {
          //
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
            alertMessage: processErrorMessage(error),
          });
        }
      }

      onButtonClick(event, button) {
        if (button.props.id === "btnAdd") {
          if (!this.dataSource.isOpen()) this.dataSource.open();
          this.dataSource.insert();
          if (this.dataSourceEdicao) {
            this.dataSourceEdicao.close();
            this.dataSourceEdicao.open();
            this.dataSourceEdicao.insert();
          }
        } else if (button.props.id === "btnEdit") {
          let _this = this;
          this.loading = true;
          this.dataSource.locate({ id: this.state.selectedItem.id });
          if (this.dataSourceEdicao) {
            this.dataSourceEdicao.locate({ id: this.state.selectedItem.id });
            this.dataSourceEdicao.open(
              loadingProps.endPoints.FIND_ONE(
                loadingProps.resource,
                this.dataSource.fieldByName("id"),
                this.props.user,
                loadingProps.fieldsToForceLazy
              ),
              (error) => {
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
        } else if (button.props.id === "btnRemove") {
          this.dataSource.locate({ id: this.state.selectedItem.id });
          let _this = this;
          AnterosSweetAlert({
            title: "Deseja remover ?",
            text: "",
            type: "question",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            focusCancel: true,
          })
            .then(function () {
              _this.dataSource.delete((error) => {
                if (error) {
                  _this.setState({
                    ..._this.state,
                    alertIsOpen: true,
                    alertMessage: processErrorMessage(error),
                  });
                }
              });
            })
            .catch((error) => {});
        } else if (button.props.id === "btnClose") {
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.setState({
              ...this.state,
              alertIsOpen: true,
              alertMessage: "Salve ou cancele os dados antes de sair",
            });
            return;
          }
        }
        this.props.history.push(button.props.route);
      }
      onDoubleClickTable(data) {
        this.props.history.push(loadingProps.routes.edit);
      }

      layoutChange(evt, button) {
        this.setState({
          ...this.state,
          selectedItem: null,
          selectedView: button.props.id,
        });
      }

      onCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: "",
        });
      }

      onFilterChanged(filter, activeFilterIndex) {
        this.props.setFilter(
          filter,
          activeFilterIndex
        );
        this.setState({...this.state, update: Math.random()});
      }

      onToggleExpandedFilter(expanded) {
        this.setState({...this.state, filterExpanded: expanded});
        setTimeout(() => {
          if (
            this.state.newHeight !== undefined &&
            this.state.width !== undefined
          ) {
            if (this.table1) {
              this.table1.resize(this.state.width - 360, this.state.newHeight);
            }
            if (this.table2) {
              this.table2.resize("100%", this.state.newHeight);
            }
          }
        }, 500);
      }

      onSelectedFilter(filter, index) {
        this.props.setFilter(filter, index);
        this.setState({...this.state, update: Math.random()});
      }

      onBeforePageChanged(currentPage, newPage) {
        this.setState({
          ...this.state,
          loading: true,
        });
      }

      handlePageChanged(newPage) {
        this.setState({
          ...this.state,
          currentPage: newPage,
          loading: false,
        });
      }

      onSearchByFilter(currentFilter) {
        this.onShowHideLoad(true);
        this.dataSource.open(this.getData(currentFilter, 0),()=>{
            this.onShowHideLoad(false);
        });
      }

      getData(currentFilter,page){
        if ((currentFilter && currentFilter.filter && currentFilter.filter.filterType === "advanced") && 
           (currentFilter.filter.rules.length > 0)) {
              return this.getDataWithFilter(currentFilter,page);
          } else if ((currentFilter && currentFilter.filter && currentFilter.filter.filterType === "normal") &&
                     (currentFilter.filter.quickFilterText !== "")) {
              return this.getDataWithQuickFilter(currentFilter,page);
          } else {
              return this.getDataWithoutFilter(page);
          }
      }

      getDataWithFilter(currentFilter, page) {
        var filter = new AnterosFilterDSL();
        filter.buildFrom(currentFilter.filter, currentFilter.sort);
        if (
          WrappedComponent.prototype.hasOwnProperty("onFindWithFilter") === true
        ) {
          return this.onFindWithFilter(
            filter.toJSON(),
            page,
            loadingProps.pageSize,
            this.getSortFields(),
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        } else {
          return loadingProps.endPoints.FIND_WITH_FILTER(
            loadingProps.resource,
            filter.toJSON(),
            page,
            loadingProps.pageSize,
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        }
      }

      getDataWithoutFilter(page) {
        if (WrappedComponent.prototype.hasOwnProperty("onFindAll") === true) {
          return this.onFindAll(
            page,
            loadingProps.pageSize,
            this.getSortFields(),
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        } else {
          return loadingProps.endPoints.FIND_ALL(
            loadingProps.resource,
            page,
            loadingProps.pageSize,
            this.getSortFields(),
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        }
      }

      getDataWithQuickFilter(currentFilter) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onFindMultipleFields") ===
          true
        ) {
          return this.onFindMultipleFields(
            currentFilter.filter.quickFilterText,
            currentFilter.filter.selectedFields,
            0,
            loadingProps.pageSize,
            currentFilter.sort,
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        } else {
          return loadingProps.endPoints.FIND_MULTIPLE_FIELDS(
            loadingProps.resource,
            currentFilter.filter.quickFilterText,
            currentFilter.filter.selectedFields,
            0,
            loadingProps.pageSize,
            currentFilter.sort,
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        }
      }

      pageConfigHandler(page) {
        return this.getData(this.props.currentFilter, page);
      }

      onShowHideLoad(show) {
        this.setState({
          ...this.state,
          loading: show,
          update: Math.random(),
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
            ref={(ref) => (this.card = ref)}
          >
            <AnterosResizeDetector handleWidth handleHeight />
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
                border: "2px solid white",
                width: "200px",
                backgroundColor: "#8BC34A",
                borderRadius: "8px",
                color: "white",
              }}
              styleOverlay={{
                opacity: 0.1,
                backgroundColor: "black",
              }}
              tag="div"
              blocking={this.loading}
              message={loadingProps.messageLoading}
              loader={
                <AnterosLoader active type="ball-pulse" color="#02a17c" />
              }
            >
              {loadingProps.withFilter ? (
                <div
                  style={{
                    display: "flex",
                    flexFlow: "row nowrap",
                    justifyContent: "space-between",
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
                  <AnterosQueryBuilder
                    zIndex={50}
                    query={this.props.query}
                    sort={this.props.sort}
                    id={loadingProps.filtroDispositivos}
                    formName={loadingProps.viewName}
                    ref={this.filterRef}
                    currentFilter={this.props.currentFilter}
                    activeFilterIndex={this.props.activeFilterIndex}
                    onSelectedFilter={this.onSelectedFilter}
                    onFilterChanged={this.onFilterChanged}
                    onSearchByFilter={this.onSearchByFilter}
                    onToggleExpandedFilter={this.onToggleExpandedFilter}
                    height="170px"
                    width={"550px"}
                    allowSort={true}
                    disabled={
                      this.dataSource.getState() !==
                      dataSourceConstants.DS_BROWSE
                    }
                  >
                    {this.getFieldsFilter()}
                  </AnterosQueryBuilder>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
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

              {this.state.selectedView === "cards" ? (
                <Fragment>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "start",
                      height: "68vh",
                    }}
                  >
                    <div
                      style={{
                        height: this.state.contentHeight,
                        overflow: "auto",
                        width: "-webkit-fill-available",
                      }}
                    >
                      <AnterosMasonry
                        className={"versatil-grid-layout"}
                        elementType={"ul"}
                        id={"masonry" + loadingProps.viewName}
                        options={{
                          transitionDuration: 0,
                          gutter: 10,
                          horizontalOrder: true,
                          isOriginLeft: true,
                        }}
                        disableImagesLoaded={false}
                        updateOnEachImageLoad={false}
                        style={{
                          height: "auto",
                        }}
                      >
                        {!this.dataSource.isEmpty()
                          ? this.dataSource.getData().map((r) => {
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
                  id={"table" + loadingProps.viewName}
                  height={"200px"}
                  ref={(ref) => (this.table = ref)}
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
                {...this.props}
                user={this.props.user}
                state={this.state}
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
    return connect(mapStateToProps, mapDispatchToProps)(MasonryContainerView);
  };
}

class UserActions extends Component {
  render() {
    return (
      <Fragment>
        {this.props.positionUserActions === "first"
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
                : "Adicionar"
            }
            hint={
              this.props.labelButtonAdd
                ? this.props.labelButtonAdd
                : "Adicionar"
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
              this.props.labelButtonEdit ? this.props.labelButtonEdit : "Editar"
            }
            hint={
              this.props.labelButtonEdit ? this.props.labelButtonEdit : "Editar"
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
                : "Remover"
            }
            hint={
              this.props.labelButtonRemove
                ? this.props.labelButtonRemove
                : "Remover"
            }
            className="versatil-btn-remover"
            onButtonClick={this.props.onButtonClick}
            disabled={
              !this.props.hasSelectedItem ||
              this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
            }
          />
        ) : null}
        {" "}
        {this.props.positionUserActions === "last"
          ? this.props.userActions
          : null}
      </Fragment>
    );
  }
}
