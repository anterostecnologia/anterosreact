"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnterosFormComponent = void 0;
const react_1 = require("react");
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
const anteros_react_api2_1 = require("@anterostecnologia/anteros-react-api2");
class AnterosFormComponent extends react_1.Component {
    constructor(props) {
        super(props);
        this._datasourceEvents = [];
    }
    registerDatasourceEvent(ds, event, fn) {
        ds.addEventListener(event, fn);
        this._datasourceEvents.push({ ds, event, fn });
    }
    componentWillUnmount() {
        this._datasourceEvents.map((record) => {
            record.ds.removeEventListener(record.event, record.fn);
            return null;
        });
    }
    getPhoto(value, defaultImg) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value);
                }
                else {
                    return "data:image;base64," + value;
                }
            }
            else {
                return value;
            }
        }
        else {
            return defaultImg;
        }
    }
    getPhotoProduct(value) {
        if (value) {
            if (this.isBase64(value)) {
                if (this.isUrl(atob(value))) {
                    return atob(value);
                }
                else {
                    return "data:image;base64," + value;
                }
            }
            else {
                return value;
            }
        }
        else {
            return "https://via.placeholder.com/150x150.png?text=Sem+foto";
        }
    }
    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        }
        catch (err) {
            return false;
        }
    }
    isUrl(string) {
        try {
            new URL(string);
            return true;
        }
        catch (_) {
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
                }
                else if (data[field] === value[field]) {
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
        records.forEach((record, _indice) => {
            if (!_this.hasOnDataSource(record, datasource, field, subfield)) {
                (0, anteros_react_core_1.AnterosSweetAlert)({
                    title: `O item escolhido está ${record.tpStatus
                        ? record.tpStatus
                        : record.status
                            ? record.status
                            : "INATIVO"}`,
                    text: "Deseja inserir o item mesmo assim?",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonText: "Inserir item",
                    cancelButtonText: "Cancelar",
                    focusCancel: false,
                })
                    .then(() => {
                    if (callback) {
                        callback(datasource, field, record);
                    }
                    else {
                        this.defaulInsertValueOnDataSource(datasource, field, record);
                    }
                })
                    .catch((error) => {
                    (0, anteros_react_core_1.AnterosSweetAlert)((0, anteros_react_api2_1.processErrorMessage)(error));
                });
            }
            else {
                (0, anteros_react_core_1.AnterosSweetAlert)({
                    title: "Item já inserido!",
                    text: "",
                    type: "warning",
                });
            }
        });
    }
    onLookupError(error) {
        this.setState(Object.assign(Object.assign({}, this.state), { alertIsOpen: true, alertMessage: error }));
    }
    onStartLookupData(item) {
        this.setState(Object.assign(Object.assign({}, this.state), { lookup: item.props.userData }));
    }
    onFinishedLookupData(_item) {
        this.setState(Object.assign(Object.assign({}, this.state), { lookup: "" }));
    }
}
exports.AnterosFormComponent = AnterosFormComponent;
//# sourceMappingURL=AnterosFormComponent.js.map