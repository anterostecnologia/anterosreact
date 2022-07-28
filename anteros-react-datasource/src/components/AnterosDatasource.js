import {
    AnterosJacksonParser,
    AnterosUtils,
    AnterosDateUtils,
    AnterosDatasourceError,
    Anteros,
    AnterosObjectUtils
} from '@anterostecnologia/anteros-react-core';
import remoteApi from './AnterosDatasourceApiAdapter';

import {
    cloneDeep
} from 'lodash';
import React from 'react';

const dataSourceConstants = {
    DS_BROWSE: 'dsBrowse',
    DS_INSERT: 'dsInsert',
    DS_EDIT: 'dsEdit'
};

const dataSourceEvents = {
    BEFORE_OPEN: 'beforeOpen',
    AFTER_OPEN: 'afterOpen',
    BEFORE_CLOSE: 'beforeClose',
    AFTER_CLOSE: 'afterClose',
    BEFORE_GOTO_PAGE: 'beforeGoToPage',
    AFTER_GOTO_PAGE: 'afterGoToPage',
    AFTER_SCROLL: 'afterScroll',
    BEFORE_EDIT: 'beforeEdit',
    BEFORE_DELETE: 'befeoreDelete',
    AFTER_EDIT: 'afterEdit',
    AFTER_DELETE: 'afterDelete',
    BEFORE_POST: 'beforePost',
    AFTER_POST: 'afterPost',
    BEFORE_CANCEL: 'beforeCancel',
    AFTER_CANCEL: 'afterCancel',
    BEFORE_INSERT: 'beforeInsert',
    AFTER_INSERT: 'afterInsert',
    BEFORE_VALIDATE: 'beforeValidate',
    AFTER_VALIDATE: 'afterValidate',
    DATA_FIELD_CHANGED: 'dataFieldChanged',
    ON_ERROR: 'onError'
}


const DATASOURCE_EVENTS = [
    dataSourceEvents.AFTER_DELETE,
    dataSourceEvents.BEFORE_OPEN,
    dataSourceEvents.AFTER_OPEN,
    dataSourceEvents.BEFORE_CLOSE,
    dataSourceEvents.AFTER_CLOSE,
    dataSourceEvents.AFTER_EDIT,
    dataSourceEvents.AFTER_INSERT,
    dataSourceEvents.AFTER_CANCEL,
    dataSourceEvents.ON_ERROR,
    dataSourceEvents.BEFORE_GOTO_PAGE,
    dataSourceEvents.AFTER_GOTO_PAGE
];

class AnterosDatasource {

    constructor(name) {
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.addEventListener = this.addEventListener.bind(this);
        this.removeEventListener = this.removeEventListener.bind(this);
        this.dispatchEvent = this.dispatchEvent.bind(this);
        this.getData = this.getData.bind(this);
        this.getTotalPages = this.getTotalPages.bind(this);
        this.getCurrentPage = this.getCurrentPage.bind(this);
        this.getTotalRecords = this.getTotalRecords.bind(this);
        this.getGrandTotalRecords = this.getGrandTotalRecords.bind(this);
        this.getSizeOfPage = this.getSizeOfPage.bind(this);
        this.goToPage = this.goToPage.bind(this);
        this.goNextPage = this.goNextPage.bind(this);
        this.isEmpty = this.isEmpty.bind(this);
        this.isEOF = this.isEOF.bind(this);
        this.isBOF = this.isBOF.bind(this);
        this.getCurrentRecord = this.getCurrentRecord.bind(this);
        this.getState = this.getState.bind(this);
        this.getPrimaryKeyFields = this.getPrimaryKeyFields.bind(this);
        this.getPrimaryKey = this.getPrimaryKey.bind(this);
        this.getRecno = this.getRecno.bind(this);
        this.gotoRecordByPrimaryKey = this.gotoRecordByPrimaryKey.bind(this);
        this.gotoRecord = this.gotoRecord.bind(this);
        this.gotoRecordByData = this.gotoRecordByData.bind(this);
        this.isFirst = this.isFirst.bind(this);
        this.isLast = this.isLast.bind(this);
        this.first = this.first.bind(this);
        this.last = this.last.bind(this);
        this.next = this.next.bind(this);
        this.prior = this.prior.bind(this);
        this.previous = this.previous.bind(this);
        this.hasNext = this.hasNext.bind(this);
        this.hasPrior = this.hasPrior.bind(this);
        this.hasPrevious = this.hasPrevious.bind(this);
        this.insert = this.insert.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.post = this.post.bind(this);
        this.cancel = this.cancel.bind(this);
        this.isOpen = this.isOpen.bind(this);
        this._validateDelete = this._validateDelete.bind(this);
        this._validateInsert = this._validateInsert.bind(this);
        this._validateEdit = this._validateEdit.bind(this);
        this._validateCancel = this._validateCancel.bind(this);
        this._validatePost = this._validatePost.bind(this);
        this.disabledAllListeners = this.disabledAllListeners.bind(this);
        this.enableAllListeners = this.enableAllListeners.bind(this);
        this.data = [];
        this.allData = [];
        this.listeners = [];
        this.totalPages = 0;
        this.currentPage = 0;
        this.totalRecords = 0;
        this.grandTotalRecords = 0;
        this.sizeOfPage = 0;
        this.dsState = dataSourceConstants.DS_BROWSE;
        this.currentRecord = null;
        this.currentRecno = -1;
        this.primaryKeyFields = [];
        this.oldRecordInsert = null;
        this.oldRecnoInsert = null;
        this.active = false;

        this.getTotalPages = this.getTotalPages.bind(this);
        this.contentProperty = 'content';
        this.totalPagesProperty = 'totalPages';
        this.currentPageProperty = 'number';
        this.totalRecordsProperty = 'numberOfElements';
        this.sizeOfPageProperty = 'size';
        this.grandTotalRecordsProperty = 'totalElements';

        this.setContentProperty = this.setContentProperty.bind(this);
        this.setTotalPagesProperty = this.setTotalPagesProperty.bind(this);
        this.setCurrentPageProperty = this.setCurrentPageProperty.bind(this);
        this.setTotalRecordsProperty = this.setTotalRecordsProperty.bind(this);
        this.setSizeOfPageProperty = this.setSizeOfPageProperty.bind(this);
        this.setGrandTotalRecordsProperty = this.setGrandTotalRecordsProperty.bind(this);
        this.fieldByName = this.fieldByName.bind(this);
        this.isEmptyField = this.isEmptyField.bind(this);
        this.setFieldByName = this.setFieldByName.bind(this);

        this._enableListeners = true;

        this.dataSourceName = name;
        if (!name) {
            this.dataSourceName = "ds" + Math.random();
        }
        this.filter = undefined;
    }

