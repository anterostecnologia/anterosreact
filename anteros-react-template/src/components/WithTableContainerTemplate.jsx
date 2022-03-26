import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { TailSpin } from "react-loader-spinner";

import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  dataSourceConstants,
  DATASOURCE_EVENTS,
} from "@anterostecnologia/anteros-react-datasource";
import {
  AnterosSweetAlert,
  AnterosError,
  autoBind,
  processErrorMessage,
  AnterosResizeDetector,
} from "@anterostecnologia/anteros-react-core";
import { AnterosQueryBuilder, NORMAL, QUICK, ADVANCED,AnterosFilterDSL,AnterosQueryBuilderData  } from "@anterostecnologia/anteros-react-querybuilder";
import {
  AnterosCard,
  HeaderActions,
  FooterActions,
} from "@anterostecnologia/anteros-react-containers";
import { AnterosBlockUi } from "@anterostecnologia/anteros-react-loaders";
import {
  AnterosCol,
  AnterosRow,
} from "@anterostecnologia/anteros-react-layout";
import { AnterosPagination } from "@anterostecnologia/anteros-react-navigation";
import { AnterosAlert } from "@anterostecnologia/anteros-react-notification";
import { AnterosDataTable } from "@anterostecnologia/anteros-react-table";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosLabel } from "@anterostecnologia/anteros-react-label";
import shallowCompare from "react-addons-shallow-compare";
import { noop } from "lodash";

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  messageLoading: "Por favor aguarde...",
  withFilter: true,
  fieldsToForceLazy: "",
  defaultSortFields: "",
  filterName: "filter",
  layoutReducerName: "layoutReducer",
  version: "v1",
};

