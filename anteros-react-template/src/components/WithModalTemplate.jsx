import React from 'react';
import { AnterosModal, ModalActions } from '@anterostecnologia/anteros-react-containers';
import { AnterosAlert } from '@anterostecnologia/anteros-react-notification';
import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import {
  AnterosRemoteDatasource,
  dataSourceEvents,
  dataSourceConstants, DATASOURCE_EVENTS
} from '@anterostecnologia/anteros-react-datasource';
import { autoBind,processErrorMessage } from '@anterostecnologia/anteros-react-core';


const defaultValues = {
  withDatasource: false,
  openMainDataSource: false,
  pageSize: 30,
  requireSelectRecord: false,
  fieldsToForceLazy: '',
  modalContentHeight: '',
  modalContentWidth: ''
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
        if (!loadingProps.viewName) {
          throw new AnterosError('Informe o nome da View. ');
        }
        if (!loadingProps.caption) {
          throw new AnterosError('Informe o caption(titulo) da View. ');
        }

        if (loadingProps.withDatasource) {
          if (!loadingProps.resource) {
            throw new AnterosError('Informe o nome do RESOURCE de consulta. ');
          }
          this.createMainDataSource();
        }
        if (WrappedComponent.prototype.hasOwnProperty('getRoutes') && this.getRoutes()) {
          loadingProps.routes = this.getRoutes();
        }

        this.state = {
          alertIsOpen: false,
          alertMessage: '',
          modalOpen: '',
          modalCallback: null,
          selectedRecords: []
        };
      }
      createMainDataSource() {
        if (this.props.dataSource) {
          this.dataSource = this.props.dataSource;
        } else {
          this.dataSource = new AnterosRemoteDatasource();
          this.dataSource.setAjaxPostConfigHandler(entity => {
            return loadingProps.endPoints.post(loadingProps.resource, entity);
          });
          this.dataSource.setValidatePostResponse(response => {
            return response.data !== undefined;
          });
          this.dataSource.setAjaxDeleteConfigHandler(entity => {
            return loadingProps.endPoints.delete(loadingProps.resource, entity);
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
              loadingProps.endPoints.findAll(
                loadingProps.resource,
                0,
                loadingProps.pageSize, loadingProps.fieldsToForceLazy
              )
            );
          }
          if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            this.dataSource.cancel();
          }
        }
        if ( WrappedComponent.prototype.hasOwnProperty('onDidMount') === true) {
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

        if ( WrappedComponent.prototype.hasOwnProperty('onWillUnmount') === true) {
          this.onWillUnmount();
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
          //
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
          if (
            WrappedComponent.prototype.hasOwnProperty('onBeforeOk') === true
          ) {
            if (!this.onBeforeOk()) {
              return;
            }
          }
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
            style={{height:loadingProps.modalContentHeight, width:loadingProps.modalContentWidth}}
            isOpen={this.props.modalOpen === loadingProps.viewName || this.props.isOpen}
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
              <WrappedComponent {...this.props} dataSource={this.dataSource} {...this.props} />
            </div>
          </AnterosModal>
        );
      }
    }

    return Modal;
  };
}
