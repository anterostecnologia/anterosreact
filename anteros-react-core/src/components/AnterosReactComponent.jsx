import { Component } from 'react';
import AnterosSweetAlert from './AnterosSweetAlert';

export class AnterosReactComponent extends Component {

    constructor(props) {
        super(props);
        this.datasourceEvents = [];
    }

    registerDatasourceEvent(ds, event, fn) {
        ds.addEventListener(event, fn);
        this.datasourceEvents.push({ ds, event, fn });
    }

    componentWillUnmount() {
        this.datasourceEvents.map(record => {
            record.ds.removeEventListener(record.event, record.fn);
            return null;
        });
    }

    getFoto(value, defaultImg) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value)
                } else {
                    return 'data:image;base64,' + value;
                }
            } else {
                return value
            }
        }
        else {
            return defaultImg
        }
    }

    getProduto(value) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value)
                } else {
                    return 'data:image;base64,' + value;
                }
            } else {
                return value
            }
        }
        else {
            return "https://via.placeholder.com/150x150.png?text=Sem+foto";
        }
    }

    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    isUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    hasOnDataSource(value, datasource, field, subfield) {
        for (let index = 0; index < datasource.getData().length; index++) {
            const data = datasource.getData()[index];
            if (data[field]) {
                if (subfield) {
                    if (data[field][subfield] === value[subfield]) {
                        return true;
                    }
                } else if (data[field] === value[field]) {
                    return true;
                }
            }
        }
        return false;
    }

    defaulInsertValueOnDataSource(datasource, field, value) {
        datasource.setFieldByName(field, value);
    }

    checkAndInsertOnDataSource(records, datasource, field, subfield, callback) {
        let _this = this;
        records.forEach((record, indice) => {
            if (!_this.hasOnDataSource(record, datasource, field, subfield)) {
                if ((record.tpStatus && (record.tpStatus === 'INATIVO' || record.tpStatus === 'BLOQUEADO'))
                    || (record.status && (record.status === 'INATIVO' || record.status === 'BLOQUEADO'))) {
                    AnterosSweetAlert({
                        title: `O item escolhido está ${record.tpStatus ? record.tpStatus : (record.status ? record.status : 'INATIVO')}`,
                        text: 'Deseja inserir o item mesmo assim?',
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Inserir item',
                        cancelButtonText: 'Cancelar',
                        focusCancel: false
                    }).then(() => {
                        if (callback) {
                            callback(datasource, field, record);
                        } else {
                            this.defaulInsertValueOnDataSource(datasource, field, record);
                        }
                    }).catch(error => { })
                } else {
                    if (callback) {
                        callback(datasource, field, record);
                    } else {
                        this.defaulInsertValueOnDataSource(datasource, field, record);
                    }
                }
            } else {
                AnterosSweetAlert({
                    title: 'Item já inserido!',
                    text: "",
                    type: 'warning',
                })
            }
        });
    };

    render() {
        return null;
    }
}
