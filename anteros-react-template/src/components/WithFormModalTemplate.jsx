import React, { Component, Fragment } from 'react';
import { AnterosModal, ModalActions } from '@anterostecnologia/anteros-react-containers';
import { AnterosAlert } from '@anterostecnologia/anteros-react-notification';
import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import {
    AnterosRemoteDatasource,
    dataSourceEvents,
    dataSourceConstants, DATASOURCE_EVENTS
} from '@anterostecnologia/anteros-react-datasource';
import { autoBind } from '@anterostecnologia/anteros-react-core';
import { processErrorMessage, processDetailErrorMessage, AnterosSweetAlert } from '@anterostecnologia/anteros-react-core';

const defaultValues = {
    withInternalDatasource: false,
    openMainDataSource: false,
    pageSize: 30,
    requireSelectRecord: false,
    fieldsToForceLazy: '',
    modalSize: 'large',
    modalContentHeight: '',
    modalContentWidth: ''
};

export default function WithFormModalTemplate(_loadingProps) {
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

                if (loadingProps.withInternalDatasource) {
                    if (!loadingProps.resource) {
                        throw new AnterosError('Informe o nome do RESOURCE de consulta. ');
                    }
                    this.createMainDataSource();
                } else {
                    if (this.props.dataSource) {
                        this.dataSource = this.props.dataSource;
                    }
                }

                if (WrappedComponent.prototype.hasOwnProperty('getRoutes') && this.getRoutes()) {
                    loadingProps.routes = this.getRoutes();
                }

                this.state = {
                    alertIsOpen: false,
                    saving: false,
                    alertMessage: '',
                    detailMessage: undefined,
                    modalOpen: '',
                    modalCallback: null
                };
            }
            createMainDataSource() {
                this.dataSource = new AnterosRemoteDatasource();
                this.dataSource.setAjaxPostConfigHandler(entity => {
                    return loadingProps.endPoints.POST(loadingProps.resource, entity);
                });
                this.dataSource.setValidatePostResponse(response => {
                    return response.data !== undefined;
                });
                this.dataSource.setAjaxDeleteConfigHandler(entity => {
                    return loadingProps.endPoints.DELETE(loadingProps.resource, entity);
                });
                this.dataSource.setValidateDeleteResponse(response => {
                    return response.data !== undefined;
                });


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
                                loadingProps.pageSize, loadingProps.fieldsToForceLazy
                            )
                        );
                    }
                    if (this.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                        this.dataSource.cancel();
                    }
                }

                if (WrappedComponent.prototype.hasOwnProperty('onDidMount') === true) {
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
                if (WrappedComponent.prototype.hasOwnProperty('onWillUnmount') === true) {
                    this.onWillUnmount();
                }
            }

            convertMessage(alertMessage) {
                if (alertMessage.constructor === Array) {
                    let result = [];
                    alertMessage.forEach((item, index) => {
                        result.push(<span style={{
                            whiteSpace: "pre"
                        }} key={index}>{item + "\n"}</span>);
                    });
                    return result;
                } else {
                    return alertMessage;
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
                        var result = this.convertMessage(processErrorMessage(error));
                        var debugMessage = processDetailErrorMessage(error);
                        this.setState({
                            ...this.state,
                            alertIsOpen: true,
                            loading: false,
                            debugMessage: (debugMessage === "" ? undefined : debugMessage),
                            alertMessage: result
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

            getButtons() {
                if (WrappedComponent.prototype.hasOwnProperty('getCustomButtons') === true) {
                    return this.getCustomButtons();
                } else {
                    return (<Fragment>
                        {this.dataSource.getState() !== 'dsBrowse' ? <AnterosButton success id="btnOK" onClick={this.onClick} disabled={this.state.saving}>
                            OK
                        </AnterosButton> : null}{' '}
                        <AnterosButton danger id="btnCancel" onClick={this.onClick} disabled={this.state.saving}>
                            Cancela
                        </AnterosButton>
                    </Fragment>);
                }
            }

            onClick(event, button) {
                let _this = this;
                if (button.props.id === "btnOK") {
                    _this.setState({ ..._this.state, saving: true });
                    if (
                        WrappedComponent.prototype.hasOwnProperty('onBeforeOk') === true
                    ) {
                        let result = _this.onBeforeOk(event);
                        if (result instanceof Promise) {
                            result.then(function (response) {
                                _this.setState({ ..._this.state, alertIsOpen: false, alertMessage: '', saving: false });
                                if (_this.dataSource && _this.dataSource.getState() != dataSourceConstants.DS_BROWSE) {
                                    if (!error) {
                                        if (
                                            WrappedComponent.prototype.hasOwnProperty('onAfterSave') ===
                                            true
                                        ) {
                                            if (!_this.onAfterSave()) {
                                                return;
                                            }
                                        }
                                        _this.props.onClickOk(event, _this.props.selectedRecords);
                                    }
                                }
                            }).catch(function (error) {
                                _this.setState({ ..._this.state, alertIsOpen: true, alertMessage: processErrorMessage(error), saving: false });
                            });
                        } else if (result) {
                            if (this.dataSource && this.dataSource.getState() != dataSourceConstants.DS_BROWSE) {
                                this.dataSource.post(error => {
                                    if (!error) {
                                        if (
                                            WrappedComponent.prototype.hasOwnProperty('onAfterSave') ===
                                            true
                                        ) {
                                            if (!_this.onAfterSave()) {
                                                return;
                                            }
                                        }
                                        _this.props.onClickOk(event, _this.props.selectedRecords);
                                    }
                                });
                            }
                        }
                    } else {
                        if (this.dataSource && this.dataSource.getState() != dataSourceConstants.DS_BROWSE) {
                            this.dataSource.post(error => {
                                if (!error) {
                                    if (
                                        WrappedComponent.prototype.hasOwnProperty('onAfterSave') ===
                                        true
                                    ) {
                                        if (!_this.onAfterSave()) {
                                            return;
                                        }
                                    }
                                    _this.props.onClickOk(event, _this.props.selectedRecords);
                                }
                            });
                        }
                    }
                } else if (button.props.id == "btnCancel") {
                    if (this.dataSource && this.dataSource.getState() !== 'dsBrowse') {
                        this.dataSource.cancel();
                    }
                    this.props.onClickCancel(event);
                }
            }

            onDetailClick(event, button) {
                if (this.state.debugMessage) {
                    AnterosSweetAlert({
                        title: 'Detalhes do erro',
                        html: '<b>' + this.state.debugMessage + '</b>'
                    });
                }
            }

            render() {
                let modalSize = {};
                if (loadingProps.modalSize === "extrasmall") {
                    modalSize = { extraSmall: true }
                } else if (loadingProps.modalSize === "small") {
                    modalSize = { small: true }
                } else if (loadingProps.modalSize === "medium") {
                    modalSize = { medium: true }
                } else if (loadingProps.modalSize === "large") {
                    modalSize = { large: true }
                } else if (loadingProps.modalSize === "semifull") {
                    modalSize = { semifull: true }
                } else if (loadingProps.modalSize === "full") {
                    modalSize = { full: true }
                }

                return (
                    <AnterosModal
                        id={'modal' + loadingProps.viewName}
                        title={loadingProps.caption}
                        primary
                        {...modalSize}
                        showHeaderColor={true}
                        showContextIcon={false}
                        style={{ height: loadingProps.modalContentHeight, width: loadingProps.modalContentWidth }}
                        isOpen={this.props.modalOpen === loadingProps.viewName}
                        onClose={this.onClose}
                    >
                        <AnterosAlert
                            danger
                            fill
                            isOpen={this.state.alertIsOpen}
                            autoCloseInterval={15000}
                        >{this.state.debugMessage ?
                            <div>
                                {this.state.debugMessage ? <AnterosButton id="dtnDetail" circle small icon="far fa-align-justify" onButtonClick={this.onDetailClick} /> : null}
                                {this.state.alertMessage}
                            </div> : this.state.alertMessage}</AnterosAlert>
                        <ModalActions>
                            {this.getButtons()}
                        </ModalActions>
                        <div>
                            <WrappedComponent {...this.props} dataSource={this.dataSource} ownerTemplate={this} />
                        </div>
                    </AnterosModal>
                );
            }
        }

        return Modal;
    };
}
