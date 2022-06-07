import React from "react";
import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  DATASOURCE_EVENTS,
  dataSourceConstants,
} from "@anterostecnologia/anteros-react-datasource";
import {
  AnterosSweetAlert,
  AnterosError,AnterosResizeDetector,autoBind,processErrorMessage
} from "@anterostecnologia/anteros-react-core";
import { connect } from "react-redux";
import { AnterosQueryBuilder, NORMAL, QUICK, ADVANCED,AnterosFilterDSL,AnterosQueryBuilderData  } from "@anterostecnologia/anteros-react-querybuilder";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import {
  AnterosCard,
  HeaderActions,
  FooterActions,
} from "@anterostecnologia/anteros-react-containers";
import { AnterosAlert } from "@anterostecnologia/anteros-react-notification";
import { AnterosBlockUi } from "@anterostecnologia/anteros-react-loaders";
import {
  AnterosCol,
  AnterosRow,
} from "@anterostecnologia/anteros-react-layout";
import { AnterosLabel } from "@anterostecnologia/anteros-react-label";
import { AnterosPagination } from "@anterostecnologia/anteros-react-navigation";
import { AnterosMasonry } from "@anterostecnologia/anteros-react-masonry";
import { TailSpin } from 'react-loader-spinner';

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  messageLoading: "Por favor aguarde...",
  withFilter: true,
  fieldsToForceLazy: "",
  defaultSortFields: "",
  filterName: "filter",
  version: "v1",
  fieldId: "id",
};

