import { Component } from "react";
import { AnterosSweetAlert } from "@anterostecnologia/anteros-react-core";
import { processErrorMessage } from "@anterostecnologia/anteros-react-api2";

export interface AnterosFormComponentProps {}

export interface AnterosFormComponentState {
  modalOpen: string | undefined;
  lookup: any | undefined;
  alertIsOpen: boolean | undefined;
  alertMessage: string | undefined;
  fieldName: string | undefined;
}

export abstract class AnterosFormComponent<
  AnterosFormComponentProps,
  AnterosFormComponentState,
  SS = any
> extends Component<AnterosFormComponentProps, AnterosFormComponentState, SS> {
  private _datasourceEvents: any[];

  constructor(props: AnterosFormComponentProps) {
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
        } else {
          return "data:image;base64," + value;
        }
      } else {
        return value;
      }
    } else {
      return defaultImg;
    }
  }

  getPhotoProduct(value) {
    if (value) {
      if (this.isBase64(value)) {
        if (this.isUrl(atob(value))) {
          return atob(value);
        } else {
          return "data:image;base64," + value;
        }
      } else {
        return value;
      }
    } else {
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
    records.forEach((record, _indice) => {
      if (!_this.hasOnDataSource(record, datasource, field, subfield)) {
        AnterosSweetAlert({
          title: `O item escolhido está ${
            record.tpStatus
              ? record.tpStatus
              : record.status
              ? record.status
              : "INATIVO"
          }`,
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
            } else {
              this.defaulInsertValueOnDataSource(datasource, field, record);
            }
          })
          .catch((error) => {
            AnterosSweetAlert(processErrorMessage(error));
          });
      } else {
        AnterosSweetAlert({
          title: "Item já inserido!",
          text: "",
          type: "warning",
        });
      }
    });
  }

  onLookupError(error) {
    this.setState({
      ...this.state,
      alertIsOpen: true,
      alertMessage: error,
    });
  }

  onStartLookupData(item) {
    this.setState({
      ...this.state,
      lookup: item.props.userData,
    });
  }

  onFinishedLookupData(_item) {
    this.setState({
      ...this.state,
      lookup: "",
    });
  }
}
