import React, { Component } from 'react';
import {AnterosButton, AnterosButtonGroup} from "anteros-react-buttons";
import { AnterosEdit } from "anteros-react-editors";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import PropTypes from 'prop-types';


class AnterosDatasourceNavigator extends Component {
    constructor(props) {
        super(props); 
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.buttonFirst = this.buttonFirst.bind(this);
        this.buttonPrevious = this.buttonPrevious.bind(this);
        this.buttonNext = this.buttonNext.bind(this);
        this.buttonLast = this.buttonLast.bind(this);
        this.buttonInsert = this.buttonInsert.bind(this);
        this.buttonEdit = this.buttonEdit.bind(this);
        this.buttonDelete = this.buttonDelete.bind(this);
        this.buttonPost = this.buttonPost.bind(this);
        this.buttonCancel = this.buttonCancel.bind(this);
        this.state = { update: Math.random() };
    }

    componentDidMount() {
        this.props.dataSource.addEventListener([dataSourceEvents.BEFORE_OPEN,
        dataSourceEvents.AFTER_OPEN,
        dataSourceEvents.AFTER_EDIT,
        dataSourceEvents.AFTER_INSERT,
        dataSourceEvents.AFTER_DELETE,
        dataSourceEvents.BEFORE_CLOSE,
        dataSourceEvents.AFTER_CLOSE,
        dataSourceEvents.ON_ERROR,
        dataSourceEvents.BEFORE_GOTO_PAGE,
        dataSourceEvents.AFTER_SCROLL,
        dataSourceEvents.AFTER_CANCEL,
        dataSourceEvents.AFTER_POST,
        dataSourceEvents.AFTER_GOTO_PAGE], this.onDatasourceEvent);
    }

    componentWillUnmount() {
        this.props.dataSource.removeEventListener([dataSourceEvents.BEFORE_OPEN,
        dataSourceEvents.AFTER_OPEN,
        dataSourceEvents.AFTER_EDIT,
        dataSourceEvents.AFTER_INSERT,
        dataSourceEvents.AFTER_DELETE,
        dataSourceEvents.BEFORE_CLOSE,
        dataSourceEvents.AFTER_CLOSE,
        dataSourceEvents.ON_ERROR,
        dataSourceEvents.BEFORE_GOTO_PAGE,
        dataSourceEvents.AFTER_SCROLL,
        dataSourceEvents.AFTER_CANCEL,
        dataSourceEvents.AFTER_POST,
        dataSourceEvents.AFTER_GOTO_PAGE], this.onDatasourceEvent);
    }

    onDatasourceEvent(event) {
        this.setState({ update: Math.random() });
    }

    buttonFirst(event) {
        try {
            this.props.dataSource.first();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'first');
            }
        }
    }
    buttonPrevious(event) {
        try {
            this.props.dataSource.previous();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'previous');
            }
        }
    }
    buttonNext(event) {        
        try {
            this.props.dataSource.next();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'next');
            }
        }
    }
    buttonLast(event) {
        try {
            this.props.dataSource.last();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'last');
            }
        }
    }
    buttonInsert(event) {        
        try {
            this.props.dataSource.insert();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'insert');
            }
        }
    }
    buttonEdit(event) {        
        try {
            this.props.dataSource.edit();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'edit');
            }
        }
    }
    buttonDelete(event) {
        try {
            this.props.dataSource.delete();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'delete');
            }
        }
    }

    buttonPost(event) {
        try {
            this.props.dataSource.post();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'delete');
            }
        }
    }
    buttonCancel(event) {
        try {
            this.props.dataSource.cancel();
        }
        catch (err) {
            if (this.props.onError) {
                this.props.onError(err, 'delete');
            }
        }        
    }

    render() {
        let status = 'Consultando';
        if (this.props.dataSource.getState() == 'dsEdit')
            status = 'Editando';
        else if (this.props.dataSource.getState() == 'dsInsert')
            status = 'Inserindo';

        return (<div>
            <AnterosButtonGroup>
                <AnterosButton onButtonClick={this.buttonFirst} primary icon="fa fa-step-backward" hint="Primeiro registro" disabled={this.props.dataSource.isEmpty() || this.props.dataSource.isFirst() || this.props.dataSource.getState() != 'dsBrowse'} />
                <AnterosButton onButtonClick={this.buttonPrevious} primary icon="fa fa-backward" hint="Registro anterior" disabled={!this.props.dataSource.hasPrevious() || this.props.dataSource.getState() != 'dsBrowse'} />
                <AnterosButton onButtonClick={this.buttonNext} primary icon="fa fa-forward" hint="Próximo registro" disabled={!this.props.dataSource.hasNext() || this.props.dataSource.getState() != 'dsBrowse'} />
                <AnterosButton onButtonClick={this.buttonLast} primary icon="fa fa-step-forward" hint="Último registro" disabled={this.props.dataSource.isEmpty() || this.props.dataSource.isLast() || this.props.dataSource.getState() != 'dsBrowse'} />
                <AnterosEdit style={{ textAlign: "center" }} width="70px" value={this.props.dataSource.isEmpty() ? '0/0' : this.props.dataSource.getRecno() + "/" + this.props.dataSource.getTotalRecords()} readOnly={true} />
                <AnterosEdit style={{ textAlign: "center" }} value={status} readOnly={true} width="100px" />
                {this.props.showEditButtons ?
                    <div><AnterosButton onButtonClick={this.buttonInsert} warning icon="fa fa-file" hint="Inserir" disabled={this.props.dataSource.getState() != 'dsBrowse' || !this.props.dataSource.isOpen()} />
                        <AnterosButton onButtonClick={this.buttonEdit} warning icon="fa fa-pencil" hint="Editar" disabled={this.props.dataSource.isEmpty() || this.props.dataSource.getState() != 'dsBrowse'} />
                        <AnterosButton onButtonClick={this.buttonDelete} warning icon="fa fa-trash" hint="Remover" disabled={this.props.dataSource.isEmpty() || this.props.dataSource.getState() != 'dsBrowse'} />
                        <AnterosButton onButtonClick={this.buttonPost} success icon="fa fa-check" hint="Salvar" disabled={this.props.dataSource.getState() == 'dsBrowse'} />
                        <AnterosButton onButtonClick={this.buttonCancel} danger icon="fa fa-ban" hint="Cancelar" disabled={this.props.dataSource.getState() == 'dsBrowse'} />
                    </div>
                    : null}
            </AnterosButtonGroup>
        </div>);
    }
}

AnterosDatasourceNavigator.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]).isRequired,
    showEditButtons: PropTypes.bool.isRequired,
    onError: PropTypes.func
}

AnterosDatasourceNavigator.defaultProps = {
    showEditButtons: true
}


export default AnterosDatasourceNavigator;