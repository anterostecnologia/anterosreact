import React from 'react';
import { AnterosModal, ModalActions } from 'anteros-react-containers';
import { AnterosRow, AnterosCol } from 'anteros-react-layout';
import { AnterosAlert } from 'anteros-react-notification';
import { AnterosDataTable } from 'anteros-react-table';
import { AnterosButton } from 'anteros-react-buttons';
import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  DATASOURCE_EVENTS,
  dataSourceConstants
} from 'anteros-react-datasource';
import {
  AnterosQueryBuilder,
  AnterosQueryBuilderData,
  AnterosFilterDSL
} from 'anteros-react-querybuilder';
import { AnterosPagination } from 'anteros-react-navigation';
import { connect } from 'react-redux';
import { autoBind, boundClass } from 'anteros-react-core';
import { processErrorMessage, AnterosError } from 'anteros-react-core';

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  messageLoading: 'Carregando, por favor aguarde...',
  withFilter: true
};

export default function WithSearchModalTemplate(_loadingProps) {
  let loadingProps = { ...defaultValues, ..._loadingProps };

  const mapStateToProps = state => {
    let query, sort, activeSortIndex, activeFilter, user;
    let reducer = state[loadingProps.reducerName];
    if (reducer) {
      query = reducer.query;
      sort = reducer.sort;
      activeSortIndex = reducer.activeSortIndex;
      activeFilter = reducer.activeFilter;
    }
    user = state[loadingProps.userReducerName].user;
    return {
      query: query,
      sort: sort,
      activeSortIndex: activeSortIndex,
      activeFilter: activeFilter,
      user: user
    };
  };

  const mapDispatchToProps = dispatch => {
    return {
      setDatasource: dataSource => {
        dispatch(loadingProps.actions.setDatasource(dataSource));
      },
      setFilter: (activeFilter, query, sort, activeSortIndex) => {
        dispatch(
          loadingProps.actions.setFilter(
            activeFilter,
            query,
            sort,
            activeSortIndex
          )
        );
      }
    };
  };

  return WrappedComponent => {
    class SearchModal extends WrappedComponent {
      constructor(props, context) {
        super(props);
        autoBind(this);
        this.filterRef = React.createRef();

        if (!loadingProps.endPoints) {
          throw new AnterosError(
            'Informe o objeto com os endPoints de consulta. '
          );
        }
        if (!loadingProps.resource) {
          throw new AnterosError('Informe o nome do RESOURCE de consulta. ');
        }
        if (!loadingProps.reducerName) {
          throw new AnterosError('Informe o nome do REDUCER. ');
        }
        if (!loadingProps.viewName) {
          throw new AnterosError('Informe o nome da View. ');
        }
        if (!loadingProps.caption) {
          throw new AnterosError('Informe o caption(titulo) da View. ');
        }
        if (loadingProps.withFilter === true && !loadingProps.filterName) {
          throw new AnterosError('Informe o nome do filtro. ');
        }

        if (WrappedComponent.prototype.hasOwnProperty('getColumns') === false) {
          throw new AnterosError('Implemente o método getColumns na classe.');
        }

        if (
          loadingProps.withFilter &&
          WrappedComponent.prototype.hasOwnProperty('getFieldsFilter') === false
        ) {
          throw new AnterosError(
            'Implemente o método getFieldsFilter na classe.'
          );
        }

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

        this.state = {
          dataSource: [],
          alertIsOpen: false,
          alertMessage: '',
          modalOpen: '',
          modalCallback: null
        };

        autoBind(this);
      }
      createDataSourceFilter() {
        this.dsFilter = new AnterosRemoteDatasource();
        AnterosQueryBuilderData.configureDatasource(this.dsFilter);
      }

      getUser(){
        if (this.props.user){
          return this.props.user;
        }
        return undefined;
      }

      createMainDataSource() {
        if (this.props.dataSource) {
          this.dataSource = this.props.dataSource;
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
            this.filterRef.current.getQuickFilterSort(), this.getUser()
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

      componentDidMount() {
        this.openData();
      }

      openData() {
        if (loadingProps.defaultSort) {
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
                  loadingProps.defaultSort, this.getUser()
                )
              );
              this.handlePageChanged(0);
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
          this.dataSource.setAjaxPageConfigHandler(null);
        }
      }

      componentDidUpdate() {
        this.openData();
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
            sort, this.getUser()
          )
        );
      }

      onToggleFilter(opened) {
        this.onResize(
          this.card.getCardBlockWidth(),
          this.card.getCardBlockHeight()
        );
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

      onSelectRecord(event) {
        this.props.selectedRecords.push(this.dataSource.getCurrentRecord());
      }

      onUnSelectRecord(event) {
        for (var i = 0; i < this.props.selectedRecords.length; i++) {
          if (
            this.props.selectedRecords[i] === this.dataSource.getCurrentRecord()
          ) {
            this.props.selectedRecords.splice(i, 1);
          }
        }
      }

      onSelectAllRecords(records) {
        let _this = this;
        this.props.selectedRecords.splice(0, this.props.selectedRecords.length);
        records.forEach(function buscaObjetos(element) {
          _this.props.selectedRecords.push(element);
        });
      }

      onUnSelectAllRecords(event) {
        this.props.selectedRecords.splice(0, this.props.selectedRecords.length);
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
              0,
              loadingProps.pageSize,
              this.filterRef.current.getQuickFilterSort(), this.getUser()
            )
          );
        } else {
          this.dataSource.open(
            loadingProps.endPoints.FIND_ALL(
              loadingProps.resource,
              0,
              loadingProps.pageSize,
              this.filterRef.current.getQuickFilterSort(), this.getUser()
            )
          );
        }
      }

      autoCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: ''
        });
      }

      onClick(event) {
        if (event.target.getAttribute('data-user') === 'btnOK') {
          if (this.dataSource.isEmpty()) {
            this.setState({
              ...this.state,
              alertIsOpen: true,
              alertMessage: 'Selecione um registro para continuar.'
            });
          } else {
            if (this.props.selectedRecords.length === 0) {
              this.props.selectedRecords.push(
                this.dataSource.getCurrentRecord()
              );
            }
            this.props.onClickOk(event, this.props.selectedRecords);
          }
        } else if (event.target.getAttribute('data-user') === 'btnCancel') {
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
        return (
          <AnterosModal
            id={loadingProps.viewName}
            title={loadingProps.caption}
            primary
            semifull
            showHeaderColor={true}
            showContextIcon={false}
            isOpen={this.props.modalOpen === loadingProps.viewName}
            onCloseButton={this.onCloseButton}
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
              {this.positionUserActions === 'first'
                ? this.hasUserActions
                  ? this.getUserActions()
                  : null
                : null}
              <AnterosButton
                id="btnSelecionar"
                icon="fa fa-bolt"
                disabled={
                  this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                }
                warning
                onButtonClick={this.onButtonSearch}
              >
                Selecionar
              </AnterosButton>
              <AnterosButton success dataUser="btnOK" onClick={this.onClick}>
                OK
              </AnterosButton>{' '}
              <AnterosButton danger dataUser="btnCancel" onClick={this.onClick}>
                Fechar
              </AnterosButton>
              {this.positionUserActions === 'last'
                ? this.hasUserActions
                  ? this.getUserActions()
                  : null
                : null}
            </ModalActions>

            <div>
              {loadingProps.withFilter ? (
                <AnterosQueryBuilder
                  query={this.props.query}
                  sort={this.props.sort}
                  ref={this.filterRef}
                  id={loadingProps.filterName}
                  formName={loadingProps.viewName}
                  activeSortIndex={this.props.activeSortIndex}
                  dataSource={this.dsFiltro}
                  activeFilter={this.props.activeFilter}
                  onSaveFilter={this.onSaveFilter}
                  onSelectActiveFilter={this.onSelectActiveFilter}
                  onQueryChange={this.onQueryChange}
                  onSortChange={this.onSortChange}
                  quickFilterWidth="50%"
                  onQuickFilter={this.onQuickFilter}
                  quickFilterText={this.props.quickFilterText}
                  height="170px"
                  allowSort={true}
                  disabled={
                    this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                  }
                  onSearchButtonClick={this.onSearchButtonClick}
                >
                  {this.getFieldsFilter()}
                </AnterosQueryBuilder>
              ) : null}

              <AnterosDataTable
                id={'tb' + loadingProps.viewName}
                height="350px"
                dataSource={this.dataSource}
                width="100%"
                enablePaging={false}
                enableSearching={false}
                showExportButtons={false}
                onSelectRecord={this.onSelectRecord}
                onUnSelectRecord={this.onUnSelectRecord}
                onSelectAllRecords={this.onSelectAllRecords}
                onUnSelectAllRecords={this.onUnSelectAllRecords}
              >
                {this.getColumns()}
              </AnterosDataTable>
              <AnterosRow>
                <AnterosCol medium={12}>
                  <AnterosPagination
                    horizontalEnd
                    dataSource={this.dataSource}
                    visiblePages={3}
                    onPageChanged={this.handlePageChanged}
                  />
                </AnterosCol>
              </AnterosRow>
              <WrappedComponent dataSource={this.dataSource} />
            </div>
          </AnterosModal>
        );
      }
    }

    return connect(
      mapStateToProps,
      mapDispatchToProps
    )(SearchModal);
  };
}
