import React, { Component } from "react";
import { connect } from "react-redux";

import {
  autoBind,
  processErrorMessage,
  AnterosResizeDetector,
  AnterosSweetAlert,
  AnterosJacksonParser,
  AnterosError,
} from "@anterostecnologia/anteros-react-core";
import {
  AnterosQueryBuilderData,
  AnterosQueryBuilder,
  AnterosFilterDSL,
} from "@anterostecnologia/anteros-react-querybuilder";
import {
  AnterosRemoteDatasource,
  DATASOURCE_EVENTS,
  dataSourceEvents,
} from "@anterostecnologia/anteros-react-datasource";
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
import { AnterosMasonry } from "@anterostecnologia/anteros-react-masonry";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosLabel } from "@anterostecnologia/anteros-react-label";

const defaultValues = {
    openDataSourceFilter: true,
    openMainDataSource: true,
    messageLoading: "Carregando, por favor aguarde...",
    withFilter: true,
    fieldsToForceLazy: "",
    defaultSortFields: "",
    filterName: "filter",
    version: "v1",
  };  

export default function WithListContainerTemplate(_loadingProps, ViewItem) {
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
    class ListContainerView extends Component {
      constructor(props, context) {
        super(props);
        autoBind(this);
        this.createDataSourceFilter();
        this.createMainDataSource();

        this.state = {
          alertIsOpen: false,
          alertMessage: "",
          modalOpen: null,
          update: Math.random(),
          idRecord: 0,
          contentHeight: "540px",
          selectedItem: undefined,
          filterExpanded: false,
          loading: false,
        };
      }

      createDataSourceFilter() {
        this.dsFilter = AnterosQueryBuilderData.createDatasource(
          loadingProps.viewName,
          loadingProps.filterName,
          loadingProps.version
        );
      }

      createMainDataSource() {
        if (this.props.dataSource) {
          this.dataSource = this.props.dataSource;
        } else {
          this.dataSource = new AnterosRemoteDatasource();
          this.dataSource.setAjaxPostConfigHandler((entity) => {
            let entityJson = AnterosJacksonParser.convertObjectToJson(entity);
            return {
              url: loadingProps.resource,
              method: "post",
              data: entityJson,
            };
          });
          this.dataSource.setValidatePostResponse((response) => {
            return response.data !== undefined;
          });
          this.dataSource.setAjaxDeleteConfigHandler((dispositivo) => {
            return {
              url: `${loadingProps.resource}${dispositivo.id}`,
              method: "delete",
            };
          });
          this.dataSource.setValidateDeleteResponse((response) => {
            return response.data !== undefined;
          });
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getRoutes") &&
          this.getRoutes()
        ) {
          loadingProps.routes = this.getRoutes();
        }

        this.dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        this.dataSource.addEventListener(
          DATASOURCE_EVENTS,
          this.onDatasourceEvent
        );
      }

      componentDidMount() {
        if (loadingProps.openMainDataSource) {
          if (!this.dataSource.isOpen()) {
            this.dataSource(this.getData(this.props.currentFilter,0));
          }
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.dataSource.cancel();
          }
        }

        if (WrappedComponent.prototype.hasOwnProperty("onDidMount") === true) {
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

        if (
          WrappedComponent.prototype.hasOwnProperty("onWillUnmount") === true
        ) {
          this.onWillUnmount();
        }
        this.props.hideTour();
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

      onSelectedItem(item) {
        this.setState({
          ...this.state,
          selectedItem:
            this.state.selectedItem && item.id === this.state.selectedItem.id
              ? null
              : item,
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
          //
        }

        if (event === dataSourceEvents.ON_ERROR) {
          if (error) {
            this.setState({
              ...this.state,
              alertIsOpen: true,
              loading: false,
              alertMessage: processErrorMessage(error),
            });
          }
        } else {
          this.setState({
            ...this.state,
            loading,
            alertIsOpen: false,
            alertMessage: undefined,
            update: Math.random(),
          });
        }
      }

      onButtonClick(event, button) {
        if (button.props.id === "btnAdd") {
          if (!this.dataSource.isOpen()) this.dataSource.open();
          this.dataSource.insert();
        } else if (button.props.id === "btnEdit") {
          this.dataSource.locate({ id: button.props.idRecord });
          this.dataSource.edit();
        } else if (button.props.id === "btnRemove") {
          this.dataSource.locate({ id: button.props.idRecord });
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
            currentFilter.filter.quickFilterFieldsText,
            0,
            loadingProps.pageSize,
            this.getSortFields(),
            this.getUser(),
            loadingProps.fieldsToForceLazy
          );
        } else {
          return loadingProps.endPoints.FIND_MULTIPLE_FIELDS(
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

      pageConfigHandler(page) {
        return this.getData(this.props.currentFilter,page);
      }

      onDoubleClickTable(data) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onCustomDoubleClick") ===
          true
        ) {
          this.onCustomDoubleClick(data);
        }
      }

      onShowHideLoad(show) {
        this.setState({
          ...this.state,
          loading: show,
          update: Math.random(),
        });
      }

      onCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: "",
        });
      }

      render() {
        return (
          <AnterosCard
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
              blocking={this.state.loading}
              message={loadingProps.messageLoading}
              loader={
                <AnterosLoader active type="ball-pulse" color="#02a17c" />
              }
            >
              <div
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                }}
              >
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
                      this.dataSource.getState() !==
                      dataSourceConstants.DS_BROWSE
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
                      this.dataSource.getState() !==
                        dataSourceConstants.DS_BROWSE
                    }
                  />
                  <AnterosButton
                    id="btnRemove"
                    icon="fal fa-trash"
                    disabled={
                      this.dataSource.isEmpty() ||
                      this.dataSource.getState() !==
                        dataSourceConstants.DS_BROWSE
                    }
                    small
                    caption="Remover"
                    className="versatil-btn-remover"
                    onButtonClick={this.onButtonClick}
                  />
                </div>

                <AnterosQueryBuilder
                  zIndex={50}
                  id={loadingProps.filtroDispositivos}
                  formName={loadingProps.viewName}
                  ref={this.filterRef}
                  filterExpanded={this.state.filterExpanded}
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
                    this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                  }
                >
                  {loadingProps.filterFields}
                </AnterosQueryBuilder>
              </div>
              <div
                style={{
                  height: this.state.contentHeight,
                  overflow: "auto",
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
                >
                  {!this.dataSource.isEmpty()
                    ? this.dataSource.getData().map((r) => {
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
    return connect(mapStateToProps, mapDispatchToProps)(MasonryContainerView);
  };
}
