import React from 'react';
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
import { AnterosQueryBuilder } from 'anteros-react-querybuilder';
import { AnterosCol, AnterosRow } from 'anteros-react-layout';
import { AnterosLabel } from 'anteros-react-label';
import { AnterosPagination } from 'anteros-react-navigation';
import { AnterosMasonry } from 'anteros-react-masonry';

const defaultValues = {
  openDataSourceFilter: true,
  openMainDataSource: true,
  messageLoading: 'Carregando, por favor aguarde...',
  withFilter: true
};

export default function WithMasonryContainerTemplate(_loadingProps) {
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
          WrappedComponent.prototype.hasOwnProperty('getViewItem') === false
        ) {
          throw new AnterosError(
            'Implemente o método getViewItem na classe ' + WrappedComponent.type
          );
        }

        if (
          WrappedComponent.prototype.hasOwnProperty('getUserActions') === false
        ) {
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
        this.createDataSourceFilter();
        this.createMainDataSource();

        this.state = {
          alertIsOpen: false,
          alertMessage: '',
          modalOpen: null,
          update: Math.random(),
          idRecord: 0,
          contentHeight: '540px',
          selectedItem: undefined,
          loading: false
        };
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
                this.filter.getQuickFilterSort(),
                this.getUser()
              )
            );
          }
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.dataSource.cancel();
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
            sort,
            this.getUser()
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
        let newHeight = height - this.filter.divFilter.clientHeight;
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
      }

      onSelectedItem(item) {
        this.setState({
          ...this.state,
          selectedItem:
            this.state.selectedItem && item.id === this.state.selectedItem.id
              ? null
              : item
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
          if (!this.dataSource.isOpen()) this.dataSource.open();
          this.dataSource.insert();
        } else if (button.props.id === 'btnEdit') {
          this.dataSource.locate({ id: button.props.idRecord });
          this.dataSource.edit();
        } else if (button.props.id === 'btnRemove') {
          this.dataSource.locate({ id: button.props.idRecord });
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
            loadingProps.pageSize, this.getUser()
          );
        } else {
          if (
            this.filter.getQuickFilterText() &&
            this.filter.getQuickFilterText() !== ''
          ) {
            return loadingProps.endPoints.FIND_MULTIPLE_FIELDS(
              loadingProps.resource,
              this.props.quickFilterText,
              this.filter.getQuickFilterFields(),
              page,
              loadingProps.pageSize,
              this.filter.getQuickFilterSort(), this.getUser()
            );
          } else {
            return loadingProps.endPoints.FIND_ALL(
              loadingProps.resource,
              page,
              loadingProps.pageSize,
              this.filter.getQuickFilterSort(), this.getUser()
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
              0,
              this.getUser()
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
              loadingProps.pageSize, this.getUser()
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

      render() {
        let ViewItem = this.getViewItem();
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
              <AnterosQueryBuilder
                query={this.props.query}
                sort={this.props.sort}
                id={loadingProps.filtroDispositivos}
                formName={loadingProps.viewName}
                ref={ref => (this.filter = ref)}
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
                height="170px"
                allowSort={true}
                disabled={
                  this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                }
                onSearchButtonClick={this.onSearchButtonClick}
              >
                {this.getPositionUserActions() === 'first'
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
                    this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                  }
                />
                <AnterosButton
                  id="btnSelect"
                  icon="fal fa-bolt"
                  disabled={
                    this.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                  }
                  small
                  caption="Selecionar"
                  className="versatil-btn-selecionar"
                  onButtonClick={this.onButtonSearch}
                />{' '}
                {this.getPositionUserActions() === 'last'
                  ? this.getUserActions()
                  : null}
                {this.getFieldsFilter()}
              </AnterosQueryBuilder>

              <div
                style={{
                  height: this.state.contentHeight,
                  overflow: 'auto'
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
                >
                  {!this.dataSource.isEmpty()
                    ? this.dataSource.getData().map(r => {
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