    setContentProperty(name) {
        this.contentProperty = name;
    }
    setTotalPagesProperty(name) {
        this.totalPagesProperty = name;
    }
    setCurrentPageProperty(name) {
        this.currentPageProperty = name;
    }
    setTotalRecordsProperty(name) {
        this.totalRecordsProperty = name;
    }
    setSizeOfPageProperty(name) {
        this.sizeOfPageProperty = name;
    }
    setGrandTotalRecordsProperty(name) {
        this.setGrandTotalRecordsProperty = name;
    }

    open() {
        this.close();
        this.dispatchEvent(dataSourceEvents.BEFORE_OPEN);
        this.data = [];
        this.allData = [];
        this.active = true;
        this.dispatchEvent(dataSourceEvents.AFTER_OPEN);
    }

    isOpen() {
        return this.active;
    }

    close() {
        if (this.active) {
            this.dispatchEvent(dataSourceEvents.BEFORE_CLOSE);
            this.active = false;            
            this.dispatchEvent(dataSourceEvents.AFTER_CLOSE);
        }
    }

    getData() {
        return this.data;
    }

    applyFilter(filter){
        if (!(filter instanceof Function)){
            throw new AnterosDatasourceError('Um filtro deve ser do tipo Function.');
        }
        this.filter = filter;
        this.data = this.filter?this.allData.filter(this.filter):[].concat(this.allData);
        this.first();
    }

    clearFilter(){
        this.filter = undefined;
        this.data = [].concat(this.allData);
        this.first();
    }

    getTotalPages() {
        return this.totalPages;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getTotalRecords() {
        return this.totalRecords;
    }

    getSizeOfPage() {
        return this.sizeOfPage;
    }

    goToPage(page) {
        this.currentPage = page;
    }

    goNextPage() {
        this.currentPage = this.currentPage + 1;
    }

    getGrandTotalRecords() {
        return this.grandTotalRecords;
    }

    isEmpty() {
        return (this.getTotalRecords() == 0);
    }

    getCurrentRecord() {
        return this.currentRecord;
    }

    getPrimaryKeyFields() {
        return this.primaryKeyFields;
    }

    getState() {
        return this.dsState;
    }

    getRecno() {
        return this.currentRecno;
    }
    gotoRecordByPrimaryKey(values) {
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }
        if (!values) {
            throw new AnterosDatasourceError('Informe os valores da chave primária para ir para um registro.');
        }
        let arrValues = React.Children.toArray(values);
        if (arrValues.length != getPrimaryKeyFields().length) {
            throw new AnterosDatasourceError('Número de valores da chave primária incorretos.');
        }

        if (!this.primaryKeyFields || this.primaryKeyFields.length == 0) {
            throw new AnterosDatasourceError('Campos da chave primária do Datasource não foram definidas.');
        }

        if (this.data) {
            let _this = this;
            let result = undefined;
            this.data.forEach(function (record) {
                let _record = record;
                let _primaryKeyFields = _this.getPrimaryKeyFields();
                let found = 0;
                this.arrValues.forEach(function (value, index) {
                    if (_record[_primaryKeyFields[index]] == value) {
                        found++;
                    }
                });
                if (found == _primaryKeyFields.length) {
                    result = record;
                }
            });
            return result;
        }
    }