export default function WithTableContainerTemplate(_loadingProps) {
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
    return {
      setDatasource: (dataSource) => {
        dispatch(loadingProps.actions.setDatasource(dataSource));
      },
      hideTour: () => {
        dispatch({ type: "HIDE_TOUR" });
      },
      setFilter: (currentFilter, activeFilterIndex) => {
        dispatch(
          loadingProps.actions.setFilter(currentFilter, activeFilterIndex)
        );
      },
    };
  };

  return (WrappedComponent) => {
    class TableContainerView extends WrappedComponent {
      constructor(props, context) {
        super(props);
        autoBind(this);
        if (!loadingProps.endPoints) {
          throw new AnterosError(
            "Informe o objeto com os endPoints de consulta."
          );
        }
        if (!loadingProps.resource) {
          throw new AnterosError("Informe o nome do RESOURCE de consulta. ");
        }
        if (!loadingProps.reducerName) {
          throw new AnterosError("Informe o nome do REDUCER. ");
        }
        if (!loadingProps.userReducerName) {
          throw new AnterosError("Informe o nome do REDUCER de Usuários. ");
        }
        if (!loadingProps.actions) {
          throw new AnterosError(
            "Informe o objeto com as actions do REDUCER. "
          );
        }
        if (!loadingProps.viewName) {
          throw new AnterosError("Informe o nome da View. ");
        }
        if (!loadingProps.caption) {
          throw new AnterosError("Informe o caption(titulo) da View. ");
        }
        if (loadingProps.withFilter && !loadingProps.filterName) {
          throw new AnterosError("Informe o nome do filtro. ");
        }
        if (!loadingProps.routes) {
          throw new AnterosError("Informe as rotas das ações. ");
        }

        if (WrappedComponent.prototype.hasOwnProperty("getColumns") === false) {
          throw new AnterosError("Implemente o método getColumns na classe.");
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getRoutes") &&
          this.getRoutes()
        ) {
          loadingProps.routes = this.getRoutes();
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getFieldsFilter") === false
        ) {
          throw new AnterosError(
            "Implemente o método getFieldsFilter na classe "
          );
        }

        this.filterRef = React.createRef();

        this.hasUserActions = WrappedComponent.prototype.hasOwnProperty(
          "getUserActions"
        );

        this.positionUserActions =
          WrappedComponent.prototype.hasOwnProperty(
            "getPositionUserActions"
          ) === true
            ? this.getPositionUserActions()
            : "first";

        this.createDataSourceFilter();

        if (
          WrappedComponent.prototype.hasOwnProperty("onCreateDatasource") ===
          true
        ) {
          this.dataSource = this.onCreateDatasource();
          if (this.dataSource instanceof AnterosRemoteDatasource) {
            this.dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
          }
          this.dataSource.addEventListener(
            DATASOURCE_EVENTS,
            this.onDatasourceEvent
          );
        } else {
          this.createMainDataSource();
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getRoutes") &&
          this.getRoutes()
        ) {
          loadingProps.routes = this.getRoutes();
        }

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

      createDataSourceFilter() {
        this.dsFilter = AnterosQueryBuilderData.createDatasource(
          loadingProps.viewName,
          loadingProps.filterName,
          loadingProps.version
        );
      }

      getDispatch() {
        return this.props.dispatch;
      }

      getUser() {
        if (
          WrappedComponent.prototype.hasOwnProperty("getCustomUser") === true
        ) {
          return this.getCustomUser();
        } else {
          if (this.props.user) {
            return this.props.user;
          }
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
          this.dataSource.setAjaxPostConfigHandler((entity) => {
            return loadingProps.endPoints.post(
              loadingProps.resource,
              entity,
              this.getUser()
            );
          });
          this.dataSource.setValidatePostResponse((response) => {
            return response.data !== undefined;
          });
          this.dataSource.setAjaxDeleteConfigHandler((entity) => {
            return loadingProps.endPoints.delete(
              loadingProps.resource,
              entity,
              this.getUser()
            );
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

      componentDidMount() {
        setTimeout(()=>{
        if (loadingProps.openMainDataSource) {
          if (!this.dataSource.isOpen()) {
            this.dataSource.open(this.getData(this.props.currentFilter, 0));
          } else if (this.props.needRefresh) {
            this.dataSource.open(
              this.getData(
                this.props.currentFilter,
                this.dataSource.getCurrentPage()
              )
            );
          }
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.dataSource.cancel();
          }
        }

        if (WrappedComponent.prototype.hasOwnProperty("onDidMount") === true) {
          this.onDidMount();
        }
      },100);
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
        if (
          WrappedComponent.prototype.hasOwnProperty("onWillUnmount") === true
        ) {
          this.onWillUnmount();
        }
        this.props.hideTour();
      }

      shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
      }

      onFilterChanged(filter, activeFilterIndex, callback=noop) {
          this.props.setFilter(filter, activeFilterIndex);
          this.setState({ ...this.state, update: Math.random() },callback);
      }

      onToggleExpandedFilter(expanded) {
        this.setState({
          ...this.state,
          filterExpanded: expanded,
          update: Math.random(),
        });
      }

      onSelectedFilter(filter, index) {
        this.props.setFilter(filter, index);
        this.setState({ ...this.state, update: Math.random() });
      }

      onBeforePageChanged(currentPage, newPage) {
        //
      }

      handlePageChanged(newPage) {
        //
      }

      getSortFields() {
        if (
          loadingProps.withFilter &&
          this.state.currentFilter &&
          this.state.currentFilter.sort
        ) {
          return this.state.currentFilter.sort.quickFilterSort;
        }
        return loadingProps.defaultSortFields;
      }

      onDatasourceEvent(event, error) {
        if (
          event === dataSourceEvents.BEFORE_OPEN ||
          event === dataSourceEvents.BEFORE_GOTO_PAGE
        ) {
          this.setState({
            ...this.state,
            update: Math.random(),
            alertIsOpen: false,
            loading: true,
          });
        }

        if (event === dataSourceEvents.BEFORE_POST) {
          if (
            WrappedComponent.prototype.hasOwnProperty("onBeforePost") === true
          ) {
            this.onBeforePost();
          }
        }

        if (
          event === dataSourceEvents.AFTER_OPEN ||
          event === dataSourceEvents.AFTER_GOTO_PAGE ||
          event === dataSourceEvents.ON_ERROR
        ) {
          this.props.setDatasource(this.dataSource);
          this.setState({
            ...this.state,
            update: Math.random(),
            alertIsOpen: false,
            loading: false,
          });
        }

        if (event === dataSourceEvents.AFTER_INSERT) {
          if (
            WrappedComponent.prototype.hasOwnProperty("onAfterInsert") === true
          ) {
            this.onAfterInsert();
          }
        }

        if (event === dataSourceEvents.ON_ERROR) {
          if (error) {
            this.setState({
              ...this.state,
              alertIsOpen: true,
              loading: false,
              update: Math.random(),
              alertMessage: processErrorMessage(error),
            });
          }
        }
      }

      onButtonClick(event, button) {
        if (button.props.id === "btnView") {
          if (
            WrappedComponent.prototype.hasOwnProperty("onCustomView") === true
          ) {
            this.onCustomView(button.props.route);
            return;
          }
        } else if (button.props.id === "btnAdd") {
          if (
            WrappedComponent.prototype.hasOwnProperty("onCustomAdd") === true
          ) {
            this.onCustomAdd(button.props.route);
            return;
          } else {
            if (
              WrappedComponent.prototype.hasOwnProperty("onBeforeInsert") ===
              true
            ) {
              if (!this.onBeforeInsert()) {
                return;
              }
            }
            if (!this.dataSource.isOpen()) this.dataSource.open();
            this.dataSource.insert();
          }
        } else if (button.props.id === "btnEdit") {
          if (
            WrappedComponent.prototype.hasOwnProperty("onCustomEdit") === true
          ) {
            this.onCustomEdit(button.props.route);
            return;
          } else {
            if (
              WrappedComponent.prototype.hasOwnProperty("onBeforeEdit") === true
            ) {
              if (!this.onBeforeEdit()) {
                return;
              }
            }

            this.dataSource.edit();
          }
        } else if (button.props.id === "btnRemove") {
          if (
            WrappedComponent.prototype.hasOwnProperty("onBeforeRemove") === true
          ) {
            if (!this.onBeforeRemove()) {
              return;
            }
          }
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
            .then(function() {
              _this.dataSource.delete((error) => {
                if (error) {
                  _this.setState({
                    ..._this.state,
                    alertIsOpen: true,
                    update: Math.random(),
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
              update: Math.random(),
              alertMessage: "Salve ou cancele os dados antes de sair",
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

      onSearchByFilter() {
        this.onShowHideLoad(true);
        this.dataSource.open(this.getData(this.props.currentFilter, 0), () => {
          this.onShowHideLoad(false);
        });
      }

      getData(currentFilter, page) {
        if (
          currentFilter &&
          currentFilter.filter.filterType === QUICK &&
            currentFilter.filter.quickFilterText &&
            currentFilter.filter.quickFilterText !== ""
        ) {
          return this.getDataWithQuickFilter(currentFilter, page);
        } else if (
          currentFilter &&
          (currentFilter.filter.filterType === NORMAL ||
            currentFilter.filter.filterType === ADVANCED)
        ) {
          return this.getDataWithFilter(currentFilter, page);
        } else {
          return this.getDataWithoutFilter(page);
        }
      }

      getDataWithFilter(currentFilter, page) {
        var filter = new AnterosFilterDSL();
        filter.buildFrom(currentFilter.filter, currentFilter.sort);
        let filterStr = filter.toJSON();
        if (filterStr) {
          if (
            WrappedComponent.prototype.hasOwnProperty("onFindWithFilter") ===
            true
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
            return loadingProps.endPoints.findWithFilter(
              loadingProps.resource,
              filter.toJSON(),
              page,
              loadingProps.pageSize,
              this.getUser(),
              loadingProps.fieldsToForceLazy
            );
          }
        } else {
          return this.getDataWithoutFilter(page);
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
          return loadingProps.endPoints.findAll(
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
            currentFilter.filter.quickFilterFieldsText,
            0,
            loadingProps.pageSize,
            this.getSortFields(),
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        } else {
          return loadingProps.endPoints.findMultipleFields(
            loadingProps.resource,
            currentFilter.filter.quickFilterText,
            currentFilter.filter.quickFilterFieldsText,
            0,
            loadingProps.pageSize,
            this.getSortFields(),
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        }
      }

      onDoubleClickTable(data) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onCustomDoubleClick") ===
          true
        ) {
          this.onCustomDoubleClick(data);
        }
      }

      pageConfigHandler(page) {
        return this.getData(this.props.currentFilter, page);
      }

      onCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          update: Math.random(),
          alertMessage: "",
        });
      }

      onShowHideLoad(show) {
        this.setState({
          ...this.state,
          loading: show,
          update: Math.random(),
        });
      }

      handleOnSelectRecord(row, data, tableId) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onSelectRecord") === true
        ) {
          this.onSelectRecord(row, data, tableId);
        }
      }

      handleOnUnselectRecord(row, data, tableId) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onUnselectRecord") === true
        ) {
          this.onUnselectRecord(row, data, tableId);
        }
      }

      handleOnSelectAllRecords(records, tableId) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onSelectAllRecords") ===
          true
        ) {
          this.onSelectAllRecords(records, tableId);
        }
      }

      handleOnUnselectAllRecords(tableId) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onUnselectAllRecords") ===
          true
        ) {
          this.onUnselectAllRecords(tableId);
        }
      }

      onResize(width, height) {
        let newHeight = height - 120;
        if (this.table) {
          this.table.resize("100%", newHeight);
        }
        this.setState({
          ...this.state,
          update: Math.random(),
          width: width,
          newHeight: newHeight,
        });
      }

      changeState(state, callback) {
        if (callback) {
          this.setState(
            { ...this.state, ...state, update: Math.random() },
            callback
          );
        } else {
          this.setState({ ...this.state, ...state, update: Math.random() });
        }
      }

      render() {
        const modals = WrappedComponent.prototype.hasOwnProperty("getModals")
          ? this.getModals()
          : null;

        const customLoader = WrappedComponent.prototype.hasOwnProperty(
          "getCustomLoader"
        )
          ? this.getCustomLoader()
          : null;

        const messageLoading = WrappedComponent.prototype.hasOwnProperty(
          "getCustomMessageLoading"
        )
          ? this.getCustomMessageLoading()
          : loadingProps.messageLoading;

        return (
          <Fragment>
            <AnterosCard
              caption={loadingProps.caption}
              className="versatil-card-full"
              withScroll={false}
              styleBlock={{
                height: "calc(100% - 120px)",
              }}
              ref={(ref) => (this.card = ref)}
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
                  height: "100%",
                }}
                styleBlockMessage={{
                  border: "2px solid white",
                  width: "200px",
                  height: "80px",
                  padding: "8px",
                  backgroundColor: "rgb(56 70 112)",
                  borderRadius: "8px",
                  color: "white",
                }}
                styleOverlay={{
                  opacity: 0.1,
                  backgroundColor: "black",
                }}
                tag="div"
                blocking={this.state.loading}
                message={messageLoading}
                loader={
                  customLoader ? (
                    customLoader
                  ) : (
                    <TailSpin
                      width="40px"
                      height="40px"
                      ariaLabel="loading-indicator"
                      color="#f2d335"
                    />
                  )
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
                    <div
                      style={{
                        width: "calc(100%)",
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
                          this.hasUserActions ? (
                            this.getUserActions()
                          ) : (
                            <div>
                              <AnterosButton visible={false} />
                            </div>
                          )
                        }
                      />
                    </div>
                    <AnterosQueryBuilder
                      zIndex={50}
                      id={loadingProps.filterName}
                      formName={loadingProps.viewName}
                      ref={this.filterRef}
                      expandedFilter={this.state.filterExpanded}
                      update={this.state.update}
                      dataSource={this.dsFilter}
                      currentFilter={this.props.currentFilter}
                      activeFilterIndex={this.props.activeFilterIndex}
                      onSelectedFilter={this.onSelectedFilter}
                      onFilterChanged={this.onFilterChanged}
                      onSearchByFilter={this.onSearchByFilter}
                      onToggleExpandedFilter={this.onToggleExpandedFilter}
                      width={"660px"}
                      height="170px"
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
                      justifyContent: "flex-start",
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
                  id={"table" + loadingProps.viewName}
                  height={"200px"}
                  ref={(ref) => (this.table = ref)}
                  dataSource={this.dataSource}
                  width="100%"
                  enablePaging={false}
                  enableSearching={false}
                  showExportButtons={false}
                  onDoubleClick={this.onDoubleClickTable}
                  onSelectRecord={this.handleOnSelectRecord}
                  onUnSelectRecord={this.handleOnUnselectRecord}
                  onSelectAllRecords={this.handleOnSelectAllRecords}
                  onUnSelectAllRecords={this.handleOnUnselectAllRecords}
                >
                  {this.getColumns()}
                </AnterosDataTable>
                <WrappedComponent
                  {...this.props}
                  ref={(ref) => (this.wrappedRef = ref)}
                  state={this.state}
                  user={this.props.user}
                  ownerTemplate={this}
                  history={this.props.history}
                  dataSource={this.dataSource}
                />
              </AnterosBlockUi>
              <FooterActions className="versatil-card-footer">
                <AnterosRow className="row justify-content-start align-items-center">
                  <AnterosCol medium={4}>
                    <AnterosLabel
                      caption={`Total ${
                        loadingProps.caption
                      } ${this.dataSource.getGrandTotalRecords()}`}
                    />
                  </AnterosCol>
                  <AnterosCol medium={7}> 
                    <AnterosPagination
                      horizontalEnd
                      dataSource={this.dataSource}
                      visiblePages={8}
                      onBeforePageChanged={this.onBeforePageChanged}
                      onPageChanged={this.handlePageChanged}
                    />
                  </AnterosCol>
                </AnterosRow>
              </FooterActions>
            </AnterosCard>
            {modals}
          </Fragment>
        );
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(TableContainerView);
  };
}

class UserActions extends Component {
  render() {
    return (
      <div>
        {this.props.positionUserActions === "first"
          ? this.props.userActions
          : null}
        {this.props.routes.edit ? (
          <AnterosButton
            id="btnView"
            route={this.props.routes.edit}
            icon="fal fa-eye"
            small
            className="versatil-btn-visualizar"
            caption={
              this.props.labelButtonEdit
                ? this.props.labelButtonEdit
                : "Visualizar"
            }
            hint={
              this.props.labelButtonEdit
                ? this.props.labelButtonEdit
                : "Visualizar"
            }
            onButtonClick={this.props.onButtonClick}
            disabled={
              this.props.dataSource.isEmpty() ||
              this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
            }
          />
        ) : null}
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
                : "Remover"
            }
            hint={
              this.props.labelButtonRemove
                ? this.props.labelButtonRemove
                : "Remover"
            }
            className="versatil-btn-remover"
            onButtonClick={this.props.onButtonClick}
          />
        ) : null}{" "}
        {this.props.positionUserActions === "last"
          ? this.props.userActions
          : null}
      </div>
    );
  }
}

export class TableTemplateActions extends Component {
  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}
