import React from 'react';
import { AnterosSweetAlert, AnterosError } from 'anteros-react-core';
import {
  AnterosCard,
  HeaderActions,
  AnterosForm
} from 'anteros-react-containers';
import { AnterosAlert } from 'anteros-react-notification';
import { AnterosButton } from 'anteros-react-buttons';
import { connect } from 'react-redux';
import { processErrorMessage } from 'anteros-react-core';
import { dataSourceConstants } from 'anteros-react-datasource';
import { autoBind } from 'anteros-react-core';
import { AnterosBlockUi } from 'anteros-react-loaders';
import { AnterosLoader } from 'anteros-react-loaders';

const defaultValues = { messageSaving: 'Aguarde... salvando.' };

export default function WithFormTemplate(_loadingProps) {
  let loadingProps = { ...defaultValues, ..._loadingProps };

  const mapStateToProps = state => {
    let user;
    user = state[loadingProps.userReducerName].user
    return {
      dataSource: state[loadingProps.reducerName].dataSource,
      user: user
    };
  };

  const mapDispatchToProps = dispatch => {
    return {
      setDatasource: dataSource => {
        dispatch(loadingProps.actions.setDatasource(dataSource));
      }
    };
  };

  return WrappedComponent => {
    class FormView extends WrappedComponent {
      constructor(props, context) {
        super(props);
        autoBind(this);

        if (!loadingProps.endPoints) {
          throw new AnterosError(
            'Informe o objeto com os endPoints de consulta.'
          );
        }
        if (!loadingProps.resource) {
          throw new AnterosError('Informe o nome do RESOURCE de consulta. ');
        }
        if (!loadingProps.reducerName) {
          throw new AnterosError('Informe o nome do REDUCER. ');
        }
        if (!loadingProps.userReducerName) {
          throw new AnterosError('Informe o nome do REDUCER de Usuários. ');
        }
        if (!loadingProps.actions) {
          throw new AnterosError(
            'Informe o objeto com as actions do REDUCER. '
          );
        }
        if (!loadingProps.formName) {
          throw new AnterosError('Informe o nome do Form. ');
        }
        if (!loadingProps.caption) {
          throw new AnterosError('Informe o caption(titulo) da Form. ');
        }
        if (!loadingProps.routes) {
          throw new AnterosError('Informe as rotas das ações. ');
        }

        if (WrappedComponent.prototype.hasOwnProperty('getRoutes') && this.getRoutes()) {
          loadingProps.routes = this.getRoutes();
        }

        this.state = {
          alertIsOpen: false,
          alertMessage: '',
          saving: false
        };
      }

      onButtonClick(event, button) {
        let _this = this;

        if (button.props.id === 'btnClose') {
          if (
            WrappedComponent.prototype.hasOwnProperty('onBeforeClose') === true
          ) {
            if (!this.onBeforeClose()) {
              return;
            }
          }
          if (
            this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
          ) {
            this.props.dataSource.cancel();
          }
          this.props.history.push(button.props.route);
        } else if (button.props.id === 'btnSave') {
          if (
            WrappedComponent.prototype.hasOwnProperty('onBeforeSave') === true
          ) {
            if (!this.onBeforeSave()) {
              return;
            }
          }
          AnterosSweetAlert({
            title: 'Deseja salvar ?',
            text: '',
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            focusCancel: false
          })
            .then(function() {
              _this.setState({
                ..._this.state,
                saving: true
              });
              _this.props.dataSource.post(error => {
                if (error) {
                  var result = processErrorMessage(error);
                  _this.setState({
                    ..._this.state,
                    alertIsOpen: true,
                    alertMessage: result,
                    saving: false
                  });
                } else {
                  if (
                    WrappedComponent.prototype.hasOwnProperty('onAfterSave') ===
                    true
                  ) {
                    if (!_this.onAfterSave()) {
                      return;
                    }
                  }
                  _this.setState({
                    ..._this.state,
                    alertIsOpen: false,
                    alertMessage: '',
                    saving: false
                  });
                  _this.props.history.push(button.props.route);
                }
              });
            })
            .catch(function(reason) {
              // quando apertar o botao "cancelar" cai aqui. Apenas ignora. (sem processamento necessario)
            });
        } else if (button.props.id === 'btnCancel') {
          if (
            WrappedComponent.prototype.hasOwnProperty('onBeforeCancel') === true
          ) {
            if (!this.onBeforeCancel()) {
              return;
            }
          }
          AnterosSweetAlert({
            title: 'Deseja cancelar ?',
            text: '',
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            focusCancel: true
          })
            .then(function(isConfirm) {
              if (isConfirm) {
                if (
                  _this.props.dataSource.getState() !==
                  dataSourceConstants.DS_BROWSE
                ) {
                  _this.props.dataSource.cancel();
                }
                if (
                  WrappedComponent.prototype.hasOwnProperty('onAfterCancel') ===
                  true
                ) {
                  if (!_this.onAfterCancel()) {
                    return;
                  }
                }
                _this.props.history.push(button.props.route);
              }
              return;
            })
            .catch(function(reason) {
              // quando apertar o botao "cancelar" cai aqui. Apenas ignora. (sem processamento necessario)
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

      onCloseAlert() {
        this.setState({
          ...this.state,
          alertIsOpen: false,
          alertMessage: ''
        });
      }

      render() {
        return (
          <AnterosCard
            caption={loadingProps.caption}
            height=""
            withScroll
            className="versatil-card-full"
          >
            <HeaderActions>
              <AnterosButton
                id="btnClose"
                icon="fa fa-times"
                route={loadingProps.routes.close}
                small
                secondary
                circle
                onButtonClick={this.onButtonClick}
              />
            </HeaderActions>
            <AnterosAlert
              danger
              fill
              isOpen={this.state.alertIsOpen}
              autoCloseInterval={25000}
              onClose={this.onCloseAlert}
            >
              {this.state.alertMessage}
            </AnterosAlert>
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
              blocking={this.state.saving}
              message={loadingProps.messageSaving}
              loader={
                <AnterosLoader active type="ball-pulse" color="#02a17c" />
              }
            >
              <AnterosForm id={loadingProps.formName}>
                <WrappedComponent
                  dataSource={this.props.dataSource}
                  loadingProps={loadingProps}
                  onButtonClick={this.onButtonClick}
                />
              </AnterosForm>
            </AnterosBlockUi>
          </AnterosCard>
        );
      }
    }

    return connect(
      mapStateToProps,
      mapDispatchToProps
    )(FormView);
  };
}
