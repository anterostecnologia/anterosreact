import React, { Component, Fragment, ReactNode } from "react";
import { TailSpin } from "react-loader-spinner";

import {
  AnterosRemoteDatasource,
  AnterosDatasource,
  dataSourceEvents,
  dataSourceConstants,
  DATASOURCE_EVENTS,
} from "@anterostecnologia/anteros-react-datasource";
import {
  autoBind,
  processErrorMessage,
} from "@anterostecnologia/anteros-react-core";
import {
  AnterosQueryBuilder,
  NORMAL,
  QUICK,
  ADVANCED,
  AnterosFilterDSL,
  AnterosQueryBuilderData,
} from "@anterostecnologia/anteros-react-querybuilder";
import { FooterActions } from "@anterostecnologia/anteros-react-containers";
import { AnterosBlockUi } from "@anterostecnologia/anteros-react-loaders";
import {
  AnterosCol,
  AnterosRow,
} from "@anterostecnologia/anteros-react-layout";
import { AnterosPagination } from "@anterostecnologia/anteros-react-navigation";
import { AnterosAlert } from "@anterostecnologia/anteros-react-notification";
import { AnterosDataTable } from "@anterostecnologia/anteros-react-table";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import shallowCompare from "react-addons-shallow-compare";
import { noop } from "lodash";
import {
  UserData,
  IAnterosRemoteResource,
  AnterosEntity,
} from "@anterostecnologia/anteros-react-api2";
import { RouteComponentProps } from "react-router";
import { ModalActions } from "@anterostecnologia/anteros-react-containers";
import {
  AnterosTags,
  AnterosLabel,
} from "@anterostecnologia/anteros-react-label";

export enum PositionUserActions {
  first,
  last,
}

interface AnterosSearchTemplateProps<T extends AnterosEntity, TypeID> {
  caption: string;
  openDataSourceFilter: boolean;
  openMainDataSource: boolean;
  dataSource: AnterosDatasource | undefined;
  messageLoading: string;
  withFilter: boolean;
  fieldsToForceLazy: string;
  defaultSortFields: string;
  selectedRecords: Array<any>;
  filterName: string;
  labelField: string;
  version: string;
  viewName: string;
  user: UserData;
  pageSize: number;
  currentFilter: any;
  needRefresh: boolean;
  columns: ReactNode | undefined;
  routes: any;
  positionUserActions: PositionUserActions;
  fieldsFilter: ReactNode | undefined;
  userActions?: ReactNode | undefined;
  remoteResource?: IAnterosRemoteResource<T, TypeID>;
  labelButtonOk: string;
  labelButtonCancel: string;
  isCumulativeSelection: boolean;
  setDatasource(dataSource: AnterosDatasource): void;
  setFilter(filter: any, activeFilterIndex: number): void;
  hideTour(): void;
  history: RouteComponentProps["history"];
  activeFilterIndex: number;
  onButtonClick?: Function;
  onDidMount?(): void;
  onWillUnmount?(): void;
  onClickOk: Function;
  onClickCancel: Function;
  onCustomCreateDatasource?(): AnterosDatasource;
  onCustomFindWithFilter?(
    filter: string,
    page: number,
    pageSize: number,
    sort: string,
    fieldsToForceLazy: string
  ): any | undefined;
  onCustomFindAll?(
    page: number,
    pageSize: number,
    sort: string,
    fieldsToForceLazy: string
  ): any | undefined;
  onCustomFindMultipleFields?(
    filter: string,
    fields: string,
    page: number,
    pageSize: number,
    sort: string,
    fieldsToForceLazy: string
  ): any | undefined;
  onCustomDoubleClick?(data: any): void;
  onCustomUser?(): UserData;
  onSelectRecord?(row: any, data: any, tableId: string): void;
  onUnselectRecord?(row: any, data: any, tableId: string): void;
  onSelectAllRecords?(records: any[], tableId: string): void;
  onUnselectAllRecords?(tableId: any): void;
  getCustomLoader?(): ReactNode | undefined;
  getCustomMessageLoading?(): string | undefined;
}

