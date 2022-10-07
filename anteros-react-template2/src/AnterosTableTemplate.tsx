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
  AnterosSweetAlert,
  autoBind,
  processErrorMessage,
  AnterosResizeDetector,
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
import { AnterosLabel } from "@anterostecnologia/anteros-react-label";
import shallowCompare from "react-addons-shallow-compare";
import { noop } from "lodash";
import {
  UserData,
  IAnterosRemoteResource,
  AnterosEntity,
} from "@anterostecnologia/anteros-react-api2";
import { RouteComponentProps } from "react-router";

interface AnterosTableTemplateProps<T extends AnterosEntity, TypeID> {
  caption: string;
  openDataSourceFilter: boolean;
  openMainDataSource: boolean;
  dataSource: AnterosDatasource | undefined;
  messageLoading: string;
  withFilter: boolean;
  fieldsToForceLazy: string;
  defaultSortFields: string;
  filterName: string;
  version: string;
  viewName: string;
  user: UserData;
  pageSize: number;
  currentFilter: any;
  needRefresh: boolean;
  columns: ReactNode | undefined;
  routes: any;
  fieldsFilter: ReactNode | undefined;
  userActions?: ReactNode | undefined;
  positionUserActions?: string | undefined;
  remoteResource?: IAnterosRemoteResource<T, TypeID>;
  labelButtonAdd: string;
  labelButtonEdit: string;
  labelButtonRemove: string;
  labelButtonSelect: string;
  labelButtonView: string;
  allowRemove: boolean;
  alertIsOpen: boolean;
  alertMessage: string | undefined;
  loading: boolean;
  setDatasource(dataSource: AnterosDatasource): void;
  setFilter(filter: any, activeFilterIndex: number): void;
  hideTour(): void;
  getModals?(): ReactNode;
  history: RouteComponentProps["history"];
  activeFilterIndex: number;
  onButtonClick?: Function;
  onDidMount?(): void;
  onWillUnmount?(): void;
  onBeforeInsert?(): void;
  onBeforePost?(): boolean;
  onAfterInsert?(): void;
  onBeforeEdit?(): boolean;
  onBeforeRemove?(): boolean;
  onCustomCreateDatasource?(): AnterosDatasource;
  onCustomActionView?(route: string): boolean;
  onCustomActionAdd?(route: string): boolean;
  onCustomActionEdit?(router: string): boolean;
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

class AnterosTableTemplate<T extends AnterosEntity, TypeID> extends Component<
  AnterosTableTemplateProps<T, TypeID>,
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
    labelButtonAdd: "Adicionar",
    labelButtonEdit: "Editar",
    labelButtonRemove: "Remover",
    labelButtonSelect: "Selecionar",
    labelButtonView: "Visualizar",
    positionUserActions: "first",
    userActions: undefined,
    allowRemove: true,
    alertIsOpen: false,
    alertMessage: undefined,
    loading: false,
  };

  constructor(props: AnterosTableTemplateProps<T, TypeID>) {
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
    props: AnterosTableTemplateProps<T, TypeID>
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

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.state,
      alertIsOpen: nextProps.alertIsOpen,
      alertMessage: nextProps.alertMessage,
      loading: nextProps.loading,
    });
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

    if (event === dataSourceEvents.BEFORE_POST) {
      if (this.props.onBeforePost) {
        this.props.onBeforePost();
      }
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

    if (event === dataSourceEvents.AFTER_INSERT) {
      if (this.props.onAfterInsert) {
        this.props.onAfterInsert();
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

  onButtonClick(event: any, button: AnterosButton) {
    if (button.props.id === "btnView") {
      if (this.props.onCustomActionView) {
        if (this.props.onCustomActionView(button.props.route)) {
          return;
        }
      }
    } else if (button.props.id === "btnAdd") {
      if (this.props.onCustomActionAdd) {
        if (this.props.onCustomActionAdd(button.props.route)) {
          return;
        }
      }
      if (this.props.onBeforeInsert) {
        this.props.onBeforeInsert();
      }
      if (!this._dataSource.isOpen()) this._dataSource.open();
      this._dataSource.insert();
    } else if (button.props.id === "btnEdit") {
      if (this.props.onCustomActionEdit) {
        if (this.props.onCustomActionEdit(button.props.route)) {
          return;
        }
      }
      if (this.props.onBeforeEdit) {
        if (!this.props.onBeforeEdit()) {
          return;
        }
      }
      this._dataSource.edit();
    } else if (button.props.id === "btnRemove") {
      if (this.props.onBeforeRemove) {
        if (!this.props.onBeforeRemove()) {
          return;
        }
      }
      AnterosSweetAlert({
        title: "Deseja remover ?",
        text: "",
        type: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        focusCancel: true,
      })
        .then(() => {
          this._dataSource.delete((error) => {
            if (error) {
              this.setState({
                ...this.state,
                alertIsOpen: true,
                update: Math.random(),
                alertMessage: processErrorMessage(error),
              });
            }
          });
        })
        .catch((_error) => {});
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

  onResize(width, height) {
    let newHeight = height - 120;
    if (this._tableRef) {
      this._tableRef.resize("100%", newHeight);
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
    let modals: ReactNode = undefined;
    if (this.props.getModals) {
      modals = this.props.getModals();
    }
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
      <Fragment>
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
              <div
                style={{
                  width: "calc(100%)",
                }}
              >
                <UserActions
                  dataSource={this._dataSource}
                  onButtonClick={this.onButtonClick}
                  routes={this.props.routes}
                  allowRemove={this.props.allowRemove}
                  labelButtonAdd={this.props.labelButtonAdd}
                  labelButtonEdit={this.props.labelButtonEdit}
                  labelButtonRemove={this.props.labelButtonRemove}
                  labelButtonSelect={this.props.labelButtonSelect}
                  labelButtonView={this.props.labelButtonView}
                  positionUserActions={
                    this.props.positionUserActions
                      ? this.props.positionUserActions
                      : "first"
                  }
                  userActions={this.props.userActions}
                />
              </div>
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
            >
              <UserActions
                dataSource={this._dataSource}
                onButtonClick={this.onButtonClick}
                routes={this.props.routes}
                allowRemove={this.props.allowRemove}
                labelButtonAdd={this.props.labelButtonAdd}
                labelButtonEdit={this.props.labelButtonEdit}
                labelButtonRemove={this.props.labelButtonRemove}
                labelButtonSelect={this.props.labelButtonSelect}
                labelButtonView={this.props.labelButtonView}
                positionUserActions={
                  this.props.positionUserActions
                    ? this.props.positionUserActions
                    : "first"
                }
                userActions={this.props.userActions}
              />
            </div>
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
        {modals}
      </Fragment>
    );
  }
}

interface UserActionsProps {
  positionUserActions: string;
  userActions: ReactNode | undefined;
  labelButtonEdit: string | undefined;
  labelButtonView: string | undefined;
  onButtonClick: Function;
  dataSource: AnterosDatasource;
  routes: any;
  labelButtonAdd: string | undefined;
  allowRemove: boolean;
  labelButtonRemove: string | undefined;
  labelButtonSelect: string | undefined;
}

class UserActions extends Component<UserActionsProps> {
  private getLabelButtonEdit() {
    return this.props.labelButtonEdit ? this.props.labelButtonEdit : "Editar";
  }

  private getLabelButtonRemove() {
    return this.props.labelButtonRemove
      ? this.props.labelButtonRemove
      : "Remover";
  }

  private getLabelButtonAdd() {
    return this.props.labelButtonAdd ? this.props.labelButtonAdd : "Adicionar";
  }

  private getLabelButtonView() {
    return this.props.labelButtonView
      ? this.props.labelButtonView
      : "Visualizar";
  }

  render(): ReactNode {
    return (
      <div style={{ display: "flex" }}>
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
            caption={this.getLabelButtonView()}
            hint={this.getLabelButtonView()}
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
            caption={this.getLabelButtonAdd()}
            hint={this.getLabelButtonAdd()}
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
            caption={this.getLabelButtonEdit()}
            hint={this.getLabelButtonEdit()}
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
            caption={this.getLabelButtonRemove()}
            hint={this.getLabelButtonRemove()}
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

export { AnterosTableTemplate };