    getPrimaryKey() {
        let result = [];
        if (!this.isEmpty()) {
            this.primaryKeyFields.forEach(function (field, index) {
                result.push({
                    field: this.currentRecord[field]
                });
            });
        }
    }
    gotoRecord(recno) {
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }

        if (recno == undefined || recno < 0) {
            throw new AnterosDatasourceError('Número do registro informado inválido ' + recno);
        }
        if (this.isEmpty()) {
            throw new AnterosDatasourceError('Não há registros para posicionar.');
        }

        if (recno > (this.getTotalRecords() - 1)) {
            throw new AnterosDatasourceError('Número do registro maior que o total de registros.');
        }

        this.currentRecno = recno;
        this.currentRecord = this.data[recno];
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
    }

    moveRecord(oldIndex, newIndex) {
        if (this.isEmpty()) {
            return false;
        }
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }
        let record = this.currentRecord;
        this.data = arrayMove(this.data, oldIndex, newIndex);
        this.gotoRecordByData(record);
    }

    gotoRecordByData(record) {
        let _this = this;
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }

        if (this.isEmpty()) {
            return false;
        }
        if (this.currentRecord == record) {
            return true;
        }

        let found = false;
        this.data.forEach(function (r, index) {
            if (record == r) {
                _this.currentRecno = index;
                _this.currentRecord = r;
                _this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
                found = true;
            }
        });
        return found;
    }

    isEmptyField(fieldName) {
        if (!fieldName) {
            throw new AnterosDatasourceError('Nome do campo não pode ser nulo.');
        }
        return this.fieldByName(fieldName) === undefined || this.fieldByName(fieldName) === '';
    }

    fieldByName(fieldName, defaultValue) {
        if (!fieldName) {
            throw new AnterosDatasourceError('Nome do campo inválido.');
        }
        if (this.isEmpty()) {
            return;
        }
        if (this.isBOF()) {
            throw new AnterosDatasourceError('Inicio do Datasource encontrado.');
        }
        if (this.isBOF()) {
            throw new AnterosDatasourceError('Fim do Datasource encontrado.');
        }

        let record = this.data[this.currentRecno];
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            record = this.currentRecord;
        }

        let value = this._fieldByName(record, fieldName);
        if ((value === undefined) && (defaultValue !== undefined)) {
            value = defaultValue;
        }
        return value;
    }

    _fieldByName(record, fieldName) {
        let value = AnterosObjectUtils.getNestedProperty(record, fieldName);
        if (value == undefined) {
            return;
        }
        let date = AnterosDateUtils.parseDateWithFormat(value, Anteros.dataSourceDatetimeFormat);
        if (date instanceof Date) {
            return date;
        }
        return value;
    }

    setFieldByName(fieldName, value) {
        if (this.isEmpty()) {
            return;
        }
        if (this.getState() == dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro não está sendo inserido ou editado.');
        }

        if (!fieldName) {
            throw new AnterosDatasourceError('Nome do campo não pode ser nulo.');
        }

        let newValue = value;
        if (value instanceof Date) {
            newValue = AnterosDateUtils.formatDate(value, Anteros.dataSourceDatetimeFormat);
        }
        var split = fieldName.split(".");
        if (split.length > 1) {
            AnterosObjectUtils.setNestedProperty(this.currentRecord, fieldName, newValue);
        } else {
            this.currentRecord[fieldName] = newValue;
        }

        this.dispatchEvent(dataSourceEvents.DATA_FIELD_CHANGED, null, fieldName);
    }

    locate(values) {
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }

        if (this.isEmpty()) {
            return false;
        }

        let found = -1;
        let _this = this;
        let index = -1;
        this.data.forEach(function (record) {
            index++;
            for (var propertyName in values) {
                if (_this._fieldByName(record, propertyName) == values[propertyName]) {
                    found = index;
                }
            }
        });

        if (found >= 0) {
            this.gotoRecord(found);
        }
        return found >= 0;

    }

    isEOF() {
        return ((this.currentRecno > this.totalRecords - 1) || this.isEmpty());
    }

    isBOF() {
        return (this.currentRecno == -1);
    }

    isFirst() {
        return (this.currentRecno == 0);
    }

    isLast() {
        return (this.currentRecno == this.getTotalRecords() - 1);
    }

    first() {
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }

        if (this.getTotalRecords() > 0) {
            this.currentRecno = 0;
            this.currentRecord = this.data[this.currentRecno];
            this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
        } else {
            this.currentRecno = -1;
            this.currentRecord = null;
        }
    }

    last() {
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }

        if (this.getTotalRecords() > 0) {
            this.currentRecno = this.getTotalRecords() - 1;
            this.currentRecord = this.data[this.currentRecno];
            this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
        } else {
            this.currentRecno = -1;
            this.currentRecord = null;
        }
    }


    next() {
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }

        if (this.isEmpty()) {
            throw new AnterosDatasourceError('Não há registros. Impossível avançar um registro.');
        }
        if (this.isEOF()) {
            throw new AnterosDatasourceError('Não é possível avançar pois você já está no final do DataSource.');
        }
        if ((this.currentRecno + 1) > (this.getTotalRecords() - 1)) {
            this.currentRecno = this.currentRecno + 1;
            this.currentRecord = null;
        } else {
            this.currentRecno = this.currentRecno + 1;
            this.currentRecord = this.data[this.currentRecno];
            this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
        }
    }

    prior() {
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }

        if (this.isEmpty()) {
            throw new AnterosDatasourceError('Não há registros. Impossível voltar um registro.');
        }
        if (this.isBOF()) {
            throw new AnterosDatasourceError('Não é possível retroceder pois você já está no inicio do DataSource.');
        }
        if ((this.currentRecno - 1) < 0) {
            this.currentRecno = -1;
            this.currentRecord = null;
        } else {
            this.currentRecno = this.currentRecno - 1;
            this.currentRecord = this.data[this.currentRecno];
            this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
        }
    }

    previous() {
        this.prior();
    }

    hasNext() {
        if (this.isEmpty() || this.isEOF()) {
            return false;
        } else {
            return ((this.currentRecno + 1) <= (this.getTotalRecords() - 1));
        }
    }

    hasPrior() {
        if (this.isEmpty() || this.isBOF()) {
            return false;
        } else {
            return ((this.currentRecno - 1) >= 0);
        }
    }

    hasPrevious() {
        return this.hasPrior();
    }

    _validateInsert() {
        if (!this.isOpen()) {
            throw new AnterosDatasourceError('Não é possível realizar INSERT com o dataSource fechado.');
        }
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }
    }

    insert() {
        this._validateInsert();
        this.dispatchEvent(dataSourceEvents.BEFORE_INSERT);
        this.oldRecordInsert = this.getCurrentRecord();
        this.oldRecnoInsert = this.getRecno();
        this.totalRecords++;
        this.grandTotalRecords++;
        let nextRecord = this.getTotalRecords();
        this.data[nextRecord - 1] = {};
        this.currentRecord = this.data[nextRecord - 1];
        this.currentRecno = nextRecord - 1;
        this.dsState = dataSourceConstants.DS_INSERT;
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
        this.dispatchEvent(dataSourceEvents.AFTER_INSERT);
    }

    _validateDelete() {
        if (this.isEmpty()) {
            throw new AnterosDatasourceError('Não há registros para remover.');
        }
        if (this.isBOF()) {
            throw new AnterosDatasourceError('Inicio do Datasource encontrado.');
        }
        if (this.isBOF()) {
            throw new AnterosDatasourceError('Fim do Datasource encontrado.');
        }
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }
    }

    delete(callback) {
        this._validateDelete();
        this.dispatchEvent(dataSourceEvents.BEFORE_DELETE);
        let index = -1;
        this.allData.forEach((item, idx)=>{
            if (this.currentRecno === item){
                index = idx;
            }
        });
        if (index>=0){
            this.allData.splice(index, 1);  
        }
        this.data.splice(this.currentRecno, 1);
        this.totalRecords--;
        this.grandTotalRecords--;
        if (this.data.length == 0)
            this.currentRecord = undefined;
        else
            this.currentRecord = this.data[this.currentRecno];
        this.dsState = dataSourceConstants.DS_BROWSE;
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
        this.dispatchEvent(dataSourceEvents.AFTER_DELETE);

        if (callback)
            callback();
    }

    _validateEdit() {
        if (!this.isOpen()) {
            throw new AnterosDatasourceError('Não é possível realizar EDIT com o dataSource fechado.');
        }
        if (this.isEmpty()) {
            throw new AnterosDatasourceError('Não há registros para editar.');
        }
        if (this.isBOF()) {
            throw new AnterosDatasourceError('Inicio do Datasource encontrado.');
        }
        if (this.isEOF()) {
            throw new AnterosDatasourceError('Fim do Datasource encontrado.');
        }
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }
    }

    edit() {
        this._validateEdit();
        this.dispatchEvent(dataSourceEvents.BEFORE_EDIT);
        this.dsState = dataSourceConstants.DS_EDIT;
        this.currentRecord = cloneDeep(this.currentRecord);
        this.dispatchEvent(dataSourceEvents.AFTER_EDIT);
    }



    _validatePost() {
        if (this.dsState == dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError("Registro não está sendo inserido ou editado.");
        }
    }

    post(callback) {
        this._validatePost();
        this.dispatchEvent(dataSourceEvents.BEFORE_POST);
        if (this.dsState == dataSourceConstants.DS_EDIT) {
            this.data[this.getRecno()] = this.currentRecord;
        }

        let index = -1;
        this.allData.forEach((item,idx)=>{
            if (item === this.currentRecord){
                index = idx;
            }
        })
        if (index >= 0){
            this.allData[index] = this.currentRecord;
        } else {
            this.allData.push(this.currentRecord);
        }

        this.dsState = dataSourceConstants.DS_BROWSE;
        this.dispatchEvent(dataSourceEvents.AFTER_POST);
        if (callback)
            callback();
    }

    _validateCancel() {
        if (this.dsState == dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError("Registro não está sendo inserido ou editado.");
        }
    }

    cancel() {
        this._validateCancel();
        this.dispatchEvent(dataSourceEvents.BEFORE_CANCEL);
        if (this.dsState == dataSourceConstants.DS_INSERT) {
            this.data.splice(this.currentRecno, 1);
            this.currentRecord = this.oldRecordInsert;
            this.currentRecno = this.oldRecnoInsert;
            this.totalRecords--;
            this.grandTotalRecords--;
            this.dsState = dataSourceConstants.DS_BROWSE;
            this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
        } else {
            this.currentRecord = this.data[this.currentRecno];
        }
        this.dsState = dataSourceConstants.DS_BROWSE;
        this.dispatchEvent(dataSourceEvents.AFTER_CANCEL);
    }

    disabledAllListeners() {
        this._enableListeners = false;
    }

    enableAllListeners() {
        this._enableListeners = true;
    }


    dispatchEvent(event, error, fieldName) {
        let _this = this;
        if (this._enableListeners) {
            let listToRemove = [];
            this.listeners.forEach(function (listener) {
                if (listener.event == event) {
                    if (fieldName) {
                        if (listener.fieldName) {
                            let fields = [];
                            if (Array.isArray(listener.fieldName)){
                                fields = listener.fieldName;
                            } else {
                                fields.push(listener.fieldName);
                            }
                            fields.forEach((item)=>{
                                if (item.includes(fieldName)) {
                                    listener.dispatch(event, error, fieldName);
                                }
                            });
                        }

                    } else {
                        if (listener.dispatch === undefined) {
                            listToRemove.push(listener);
                        } else {
                            listener.dispatch(event, error);
                        }
                    }
                }
            });
            listToRemove.forEach(function (item) {
                _this.removeEventListener(item.dispatch, item.event, item.fieldName);
            });
        }
    }


    addEventListener(event, dispatch, fieldName) {
        let _this = this;
        if (AnterosUtils.isArray(event)) {
            event.forEach(function (ev) {
                _this.listeners.push({
                    event: ev,
                    dispatch,
                    fieldName
                });
            });
        } else {
            this.listeners.push({
                event,
                dispatch,
                fieldName
            });
        }
    }

    removeEventListener(event, dispatch, fieldName) {
        let _this = this;
        if (AnterosUtils.isArray(event)) {
            event.forEach(function (ev) {
                _this.removeEventListener(ev, dispatch);
            });
        } else {
            this.listeners = this.listeners.filter(function (item) {
                return item.event !== event || item.dispatch !== dispatch || item.fieldName !== fieldName;
            });
        }
    }
}