interface AnterosTableTemplateState {
  dataSource: AnterosDatasource;
  alertIsOpen: boolean;
  alertMessage: string;
  loading: boolean;
  width: any;
  newHeight: any;
  filterExpanded: boolean;
  update: number;
}

class AnterosSearchTemplate<T extends AnterosEntity, TypeID> extends Component<
  AnterosSearchTemplateProps<T, TypeID>,
  AnterosTableTemplateState
> {
  private _dataSource: AnterosDatasource;
  private _dataSourceFilter: AnterosRemoteDatasource;
  private _cardRef: any;
  private _tableRef: any;
  private _filterRef: any;

  static defaultProps = {
    openDataSourceFilter: true,
    openMainDataSource: true,
    messageLoading: "Por favor aguarde...",
    withFilter: true,
    fieldsToForceLazy: "",
    defaultSortFields: "",
    labelButtonOk: "Ok",
    labelButtonCancel: "Fechar",
    positionUserActions: PositionUserActions.first,
    userActions: undefined,
    isCumulativeSelection: false,
  };

  constructor(props: AnterosSearchTemplateProps<T, TypeID>) {
    super(props);
    autoBind(this);
    this._dataSourceFilter = this.createDataSourceFilter(props);

    if (props.onCustomCreateDatasource) {
      this._dataSource = props.onCustomCreateDatasource();
    }
    if (!this._dataSource) {
      this.createMainDataSource();
    }
    if (this._dataSource instanceof AnterosRemoteDatasource) {
      this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
    }
    this._dataSource.addEventListener(
      DATASOURCE_EVENTS,
      this.onDatasourceEvent
    );

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

  createDataSourceFilter(
    props: AnterosSearchTemplateProps<T, TypeID>
  ): AnterosRemoteDatasource {
    return AnterosQueryBuilderData.createDatasource(
      props.viewName,
      props.filterName,
      props.version
    );
  }

  getUser(): UserData {
    let result: UserData;
    if (this.props.onCustomUser) {
      result = this.props.onCustomUser();
    } else {
      result = this.props.user;
    }
    return result;
  }

  createMainDataSource() {
    if (this.props.dataSource) {
      this._dataSource = this.props.dataSource;
      if (this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
        this._dataSource.cancel();
      }
    } else {
      this._dataSource = new AnterosRemoteDatasource();
      this._dataSource.setAjaxPostConfigHandler((entity: T) => {
        return this.props.remoteResource!.save(entity);
      });
      this._dataSource.setValidatePostResponse((response) => {
        return response.data !== undefined;
      });
      this._dataSource.setAjaxDeleteConfigHandler((entity: T) => {
        return this.props.remoteResource!.delete(entity);
      });
      this._dataSource.setValidateDeleteResponse((response) => {
        return response.data !== undefined;
      });
    }

    this._dataSource.setAjaxPageConfigHandler(this.pageConfigHandler);
    this._dataSource.addEventListener(
      DATASOURCE_EVENTS,
      this.onDatasourceEvent
    );
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.openMainDataSource) {
        if (!this._dataSource.isOpen()) {
          this._dataSource.open(this.getData(this.props.currentFilter, 0));
        } else if (this.props.needRefresh) {
          this._dataSource.open(
            this.getData(
              this.props.currentFilter,
              this._dataSource.getCurrentPage()
            )
          );
        }
        if (this._dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
          this._dataSource.cancel();
        }
      }

      if (this.props.onDidMount) {
        this.props.onDidMount();
      }
    }, 100);
  }

  componentWillUnmount() {
    if (this._dataSource) {
      this._dataSource.removeEventListener(
        DATASOURCE_EVENTS,
        this.onDatasourceEvent
      );
      if (this._dataSource instanceof AnterosRemoteDatasource) {
        this._dataSource.setAjaxPageConfigHandler(null);
      }
    }
    if (this.props.onWillUnmount) {
      this.props.onWillUnmount();
    }
    this.props.hideTour();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  onFilterChanged(filter, activeFilterIndex, callback = noop) {
    this.props.setFilter(filter, activeFilterIndex);
    this.setState({ ...this.state, update: Math.random() }, callback);
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

  onBeforePageChanged(_currentPage, _newPage) {
    //
  }

  handlePageChanged(_newPage) {
    //
  }

  getSortFields(): any {
    if (
      this.props.withFilter &&
      this.props.currentFilter &&
      this.props.currentFilter.sort
    ) {
      return this.props.currentFilter.sort.quickFilterSort;
    }
    return this.props.defaultSortFields;
  }

  onDatasourceEvent(event: any, error: any) {
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

    if (
      event === dataSourceEvents.AFTER_OPEN ||
      event === dataSourceEvents.AFTER_GOTO_PAGE ||
      event === dataSourceEvents.ON_ERROR
    ) {
      this.props.setDatasource(this._dataSource);
      this.setState({
        ...this.state,
        update: Math.random(),
        alertIsOpen: false,
        loading: false,
      });
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

  onSearchByFilter() {
    this.onShowHideLoad(true);
    this._dataSource.open(this.getData(this.props.currentFilter, 0), () => {
      this.onShowHideLoad(false);
    });
  }

  getData(currentFilter: any, page: number) {
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

  getDataWithFilter(currentFilter, page): any {
    var filter = new AnterosFilterDSL();
    filter.buildFrom(currentFilter.filter, currentFilter.sort);
    let filterStr = filter.toJSON();
    let result: any = undefined;
    if (filterStr) {
      if (this.props.onCustomFindWithFilter) {
        result = this.props.onCustomFindWithFilter(
          filter.toJSON(),
          page,
          this.props.pageSize,
          this.getSortFields(),
          this.props.fieldsToForceLazy
        );
      }
      if (!result) {
        result = this.props.remoteResource!.findWithFilter(
          filter.toJSON(),
          page,
          this.props.pageSize,
          this.props.fieldsToForceLazy
        );
      }
    } else {
      result = this.getDataWithoutFilter(page);
    }
    return result;
  }

  getDataWithoutFilter(page): any {
    let result: any = undefined;
    if (this.props.onCustomFindAll) {
      return this.props.onCustomFindAll(
        page,
        this.props.pageSize,
        this.getSortFields(),
        this.props.fieldsToForceLazy
      );
    }
    if (!result) {
      result = this.props.remoteResource!.findAll(
        page,
        this.props.pageSize,
        this.getSortFields(),
        this.props.fieldsToForceLazy,
        undefined
      );
    }
    return result;
  }

  getDataWithQuickFilter(currentFilter, page) {
    let result: any = undefined;
    if (this.props.onCustomFindMultipleFields) {
      result = this.props.onCustomFindMultipleFields(
        currentFilter.filter.quickFilterText,
        currentFilter.filter.quickFilterFieldsText,
        0,
        this.props.pageSize,
        this.getSortFields(),
        this.props.fieldsToForceLazy
      );
    }
    if (!result) {
      return this.props.remoteResource!.findMultipleFields(
        currentFilter.filter.quickFilterText,
        currentFilter.filter.quickFilterFieldsText,
        page,
        this.props.pageSize,
        this.getSortFields(),
        this.props.fieldsToForceLazy
      );
    }

    return result;
  }

  onDoubleClickTable(data) {
    if (this.props.onCustomDoubleClick) {
      this.props.onCustomDoubleClick(data);
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
    if (this.props.onSelectRecord) {
      this.props.onSelectRecord(row, data, tableId);
    }
  }

  handleOnUnselectRecord(row, data, tableId) {
    if (this.props.onUnselectRecord) {
      this.props.onUnselectRecord(row, data, tableId);
    }
  }

  handleOnSelectAllRecords(records, tableId) {
    if (this.props.onSelectAllRecords) {
      this.props.onSelectAllRecords(records, tableId);
    }
  }

  handleOnUnselectAllRecords(tableId) {
    if (this.props.onUnselectAllRecords) {
      this.props.onUnselectAllRecords(tableId);
    }
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

  onClick(event) {
    if (event.target.getAttribute("data-user") === "btnOK") {
      if (this._dataSource.isEmpty()) {
        this.setState({
          ...this.state,
          alertIsOpen: true,
          alertMessage: "Selecione um registro para continuar.",
        });
      } else {
        if (this.props.selectedRecords) {
          if (this.props.selectedRecords.length === 0) {
            this.props.selectedRecords.push(
              this._dataSource.getCurrentRecord()
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

  handleDelete(i) {
    this.props.selectedRecords.splice(i, 1);
    this.setState({ ...this.state, update: Math.random() });
  }

  onClear() {
    this.props.selectedRecords.splice(0, this.props.selectedRecords.length);
    this.setState({ ...this.state, update: Math.random() });
  }

  render() {
    let customLoader: ReactNode = undefined;
    let messageLoading: string | undefined;
    if (this.props.getCustomLoader) {
      customLoader = this.props.getCustomLoader();
    }
    if (this.props.getCustomMessageLoading) {
      messageLoading = this.props.getCustomMessageLoading();
    }
    if (!messageLoading) {
      messageLoading = this.props.messageLoading;
    }

    return (
      <>
        <AnterosAlert
          danger
          fill
          isOpen={this.state.alertIsOpen}
          autoCloseInterval={15000}
          onClose={this.onCloseAlert}
        >
          {this.state.alertMessage}
        </AnterosAlert>
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
          {this.props.withFilter ? (
            <div
              style={{
                display: "flex",
                flexFlow: "row nowrap",
                justifyContent: "space-between",
              }}
            >
              <AnterosQueryBuilder
                zIndex={50}
                id={this.props.filterName}
                formName={this.props.viewName}
                ref={(ref) => (this._filterRef = ref)}
                expandedFilter={this.state.filterExpanded}
                update={this.state.update}
                dataSource={this._dataSourceFilter}
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
                  this._dataSource.getState() !== dataSourceConstants.DS_BROWSE
                }
              >
                {this.props.fieldsFilter}
              </AnterosQueryBuilder>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            ></div>
          )}
          {this.props.children}
          <AnterosDataTable
            id={"table" + this.props.viewName}
            height={"200px"}
            ref={(ref) => (this._tableRef = ref)}
            dataSource={this._dataSource}
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
            {this.props.columns}
          </AnterosDataTable>
          {this.props.isCumulativeSelection ? (
            <div
              style={{ height: "55px", maxHeight: "120px", overflowY: "auto" }}
            >
              <AnterosTags
                addTags={false}
                tags={this.props.selectedRecords}
                labelField={this.props.labelField}
                handleDelete={this.handleDelete}
                allowUnique={true}
                onClear={this.onClear}
              />
            </div>
          ) : null}
        </AnterosBlockUi>
        <FooterActions className="versatil-card-footer">
          <AnterosRow className="row justify-content-start align-items-center">
            <AnterosCol medium={4}>
              <AnterosLabel
                caption={`Total ${
                  this.props.caption
                } ${this._dataSource.getGrandTotalRecords()}`}
              />
            </AnterosCol>
            <AnterosCol medium={7}>
              <AnterosPagination
                horizontalEnd
                dataSource={this._dataSource}
                visiblePages={8}
                onBeforePageChanged={this.onBeforePageChanged}
                onPageChanged={this.handlePageChanged}
              />
            </AnterosCol>
          </AnterosRow>
        </FooterActions>
        <ModalActions>
          {this.props.positionUserActions === PositionUserActions.first
            ? this.props.userActions ?? null
            : null}
          <AnterosButton success dataUser="btnOK" onClick={this.onClick}>
            {this.props.labelButtonOk}
          </AnterosButton>{" "}
          <AnterosButton danger dataUser="btnCancel" onClick={this.onClick}>
            {this.props.labelButtonCancel}
          </AnterosButton>
          {this.props.positionUserActions === PositionUserActions.last
            ? this.props.userActions ?? null
            : null}
        </ModalActions>
      </>
    );
  }
}

export { AnterosSearchTemplate };
