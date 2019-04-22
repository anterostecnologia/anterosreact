import React from "react";
import ReactDOM from "react-dom";
import lodash from "lodash";
import {AnterosUtils} from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import PropTypes from 'prop-types';
import regeneratorRuntime from "babel-runtime/regenerator";

let base64ImageFile = function (imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = event => {
            const image = new Image();

            image.onload = () => {
                resolve(image.src);
            };

            image.onerror = reject;

            image.src = event.target.result;
        };

        reader.readAsDataURL(imageFile);
    });
}

export default class AnterosImagePicker extends React.Component {


    constructor(props) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onDoubleClickImage = this.onDoubleClickImage.bind(this);
        this.idImage = lodash.uniqueId("imagePicker");
        this.state = { value: "" };

        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            this.state = { value: value };
        } else {
            this.state = { value: this.props.value };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            this.setState({ value: value });
        } else {
            this.setState({ value: nextProps.value });
        }
    }

    componentDidMount() {
        let _this = this;
        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    componentWillUnmount() {
        if ((this.props.dataSource)) {
            this.props.dataSource.removeEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    onDatasourceEvent(event, error) {
        let value = this.props.dataSource.fieldByName(this.props.dataField);
        if (!value) {
            value = '';
        }
        this.setState({ value: value });
    }

    onRemove() {
        ReactDOM.findDOMNode(this.refs.input).value = "";
    }

    onSelect(event) {
        if (!event.target.files.length) {
            this.onRemove();
            return;
        }

        let file = event.target.files[0];
        const { onInvalidImage } = this.props;

        if (!file.type.match(/^image\//)) {
            this.onRemove();
            return onInvalidImage(`${this.props.notImage || "Não é uma imagem válida."}`)
        }
        if (file.size > this.props.maxImageFileSize) { //made changes to use props maxfileSize
            this.onRemove();
            return onInvalidImage(`${this.props.imageTooLarge || "Image muito grande."}`)
        }
        this.selectImage(file);
    }

    onDoubleClickImage(event) {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }
        if (!readOnly && !this.props.disabled) {
            $('#' + this.idImage + "_input").click();
        }
    }

    render() {

        const colClasses = buildGridClassNames(this.props, false, []);
        let className = AnterosUtils.buildClassNames((colClasses.length > 0 || this.props.icon ? "form-control" : ""), "fileUpload");

        if (colClasses.length > 0) {
            return (<div className="input-group" style={{ width: this.props.width }}>
                <div className={className} style={{ border: 0 }} id={this.idImage}>
                    <img src={this.state.value && this.state.value !== ''?'data:image;base64,' + this.state.value:null} style={{ ...this.props.style, border: "1px solid silver", width: this.props.width, height: this.props.height }} onDoubleClick={this.onDoubleClickImage} />
                    <input id={this.idImage + "_input"} type="file"
                        className="imageUpload"
                        onChange={this.onSelect}
                        ref="input" style={{ display: "none" }} />
                </div>
            </div>);
        } else {
            return (<div className={className} style={{ display: "grid", border: 0 }} id={this.idImage}>
                <img src={this.state.value && this.state.value !== ''?'data:image;base64,' + this.state.value:null} style={{ ...this.props.style, border: "1px solid silver", width: this.props.width, height: this.props.height }} onDoubleClick={this.onDoubleClickImage} />
                <input id={this.idImage + "_input"} type="file"
                    className="imageUpload"
                    onChange={this.onSelect}
                    ref="input" style={{ display: "none" }} />
            </div>
            )
        };
    }
    onRemoveImage() {
        this.setState({ image: null });
        this.props.onRemoveImage();
    }

    onErrorImageLoading(error) {
        this.setState({
            original: null,
            cropping: false,
            loading: false,
            urlsReceived: false
        });
        this.onRemoveImage();
    }

    async selectImage(imageFile) {
        if (this.props.minSize) {
            var [minWidth, minHeight] = this.props.minSize; //pass props size
        }
        const { onInvalidImage } = this.props;
        const image = new Image();
        const imageBase = await base64ImageFile(imageFile);
        image.src = imageBase;
        let imageb64 = imageBase.split(',');
        imageb64 = imageb64[1];
        let _this = this;

        image.onload = async () => {
            try {
                if (image.width < (minWidth || 0) * 0.995 || image.height < (minHeight || 0) * 0.995 && onInvalidImage) {
                    return onInvalidImage(`${this.props.imageTooSmall || "Imagem muito pequena."} ${minWidth} x ${minHeight}`); //pass error
                }

                if (_this.props.dataSource && _this.props.dataSource.getState !== 'dsBrowse') {
                    _this.props.dataSource.setFieldByName(_this.props.dataField, imageb64);
                } else {
                    _this.setState({ value: imageb64 });
                }
                if (_this.props.onSelect) {
                    _this.props.onSelect(imageb64, imageFile);
                }

            } catch (error) {
                this.onErrorImageLoading(error);
            }
        };

    }

}


AnterosImagePicker.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    value: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,
    onSelect: PropTypes.func,
    onError: PropTypes.func,
    onInvalidImage: PropTypes.func,
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    readOnly: PropTypes.bool.isRequired,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
}

AnterosImagePicker.defaultProps = {
    width: "150px",
    height: "200px",
    readOnly: false,
    value: ''
}