class AnterosLocalDatasource extends AnterosDatasource {
    constructor(data, name) {
        super(name);
        this.open(data);
        this.cloneOnEdit = true;
    }

    open(data, cloneOnEdit) {
        this.close();
        this.dispatchEvent(dataSourceEvents.BEFORE_OPEN);
        this.data = [];
        this.allData = [];
        this.active = true;
        this.allData = data;
        if (!data) {
            this.data = [];
            this.allData = [];
        }
        this.data = this.allData;
        this.totalRecords = this.data.length;
        this.grandTotalRecords = this.allData.length;
        this.first();
        this.dispatchEvent(dataSourceEvents.AFTER_OPEN);
        this.cloneOnEdit = (cloneOnEdit == undefined ? false : cloneOnEdit);
    }

    close() {
        super.close();
        this.data = [];
        this.totalRecords = this.data.length;
        this.grandTotalRecords = this.data.length;
        this.dispatchEvent(dataSourceEvents.AFTER_CLOSE);
    }

    edit() {
        this._validateEdit();
        this.dispatchEvent(dataSourceEvents.BEFORE_EDIT);
        this.dsState = dataSourceConstants.DS_EDIT;
        if (this.cloneOnEdit)
            this.currentRecord = cloneDeep(this.currentRecord);
        this.dispatchEvent(dataSourceEvents.AFTER_EDIT);
    }

