import React from "react";
import { connect } from "react-redux";
import {
  AnterosBlockUi,
} from "@anterostecnologia/anteros-react-loaders";
import { TailSpin } from 'react-loader-spinner';
import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  DATASOURCE_EVENTS,
  dataSourceConstants,
} from "@anterostecnologia/anteros-react-datasource";
import { AnterosQueryBuilder, NORMAL, QUICK, ADVANCED,AnterosFilterDSL,AnterosQueryBuilderData  } from "@anterostecnologia/anteros-react-querybuilder";
import {
  autoBind,
  processErrorMessage,
  AnterosError,
} from "@anterostecnologia/anteros-react-core";
import {
  AnterosModal,
  ModalActions,
} from "@anterostecnologia/anteros-react-containers";
import {
  AnterosRow,
  AnterosCol,
} from "@anterostecnologia/anteros-react-layout";
import { AnterosPagination } from "@anterostecnologia/anteros-react-navigation";
import { AnterosAlert } from "@anterostecnologia/anteros-react-notification";
import { AnterosDataTable } from "@anterostecnologia/anteros-react-table";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosTags } from "@anterostecnologia/anteros-react-label";

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  messageLoading: "Carregando, por favor aguarde...",
  withFilter: true,
  fieldsToForceLazy: "",
  modalSize: "semifull",
  defaultSortFields: "",
  labelField: "id",
  filterName: "filter",
  cumulativeSelection: false,
  version: "v1",
};