export default function WithMasonryContainerTemplate(_loadingProps) {
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
          WrappedComponent.prototype.hasOwnProperty("getViewItem") === false
        ) {
          throw new AnterosError(
            "Implemente o método getViewItem na classe " + WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getUserActions") === false
        ) {
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

        if (
          WrappedComponent.prototype.hasOwnProperty("getRoutes") &&
          this.getRoutes()
        ) {
          loadingProps.routes = this.getRoutes();
        }

        autoBind(this);
        if (loadingProps.withFilter) {
          this.createDataSourceFilter();
        }

        if (
          WrappedComponent.prototype.hasOwnProperty(
            "customCreateDatasource"
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
          alertMessage: "",
          modalOpen: null,
          update: Math.random(),
          idRecord: 0,
          contentHeight: "auto",
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
        if (loadingProps.openMainDataSource) {
          if (WrappedComponent.prototype.hasOwnProperty("onFindAll") === true) {
            this.dataSource.open(this.getData(this.props.currentFilter, 0));
          } else {
            if (!this.dataSource.isOpen()) {
              this.dataSource.open(this.getData(this.props.currentFilter, 0));
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

      onFilterChanged(filter, activeFilterIndex) {
        this.props.setFilter(filter, activeFilterIndex);
        this.setState({ ...this.state, update: Math.random() });
      }

      onToggleExpandedFilter(expanded) {
        this.props.setFilter(
          this.props.currentFilter,
          this.props.activeFilterIndex,
          expanded
        );
      }

      onSelectedFilter(filter, index) {
        this.props.setFilter(filter, index);
        this.setState({ ...this.state, update: Math.random() });
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

      getSortFields() {
        if (
          loadingProps.withFilter &&
          this.props.currentFilter &&
          this.props.currentFilter.sort
        ) {
          return this.props.currentFilter.sort.quickFilterSort;
        }
        return loadingProps.defaultSortFields;
      }


      handlePageChanged(newPage) {
        this.setState({
          ...this.state,
          currentPage: newPage,
        });
      }
      setStateTemplate(state) {
        this.setState({ ...state });
      }

      onSelectedItem(item) {
        this.setState({
          ...this.state,
          selectedItem:
            this.state.selectedItem &&
            item[loadingProps.fieldId] ===
              this.state.selectedItem[loadingProps.fieldId]
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
        if (
          WrappedComponent.prototype.hasOwnProperty("onCustomButtonClick") ===
          true
        ) {
          if (!this.onCustomButtonClick(event, button)) {
            return;
          }
        }

        if (button.props.id === "btnAdd") {
          if (
            WrappedComponent.prototype.hasOwnProperty("onCustomAdd") === true
          ) {
            this.onCustomAdd(button.props.route);
            return;
          } else {
            if (!this.dataSource.isOpen()) this.dataSource.open();
            this.dataSource.insert();
          }
        } else if (button.props.id === "btnEdit") {
          if (
            WrappedComponent.prototype.hasOwnProperty("onCustomEdit") === true
          ) {
            this.dataSource.locate({
              [loadingProps.fieldId]: button.props.idRecord,
            });
            this.onCustomEdit(button.props.route);
            return;
          } else {
            this.dataSource.locate({
              [loadingProps.fieldId]: button.props.idRecord,
            });
            this.dataSource.edit();
          }
        } else if (button.props.id === "btnRemove") {
          this.dataSource.locate({
            [loadingProps.fieldId]: button.props.idRecord,
          });
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

      getDataWithQuickFilter(currentFilter, page) {
        if (
          WrappedComponent.prototype.hasOwnProperty("onFindMultipleFields") ===
          true
        ) {
          return this.onFindMultipleFields(
            currentFilter.filter.quickFilterText,
            currentFilter.filter.quickFilterFieldsText,
            page,
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
        this.props.history.push(loadingProps.routes.edit);
      }

      pageConfigHandler(page) {
        return this.getData(this.props.currentFilter, page);
      }

      onCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: "",
        });
      }

      createItems() {
        let itemsProps = {};
        if (
          WrappedComponent.prototype.hasOwnProperty("getItemsProps") === true
        ) {
          itemsProps = this.getItemsProps();
        }
        let ViewItem = this.getViewItem();
        let result = [];
        for (var i = 0; i < this.dataSource.getData().length; i++) {
          let r = this.dataSource.getData()[i];
          result.push(
            <ViewItem
              selected={
                this.state.selectedItem
                  ? this.state.selectedItem[loadingProps.fieldId] ===
                    r[loadingProps.fieldId]
                  : false
              }
              onSelectedItem={this.onSelectedItem}
              key={r[loadingProps.fieldId]}
              record={r}
              dispatch={this.props.dispatch}
              history={this.props.history}
              onButtonClick={this.onButtonClick}
              {...itemsProps}
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

      onResize(width, height) {
        this.setState({
          ...this.state,
          contentHeight: height - 60,
        });
      }

      onShowHideLoad(show) {
        this.setState({
          ...this.state,
          loading: show,
          update: Math.random(),
        });
      }

      render() {
        const messageLoading = WrappedComponent.prototype.hasOwnProperty(
          "getCustomMessageLoading"
        )
          ? this.getCustomMessageLoading()
          : loadingProps.messageLoading;
        const customLoader = WrappedComponent.prototype.hasOwnProperty(
            "getCustomLoader"
          )
            ? this.getCustomLoader()
            : null;  
        return (
          <AnterosCard
            caption={loadingProps.caption}
            className="versatil-card-full"
            ref={(ref) => (this.card = ref)}
            withScroll={false}
            styleBlock={{
              height: "calc(100% - 120px)",
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
                  height: "100%",
                }}
                styleBlockMessage={{
                  border: "2px solid white",
                  width: "200px",
                  height:'80px',
                  padding:'8px',
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
                    <TailSpin width='40px' height="40px" ariaLabel="loading-indicator" color="#f2d335"/>
                  )
                }
              >
              <div
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <div>
                    {this.getPositionUserActions() === "first"
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
                        this.dataSource.getState() !==
                        dataSourceConstants.DS_BROWSE
                      }
                    />{" "}
                    {this.getPositionUserActions() === "last"
                      ? this.getUserActions()
                      : null}
                  </div>

                  {this.state.filterExpanded ? (
                    <div
                      style={{
                        height: this.state.contentHeight,
                        overflow: "auto",
                        paddingTop: "15px",
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
                        {!this.dataSource.isEmpty() ? this.createItems() : null}
                      </AnterosMasonry>
                    </div>
                  ) : null}
                </div>

                <AnterosQueryBuilder
                  zIndex={50}
                  id={loadingProps.filtroDispositivos}
                  formName={loadingProps.viewName}
                  ref={this.filterRef}
                  expandedFilter={this.state.filterExpanded}
                  dataSource={this.dsFilter}
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
                  {this.getFieldsFilter()}
                </AnterosQueryBuilder>
              </div>

              {this.state.filterExpanded ? null : (
                <div
                  style={{
                    height: this.state.contentHeight,
                    overflow: "auto",
                    paddingTop: "15px",
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
                    {!this.dataSource.isEmpty() ? this.createItems() : null}
                  </AnterosMasonry>
                </div>
              )}
              <WrappedComponent
                {...this.props}
                state={this.state}
                user={this.props.user}
                dataSource={this.dataSource}
                onClickOk={this.onClickOk}
                ownerTemplate={this}
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
    return connect(mapStateToProps, mapDispatchToProps)(MasonryContainerView);
  };
}