    refresh(){
        if (this.getState() != dataSourceConstants.DS_BROWSE) {
            throw new AnterosDatasourceError('Registro atual está sendo inserido ou editado.');
        }
        this.close();
        this.dispatchEvent(dataSourceEvents.BEFORE_OPEN);
        this.data = this.filter?this.allData.filter(this.filter):this.allData;
        this.totalRecords = this.data.length; 
        this.active = true;
        this.dispatchEvent(dataSourceEvents.AFTER_OPEN);
    }

    append(record) {
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }

        if (!this.data) {
            this.data = [];
            this.allData = [];
            this.grandTotalRecords = 0;
        }

        this.allData.push(record);
        this.data = this.filter?_this.allData.filter(this.filter):this.allData;
        this.totalRecords = this.data.length;
        this.grandTotalRecords++;
        if (!this.gotoRecordByData(record)){
            this.currentRecord = undefined;
            this.currentRecno = -1;
        }    
        this.dispatchEvent(dataSourceEvents.AFTER_POST);
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
    }

    replace(record) {
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }
        if (!this.data) {
            throw new AnterosDatasourceError('Fonte de dados vazia não é possível fazer um replace no registro.');
        }

        let index = -1;
        this.allData.forEach((item,idx)=>{
            if (item === this.currentRecord){
                index = idx;
            }
        })
        if (index>=0){
            this.allData[index] = record;
        }
        this.data = this.filter?this.allData.filter(this.filter):this.allData;
        if (!this.gotoRecordByData(record)){
            this.currentRecord = undefined;
            this.currentRecno = -1;
        }    
        this.dispatchEvent(dataSourceEvents.AFTER_POST);
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
    }

    appendFirst(record) {
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Não é possível utilizar o método appendFirst com um filtro aplicado');
        }

        if (!this.data) {
            this.data = [];
            this.allData = [];
            this.grandTotalRecords = 0;
        }

        this.data.splice(0, 0, record);
        this.allData = this.data;
        this.totalRecords = this.data.length;
        this.grandTotalRecords = this.data.length;
        this.currentRecord = record;
        this.currentRecno = 0;
        this.dispatchEvent(dataSourceEvents.AFTER_POST);
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
    }

    appendAtIndex(record, index) {
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Não é possível utilizar o método appendAtIndex com um filtro aplicado');
        }

        if (!this.data) {
            this.data = [];
            this.allData = [];
            this.grandTotalRecords = 0;
        }

        this.data.splice(index, 0, record);
        this.allData = this.data;
        this.totalRecords = this.data.length;
        this.grandTotalRecords = this.data.length;
        this.currentRecord = record;
        this.currentRecno = index;
        this.dispatchEvent(dataSourceEvents.AFTER_POST);
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
    }
}