export default function WithSearchModalTemplate(_loadingProps) {
  let loadingProps = { ...defaultValues, ..._loadingProps};

  const mapStateToProps = (state) => {
    let currentFilter, user, activeFilterIndex;
    let reducer = state[loadingProps.reducerName];
    if (reducer) {
      currentFilter = reducer.currentFilter;
      activeFilterIndex = reducer.activeFilterIndex;
    }
    user = state[loadingProps.userReducerName].user;
    return {
      currentFilter: currentFilter,
      activeFilterIndex: activeFilterIndex,
      user: user,
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return {
      setDatasource: (dataSource) => {
        dispatch(loadingProps.actions.setDatasource(dataSource));
      },
      setFilter: (currentFilter, activeFilterIndex) => {
        dispatch(
          loadingProps.actions.setFilter(currentFilter, activeFilterIndex)
        );
      },
    };
  };

  return (WrappedComponent) => {
    class SearchModal extends WrappedComponent {
      constructor(props, context) {
        super(props);
        autoBind(this);
        this.filterRef = React.createRef();

        if (!loadingProps.endPoints) {
          throw new AnterosError(
            "Informe o objeto com os endPoints de consulta. "
          );
        }
        if (!loadingProps.resource) {
          throw new AnterosError("Informe o nome do RESOURCE de consulta. ");
        }
        if (!loadingProps.reducerName) {
          throw new AnterosError("Informe o nome do REDUCER. ");
        }
        if (!loadingProps.viewName) {
          throw new AnterosError("Informe o nome da View. ");
        }
        if (!loadingProps.caption) {
          throw new AnterosError("Informe o caption(titulo) da View. ");
        }
        if (loadingProps.withFilter === true && !loadingProps.filterName) {
          throw new AnterosError("Informe o nome do filtro. ");
        }

        if (WrappedComponent.prototype.hasOwnProperty("getColumns") === false) {
          throw new AnterosError("Implemente o método getColumns na classe.");
        }

        if (
          loadingProps.withFilter &&
          WrappedComponent.prototype.hasOwnProperty("getFieldsFilter") === false
        ) {
          throw new AnterosError(
            "Implemente o método getFieldsFilter na classe."
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty("getRoutes") &&
          this.getRoutes()
        ) {
          loadingProps.routes = this.getRoutes();
        }

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

        this.state = {
          alertIsOpen: false,
          alertMessage: "",
          modalOpen: "",
          filterExpanded: false,
          modalCallback: null,
        };

        autoBind(this);
      }
      createDataSourceFilter() {
        this.dsFilter = AnterosQueryBuilderData.createDatasource(
          loadingProps.viewName,
          loadingProps.filterName,
          loadingProps.version
        );
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

        if (this.dataSource instanceof AnterosRemoteDatasource) {
          this.dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
        }
        this.dataSource.addEventListener(
          DATASOURCE_EVENTS,
          this.onDatasourceEvent
        );
      }

      pageConfigHandler(page) {
        return this.getData(this.props.currentFilter, page);
      }

      componentDidMount() {
        if (this.dataSource instanceof AnterosRemoteDatasource) {
          this.dataSource.open(this.getData(this.props.currentFilter, 0));
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
          if (this.dataSource instanceof AnterosRemoteDatasource) {
            this.dataSource.setAjaxPageConfigHandler(null);
          }
        }
        if (
          WrappedComponent.prototype.hasOwnProperty("onWillUnmount") === true
        ) {
          this.onWillUnmount();
        }
      }

      handlePageChanged(newPage) {
        this.setState({
          ...this.state,
          update: Math.random(),
          currentPage: newPage,
        });
      }

      onFilterChanged(filter, activeFilterIndex) {
        this.props.setFilter(filter, activeFilterIndex);
        this.setState({ ...this.state, update: Math.random() });
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

      onShowHideLoad(show) {
        this.setState({
          ...this.state,
          loading: show,
          update: Math.random(),
        });
      }

      onSearchByFilter(currentFilter) {
        this.onShowHideLoad(true);
        this.dataSource.open(this.getData(currentFilter, 0), () => {
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
              update: Math.random(),
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

      onSelectRecord(row, data, tableId) {
        this.props.selectedRecords.push(this.dataSource.getCurrentRecord());
        if (loadingProps.cumulativeSelection) {
          this.setState({ ...this.state, update: Math.random() });
        }
      }

      onUnSelectRecord(row, data, tableId) {
        for (var i = 0; i < this.props.selectedRecords.length; i++) {
          if (
            this.props.selectedRecords[i] === this.dataSource.getCurrentRecord()
          ) {
            this.props.selectedRecords.splice(i, 1);
          }
        }
        if (loadingProps.cumulativeSelection) {
          this.setState({ ...this.state, update: Math.random() });
        }
      }

      handleDelete(i) {
        this.props.selectedRecords.splice(i, 1);
        this.setState({ ...this.state, update: Math.random() });
      }

      onClear() {
        this.props.selectedRecords.splice(0, this.props.selectedRecords.length);
        this.setState({ ...this.state, update: Math.random() });
      }

      onSelectAllRecords(records, tableId) {
        let _this = this;
        this.props.selectedRecords.splice(0, this.props.selectedRecords.length);
        records.forEach(function buscaObjetos(element) {
          _this.props.selectedRecords.push(element);
        });
        if (loadingProps.cumulativeSelection) {
          this.setState({ ...this.state, update: Math.random() });
        }
      }

      onUnSelectAllRecords(tableId) {
        this.props.selectedRecords.splice(0, this.props.selectedRecords.length);
        if (loadingProps.cumulativeSelection) {
          this.setState({ ...this.state, update: Math.random() });
        }
      }

      autoCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          update: Math.random(),
          alertMessage: "",
        });
      }

      onClick(event) {
        if (event.target.getAttribute("data-user") === "btnOK") {
          if (this.dataSource.isEmpty()) {
            this.setState({
              ...this.state,
              alertIsOpen: true,
              alertMessage: "Selecione um registro para continuar.",
            });
          } else {
            if (this.props.selectedRecords){
              if (this.props.selectedRecords.length === 0) {
                this.props.selectedRecords.push(
                  this.dataSource.getCurrentRecord()
                );
              }
            }
            this.props.onClickOk(event, this.props.selectedRecords);
          }
        } else if (event.target.getAttribute("data-user") === "btnCancel") {
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

      render() {
        let modalOpen = this.props.modalOpen;
        if (modalOpen && modalOpen.includes("#")) {
          modalOpen = modalOpen.split("#")[0];
        }
        let modalSize = {};
        if (loadingProps.modalSize === "extrasmall") {
          modalSize = { extraSmall: true };
        } else if (loadingProps.modalSize === "small") {
          modalSize = { small: true };
        } else if (loadingProps.modalSize === "medium") {
          modalSize = { medium: true };
        } else if (loadingProps.modalSize === "large") {
          modalSize = { large: true };
        } else if (loadingProps.modalSize === "semifull") {
          modalSize = { semifull: true };
        } else if (loadingProps.modalSize === "full") {
          modalSize = { full: true };
        }
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
          <AnterosModal
            id={loadingProps.viewName}
            title={loadingProps.caption}
            primary
            {...modalSize}
            showHeaderColor={true}
            showContextIcon={false}
            isOpen={modalOpen === loadingProps.viewName || this.props.isOpen}
            onCloseButton={this.onCloseButton}
            withScroll={false}
            hideExternalScroll={true}
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
              {this.positionUserActions === "first"
                ? this.hasUserActions
                  ? this.getUserActions()
                  : null
                : null}
              <AnterosButton success dataUser="btnOK" onClick={this.onClick}>
                OK
              </AnterosButton>{" "}
              <AnterosButton danger dataUser="btnCancel" onClick={this.onClick}>
                Fechar
              </AnterosButton>
              {this.positionUserActions === "last"
                ? this.hasUserActions
                  ? this.getUserActions()
                  : null
                : null}
            </ModalActions>
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
                      justifyContent: "end",
                    }}
                  >
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
                      detailsHeight="550px"
                      allowSort={true}
                      disabled={
                        this.dataSource.getState() !==
                        dataSourceConstants.DS_BROWSE
                      }
                    >
                      {this.getFieldsFilter()}
                    </AnterosQueryBuilder>
                  </div>
                ) : 
                  null
                }

                <AnterosDataTable
                  id={"table" + loadingProps.viewName}
                  height={"450px"}
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
          </AnterosModal>
        );
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(SearchModal);
  };
}
