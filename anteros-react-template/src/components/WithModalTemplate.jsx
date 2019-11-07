import React, { Component } from 'react';
import { AnterosModal, ModalActions } from 'anteros-react-containers';
import { AnterosAlert } from 'anteros-react-notification';
import { AnterosButton } from 'anteros-react-buttons';
import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  DATASOURCE_EVENTS,
  dataSourceConstants
} from 'anteros-react-datasource';
import { connect } from 'react-redux';
import { autoBind } from 'anteros-react-core';
import { processErrorMessage } from 'anteros-react-core';

const defaultValues = {
  withDatasource: false,
  openMainDataSource: false,
  pageSize: 30,
  requireSelectRecord: false
};

export default function WithModalTemplate(_loadingProps) {
  let loadingProps = { ...defaultValues, ..._loadingProps };

  return WrappedComponent => {
    class Modal extends WrappedComponent {
      constructor(props) {
        super(props);
        autoBind(this);

        if (!loadingProps.endPoints) {
          throw new AnterosError(
            'Informe o objeto com os endPoints de consulta. '
          );
        }
        if (!loadingProps.resource) {
          throw new AnterosError('Informe o nome do RESOURCE de consulta. ');
        }
        if (!loadingProps.viewName) {
          throw new AnterosError('Informe o nome da View. ');
        }
        if (!loadingProps.caption) {
          throw new AnterosError('Informe o caption(titulo) da View. ');
        }

        if (loadingProps.withDatasource) {
          this.createMainDataSource();
        }

        this.state = {
          alertIsOpen: false,
          alertMessage: '',
          modalOpen: '',
          modalCallback: null,
          selectedRecords: []
        };
      }

      getOwnerId(){
        if (this.props.user.owner){
          return this.props.user.owner.id;
        }
        return undefined;
      }

      createMainDataSource() {
        if (this.props.dataSource) {
          this.dataSource = this.props.dataSource;
        } else {
          this.dataSource = new AnterosRemoteDatasource();
          this.dataSource.setAjaxPostConfigHandler(entity => {
            return loadingProps.endPoints.POST(loadingProps.resource, entity, this.getOwnerId());
          });
          this.dataSource.setValidatePostResponse(response => {
            return response.data !== undefined;
          });
          this.dataSource.setAjaxDeleteConfigHandler(entity => {
            return loadingProps.endPoints.DELETE(loadingProps.resource, entity, this.getOwnerId());
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
        if (loadingProps.withDatasource && loadingProps.openMainDataSource) {
          if (!this.dataSource.isOpen()) {
            this.dataSource.open(
              loadingProps.endPoints.FIND_ALL(
                loadingProps.resource,
                0,
                loadingProps.pageSize, this.getOwnerId()
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

      autoCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: ''
        });
      }

      onClick(event) {
        if (event.target.getAttribute('data-user') === 'btnOK') {
          if (loadingProps.requireSelectRecord === false) {
            this.props.onClickOk(event, this.props.selectedRecords);
          } else {
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
          }
        } else if (event.target.getAttribute('data-user') === 'btnCancel') {
          this.props.onClickCancel(event);
        }
      }

      render() {
        return (
          <AnterosModal
            id={'modal' + loadingProps.viewName}
            title={loadingProps.caption}
            primary
            large
            showHeaderColor={true}
            showContextIcon={false}
            isOpen={this.props.modalOpen === loadingProps.viewName}
            onClose={this.onClose}
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
              <AnterosButton success dataUser="btnOK" onClick={this.onClick}>
                OK
              </AnterosButton>{' '}
              <AnterosButton danger dataUser="btnCancel" onClick={this.onClick}>
                Cancela
              </AnterosButton>
            </ModalActions>

            <div>
              <WrappedComponent dataSource={this.dataSource} />
            </div>
          </AnterosModal>
        );
      }
    }

    return connect(
      mapStateToProps,
      mapDispatchToProps
    )(Modal);
  };
}