class AnterosRemoteDatasource extends AnterosDatasource {
    constructor(ajaxConfig, name) {
        super(name);
        this.ajaxConfig = ajaxConfig;
        this.ajaxPageConfigHandler = undefined;
        this.ajaxPostConfigHandler = undefined;
        this.ajaxDeleteConfigHandler = undefined;
        this.ajaxOpenConfigHandler = undefined;
        this.validatePostResponse = undefined;
        this.validateDeleteResponse = undefined;
        this.storePostResultToRecord = true;

        this.setAjaxPageConfigHandler = this.setAjaxPageConfigHandler.bind(this);
        this.setAjaxPostConfigHandler = this.setAjaxPostConfigHandler.bind(this);
        this.setAjaxDeleteConfigHandler = this.setAjaxDeleteConfigHandler.bind(this);
        this.setAjaxOpenConfigHandler = this.setAjaxOpenConfigHandler.bind(this);
        this.setStorePostResultToRecord = this.setStorePostResultToRecord.bind(this);
        this.setValidatePostResponse = this.setValidatePostResponse.bind(this);
        this.setValidateDeleteResponse = this.setValidateDeleteResponse.bind(this);
        this.executeAjax = this.executeAjax.bind(this);
        this.executed = false;
    }

    setValidatePostResponse(value) {
        this.validatePostResponse = value;
    }

    setValidateDeleteResponse(value) {
        this.validateDeleteResponse = value;
    }

    setStorePostResultToRecord(value) {
        this.storePostResultToRecord = value;
    }

    setAjaxPageConfigHandler(handler) {
        this.ajaxPageConfigHandler = handler;
    }

    setAjaxPostConfigHandler(handler) {
        this.ajaxPostConfigHandler = handler;
    }

    setAjaxDeleteConfigHandler(handler) {
        this.ajaxDeleteConfigHandler = handler;
    }

    setAjaxOpenConfigHandler(handler) {
        this.ajaxOpenConfigHandler = handler;
    }

    open(config, callback) {
        this.close();
        this.dispatchEvent(dataSourceEvents.BEFORE_OPEN);
        this.data = [];
        this.allData = [];
        this.active = true;
        if (config && config != null) {
            this.executeAjax((config ? config : this.config), dataSourceEvents.AFTER_OPEN, callback);
        } else {
            if (this.ajaxOpenConfigHandler && this.ajaxOpenConfigHandler !== null){
                let openConfig = this.ajaxOpenConfigHandler();
                this.executeAjax(openConfig, dataSourceEvents.AFTER_OPEN, callback);
            } else {
                this.dispatchEvent(dataSourceEvents.AFTER_OPEN);
            }
        }
    }

    refresh() {
        if (this.ajaxConfig) {
            this.executeAjax(this.ajaxConfig, dataSourceEvents.AFTER_OPEN, callback);
        }
    }

    append(record) {
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }

        if (!this.data) {
            this.data = [];
            this.allData = [];
            this.grandTotalRecords = 0;
        }

        this.allData.push(record);
        this.data = this.filter?_this.allData.filter(this.filter):this.allData;
        this.totalRecords = this.data.length;
        this.grandTotalRecords++;
        if (!this.gotoRecordByData(record)){
            this.currentRecord = undefined;
            this.currentRecno = -1;
        }    
        this.dispatchEvent(dataSourceEvents.AFTER_POST);
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
    }

    replace(record) {
        if (this.getState() == dataSourceConstants.DS_EDIT) {
            throw new AnterosDatasourceError('Registro já está sendo editado.');
        }
        if (this.getState() == dataSourceConstants.DS_INSERT) {
            throw new AnterosDatasourceError('Registro já está sendo inserido.');
        }
        if (!this.data) {
            throw new AnterosDatasourceError('Fonte de dados vazia não é possível fazer um replace no registro.');
        }

        let index = -1;
        this.allData.forEach((item,idx)=>{
            if (item === this.currentRecord){
                index = idx;
            }
        })
        if (index>=0){
            this.allData[index] = record;
        }
        this.data = this.filter?this.allData.filter(this.filter):this.allData;
        if (!this.gotoRecordByData(record)){
            this.currentRecord = undefined;
            this.currentRecno = -1;
        }    
        this.dispatchEvent(dataSourceEvents.AFTER_POST);
        this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
    }

    post(callback) {
        if (!this.ajaxPostConfigHandler || !this.validatePostResponse) {
            let error = "Para salvar dados remotamente é necessário configurar 'setAjaxPostConfigHandler' e 'setValidatePostResponse' ";
            this.dispatchEvent(dataSourceEvents.ON_ERROR, error);
            throw new AnterosDatasourceError(error);
        }
        let _this = this;
        this._validatePost();
        this.dispatchEvent(dataSourceEvents.BEFORE_POST);

        let ajaxPostConfig = this.ajaxPostConfigHandler(this.currentRecord);
        remoteApi.save(ajaxPostConfig).then(function (response) {
            if (_this.validatePostResponse(response)) {
                if (_this.dsState == dataSourceConstants.DS_EDIT) {
                    _this.data[_this.getRecno()] = _this.currentRecord;
                }
                if (_this.storePostResultToRecord == true) {
                    let newObject = AnterosJacksonParser.convertJsonToObject(response.data);

                    let index = -1;
                    _this.allData.forEach((item,idx)=>{
                        if (item === _this.currentRecord){
                            index = idx;
                        }
                    })
                    if (index >= 0){
                        _this.allData[index] = newObject;
                    } else {
                        _this.allData.push(newObject);
                    }

                    _this.data[_this.getRecno()] = newObject;
                    _this.currentRecord = newObject;
                }
                _this.dsState = dataSourceConstants.DS_BROWSE;
                _this.dispatchEvent(dataSourceEvents.AFTER_POST);
                if (callback) {
                    callback();
                }
            }
        }).catch(function (error) {
            if (callback) {
                callback(error);
            }
            _this.dispatchEvent(dataSourceEvents.ON_ERROR, error);
        });
    }

    delete(callback) {
        if (!this.ajaxDeleteConfigHandler || !this.validateDeleteResponse) {
            let error = "Para remover dados remotamente é necessário configurar 'setAjaxDeleteConfigHandler' e 'setValidateDeleteResponse' ";
            this.dispatchEvent(dataSourceEvents.ON_ERROR, error);
            throw new AnterosDatasourceError(error);
        }
        let _this = this;
        this._validateDelete();
        this.dispatchEvent(dataSourceEvents.BEFORE_DELETE);
        let ajaxDeleteConfig = this.ajaxDeleteConfigHandler(this.currentRecord);
        remoteApi.delete(ajaxDeleteConfig).then(function (response) {
            if (_this.validateDeleteResponse(response)) {
                let index = -1;
                _this.allData.forEach((item, idx)=>{
                    if (_this.currentRecno === item){
                        index = idx;
                    }
                });
                if (index>=0){
                    _this.allData.splice(index, 1);  
                }
                _this.data.splice(_this.currentRecno, 1); 

                if (_this.data.length == 0)
                    _this.currentRecord = undefined
                else
                    _this.currentRecord = _this.data[_this.currentRecno];
                _this.totalRecords--;
                _this.grandTotalRecords--;
                _this.dsState = dataSourceConstants.DS_BROWSE;
                _this.dispatchEvent(dataSourceEvents.AFTER_SCROLL);
                _this.dispatchEvent(dataSourceEvents.AFTER_DELETE);
            }
            if (callback) {
                callback();
            }
        }).catch(function (error) {
            if (callback) {
                callback(error);
            }
            _this.dispatchEvent(dataSourceEvents.ON_ERROR, error);
        });
    }

    goToPage(page) {
        if (!this.ajaxPageConfigHandler) {
            let error = "Para buscar dados paginados remotamente é necessário configurar 'setAjaxPageConfigHandler'";
            this.dispatchEvent(dataSourceEvents.ON_ERROR, error);
            throw new AnterosDatasourceError(error);
        }
        this.dispatchEvent(dataSourceEvents.BEFORE_GOTO_PAGE);
        let ajaxPageConfig = this.ajaxPageConfigHandler(page);
        this.executeAjax(ajaxPageConfig, dataSourceEvents.AFTER_GOTO_PAGE);
    }

    goNextPage() {
        if (!this.ajaxPageConfigHandler) {
            let error = "Para buscar dados paginados remotamente é necessário configurar 'setAjaxPageConfigHandler'";
            this.dispatchEvent(dataSourceEvents.ON_ERROR, error);
            throw new AnterosDatasourceError(error);
        }
        this.dispatchEvent(dataSourceEvents.BEFORE_GOTO_PAGE);
        let ajaxPageConfig = this.ajaxPageConfigHandler(this.currentPage + 1);
        let _this = this;
        this.executeAjax(ajaxPageConfig, dataSourceEvents.AFTER_GOTO_PAGE, function (error) {
            if (!error) {
                _this.currentPage = _this.currentPage + 1;
            }
        }, true);
    }

    executeAjax(ajaxConfig, event, callback, accumulated) {
        let _this = this;
        this.executed = false;
        remoteApi.get((ajaxConfig ? ajaxConfig : this.ajaxConfig)).then(function (response) {
            if (response.data.hasOwnProperty(_this.totalPagesProperty)) {
                _this.totalPages = response.data[_this.totalPagesProperty];
            }

            if (response.data.hasOwnProperty(_this.currentPageProperty)) {
                _this.currentPage = response.data[_this.currentPageProperty];
            }

            if (response.data.hasOwnProperty(_this.sizeOfPageProperty)) {
                _this.sizeOfPage = response.data[_this.sizeOfPageProperty];
            }

            if (response.data.hasOwnProperty(_this.totalRecordsProperty)) {
                _this.totalRecords = response.data[_this.totalRecordsProperty];
            }

            if (response.data.hasOwnProperty(_this.grandTotalRecordsProperty)) {
                _this.grandTotalRecords = response.data[_this.grandTotalRecordsProperty];
            }

            if (response.data.hasOwnProperty(_this.contentProperty)) {
                let temp = AnterosJacksonParser.convertJsonToObject(response.data[_this.contentProperty]);
                if (temp === "") {
                    _this.allData = [];
                } else {
                    if (AnterosUtils.isArray(temp))
                        if (accumulated === true) {
                            _this.allData = _this.allData.concat(temp);
                        } else {
                            _this.allData = temp;
                        }
                    else {
                        if (accumulated === true) {
                            if (!_this.data) {
                                _this.allData = [];
                                _this.allData.push(temp);
                            } else {
                                _this.allData.push(temp);
                            }
                        } {
                            _this.allData = [];
                            _this.allData.push(temp);
                        }
                    }
                }
                _this.data = _this.filter?_this.allData.filter(_this.filter):[].concat(_this.allData);
                _this.totalRecords = _this.data.length;
            } else {
                let temp = AnterosJacksonParser.convertJsonToObject(response.data);
                if (temp === "") {
                    _this.allData = [];
                } else {
                    if (AnterosUtils.isArray(temp))
                        if (accumulated === true) {
                            _this.allData = _this.allData.concat(temp);
                        } else {
                            _this.allData = temp;
                        }
                    else {
                        if (accumulated === true) {
                            if (!_this.allData) {
                                _this.allData = [];
                                _this.allData.push(temp);
                            } else {
                                _this.allData.push(temp);
                            }
                        } {
                            _this.allData = [];
                            _this.allData.push(temp);
                        }
                    }
                }
                _this.grandTotalRecords = _this.allData.length;
                _this.data = _this.filter?_this.allData.filter(_this.filter):[].concat(_this.allData);
                _this.totalRecords = _this.data.length;
            }
            _this.executed = true;
            _this.dsState = dataSourceConstants.DS_BROWSE;
            _this.first();
            _this.dispatchEvent(event);
            if (callback) {
                callback();
            }
        }).catch(function (error) {
            if (_this.executed) {
                if (callback) {
                    callback(error);
                }
                throw new Error(error.name + ': ' + error.message);
            } else {
                _this.dispatchEvent(dataSourceEvents.ON_ERROR, error);
            }
        });
    }



    close() {
        super.close();
        this.data = [];
        this.allData = [];
        this.dispatchEvent(dataSourceEvents.AFTER_CLOSE);
    }
}


export {
    AnterosDatasource,
    AnterosLocalDatasource,
    AnterosRemoteDatasource,
    DATASOURCE_EVENTS,
    dataSourceConstants,
    dataSourceEvents
};
