import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import lodash from 'lodash';
import { AnterosUtils, AnterosSweetAlert } from '@anterostecnologia/anteros-react-core';
import { buildGridClassNames, columnProps } from '@anterostecnologia/anteros-react-layout';
import {
    AnterosLocalDatasource,
    AnterosRemoteDatasource,
    dataSourceEvents,
    dataSourceConstants
} from '@anterostecnologia/anteros-react-datasource';
import PropTypes from 'prop-types';
import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import {
    AnterosModal,
    AnterosPageControl,
    AnterosTab,
    PageHeaderActions
} from '@anterostecnologia/anteros-react-containers';
import { AnterosCol, AnterosRow } from '@anterostecnologia/anteros-react-layout';
import { AnterosDropzone } from '@anterostecnologia/anteros-react-dropzone';
import AnterosWebcam from './AnterosWebcam';
import AnterosImageCropper from './AnterosImageCropper';



const $ = window.$;

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
};

function isBase64(str) {
    if (!str){
        return false;
    }
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
}

export default class AnterosImagePicker extends React.Component {
    constructor(props) {
        super(props);
        this.AnterosImagePickerEdicaoRef = React.createRef();
        this.onSelect = this.onSelect.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onDoubleClickImage = this.onDoubleClickImage.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onCloseButton = this.onCloseButton.bind(this);
        this.saveImg = this.saveImg.bind(this);

        this.idImage = lodash.uniqueId('imagePicker');
        this.state = { value: '', modal: false };

        if (this.props.dataSource && this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            if (this.props.dataSource.isEmptyField(this.props.dataField) && !this.props.readOnly) {
                this.props.dataSource.setFieldByName(this.props.dataField, '');
            }
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            this.state = { value: value };
        } else {
            this.state = { value: this.props.value };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);


        this.dsImage = new AnterosLocalDatasource();
        this.dsImage.open();
        this.dsImage.insert();
        this.dsImage.setFieldByName(
            'editedImg',
            this.state.value
        );
        this.dsImage.post();

        this.state = { ...this.state, cropping: true };
    }

    componentWillReceiveProps(nextProps) {
        let value = nextProps.value;
        if (nextProps.dataSource && nextProps.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
            if (nextProps.dataSource.isEmptyField(nextProps.dataField) && !nextProps.readOnly) {
                nextProps.dataSource.setFieldByName(nextProps.dataField, '');
            }
            value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
        }
        this.setState({ value });

        this.dsImage.edit();
        this.dsImage.setFieldByName(
            'editedImg',
            value
        );
        this.dsImage.post();
    }

    componentDidMount() {
        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [
                    dataSourceEvents.AFTER_CLOSE,
                    dataSourceEvents.AFTER_OPEN,
                    dataSourceEvents.AFTER_GOTO_PAGE,
                    dataSourceEvents.AFTER_CANCEL,
                    dataSourceEvents.AFTER_SCROLL
                ],
                this.onDatasourceEvent
            );
            this.props.dataSource.addEventListener(
                dataSourceEvents.DATA_FIELD_CHANGED,
                this.onDatasourceEvent,
                this.props.dataField
            );
        }
    }

    componentWillUnmount() {
        if (this.props.dataSource) {
            this.props.dataSource.removeEventListener(
                [
                    dataSourceEvents.AFTER_CLOSE,
                    dataSourceEvents.AFTER_OPEN,
                    dataSourceEvents.AFTER_GOTO_PAGE,
                    dataSourceEvents.AFTER_CANCEL,
                    dataSourceEvents.AFTER_SCROLL
                ],
                this.onDatasourceEvent
            );
            this.props.dataSource.removeEventListener(
                dataSourceEvents.DATA_FIELD_CHANGED,
                this.onDatasourceEvent,
                this.props.dataField
            );
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
        ReactDOM.findDOMNode(this.refs.input).value = '';
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
            return onInvalidImage(
                `${this.props.notImage || 'Não é uma imagem válida.'}`
            );
        }
        if (file.size > this.props.maxImageFileSize) {
            //made changes to use props maxfileSize
            this.onRemove();
            return onInvalidImage(
                `${this.props.imageTooLarge || 'Image muito grande.'}`
            );
        }
        this.selectImage(file);
    }

    onDoubleClickImage(event) {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = this.props.dataSource.getState() === dataSourceConstants.DS_BROWSE;
        }
        if (!readOnly && !this.props.disabled) {
            $('#' + this.idImage + '_input').click();
        }
    }

    saveImg(isConfirm) {
        if (isConfirm) {
            this.dsImage.post();
            let value = this.dsImage.fieldByName('editedImg');
            if (this.props.dataSource && this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                this.props.dataSource.setFieldByName(this.props.dataField, value);
            }
            this.setState({ ...this.state, value, modal: false });
        }
    }

    onButtonClick(event, button) {
        let _this = this;

        if (button.props.id === 'btnEditImg') {
            if (this.state.value) {
                this.dsImage.edit();
            } else {
                this.dsImage.insert();
            }
            this.setState({ ...this.state, modal: true });
        } else if (button.props.id === 'btnSave') {
            AnterosSweetAlert({
                title: 'Deseja salvar ?',
                text: '',
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                focusCancel: false
            })
                .then(function (isConfirm) {
                    _this.saveImg(isConfirm);
                    return;
                })
                .catch(function (reason) {
                    // quando apertar o botao "Não" cai aqui. Apenas ignora. (sem processamento necessario)
                });
        } else if (button.props.id === 'btnCancel') {
            AnterosSweetAlert({
                title: 'Deseja cancelar ?',
                text: '',
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                focusCancel: true
            })
                .then(function (isConfirm) {
                    if (isConfirm) {
                        _this.dsImage.cancel();
                        _this.setState({ ..._this.state, modal: false });
                    }
                    return;
                })
                .catch(function (reason) {
                    // quando apertar o botao "Não" cai aqui. Apenas ignora. (sem processamento necessario)
                });
        }
    }

    onCloseButton(event) {
        this.dsImage.cancel();
        this.setState({ ...this.state, modal: false });
    }

    getValue() {
        let imgSrc = null;
        if (this.state.value && this.state.value !== '') {
            imgSrc = this.state.value;
        } else if (this.props.placeHolder){
            imgSrc = this.props.placeHolder;
        }

        if (isBase64(imgSrc)) {
            if (this.isUrl(atob(imgSrc))) {
                return atob(imgSrc);
            } else {
                return 'data:image;base64,' + imgSrc;
            }
        } else {
            return imgSrc;
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

    render() {
        const colClasses = buildGridClassNames(this.props, false, []);
        let className = AnterosUtils.buildClassNames(
            colClasses.length > 0 || this.props.icon ? 'form-control' : '',
            'fileUpload'
        );

        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() === 'dsBrowse');
        }

        if (colClasses.length > 0) {
            return (
                <div
                    style={{
                        width: this.props.width,
                        height: this.props.height,
                        textAlign: 'center'
                    }}
                >
                    <div
                        className="input-group"
                        style={{ width: this.props.width, height: this.props.height }}
                    >
                        <div
                            className={className}
                            style={{ border: 0, height: this.props.height, padding: 0, width: this.props.width, marginLeft: '16px' }}
                            id={this.idImage}
                        >
                            <img
                                alt={this.props.alt ? this.props.alt : ''}
                                src={this.getValue()
                                }
                                style={{
                                    ...this.props.style,
                                    width: '100%',
                                    height: '100%'
                                }}
                                onDoubleClick={this.onDoubleClickImage}
                            />
                            <input
                                id={this.idImage + '_input'}
                                type="file"
                                accept={this.props.accept}
                                className="imageUpload"
                                onChange={this.onSelect}
                                ref="input"
                                style={{ display: 'none' }}
                                disabled={this.props.disabled || readOnly}
                            />
                        </div>
                        {!readOnly ? <AnterosButton
                            style={{ position: 'absolute', top: '10px', left: '30px', zIndex: 99 }}
                            icon="fal fa-edit"
                            id="btnEditImg"
                            small
                            secondary
                            circle
                            visible={!this.props.disabled}
                            onButtonClick={this.onButtonClick}
                            hint="Editar a imagem"
                            disabled={this.props.disabled || readOnly}
                        /> : null}
                        {!readOnly ? <AnterosImagePickerEdicao
                            id={this.idImage + '_modal'}
                            isOpen={this.state.modal}
                            showCloseButton={this.props.showCloseButton}
                            onCloseButton={this.onCloseButton}
                            onButtonClick={this.onButtonClick}
                            handleSaveWhileEditing={this.saveImg}
                            dataSource={this.dsImage}
                            dataField={'editedImg'}
                            minSize={this.props.minSize}
                            accept={this.props.accept}
                            captureWidth={this.props.captureWidth}
                            captureHeight={this.props.captureHeight}
                            ref={this.AnterosImagePickerEdicaoRef}
                            aspectRatio={this.props.aspectRatio}
                        /> : null}
                    </div>
                </div>
            );
        } else {
            return (
                <div
                    style={{
                        width: this.props.width,
                        height: this.props.height,
                        textAlign: 'center'
                    }}
                >
                    <div
                        className={className}
                        style={{ display: 'grid', border: 0, height: this.props.height }}
                        id={this.idImage}
                    >
                        <img
                            alt={this.props.alt ? this.props.alt : ''}
                            src={this.getValue()
                            }
                            style={{
                                ...this.props.style,
                                height: this.props.height,
                                width: this.props.width
                            }}
                            onDoubleClick={this.onDoubleClickImage}
                        />
                        <input
                            id={this.idImage + '_input'}
                            type="file"
                            accept={this.props.accept}
                            className="imageUpload"
                            onChange={this.onSelect}
                            ref="input"
                            style={{ display: 'none' }}
                            disabled={this.props.disabled || readOnly}
                        />
                        {!readOnly ? <AnterosButton
                            style={{ position: 'absolute', top: '10px', left: '20px', zIndex: 99 }}
                            icon="fal fa-edit"
                            id={"btnEditImg"}
                            small
                            secondary
                            circle
                            visible={!this.props.disabled}
                            onButtonClick={this.onButtonClick}
                            hint="Editar a imagem"
                        /> : null}
                        {!readOnly ? <AnterosImagePickerEdicao
                            id={this.idImage + '_modal'}
                            isOpen={this.state.modal}
                            showCloseButton={this.props.showCloseButton}
                            onCloseButton={this.onCloseButton}
                            onButtonClick={this.onButtonClick}
                            handleSaveWhileEditing={this.saveImg}
                            dataSource={this.dsImage}
                            dataField={'editedImg'}
                            minSize={this.props.minSize}
                            accept={this.props.accept}
                            captureWidth={this.props.captureWidth}
                            captureHeight={this.props.captureHeight}
                            ref={this.AnterosImagePickerEdicaoRef}
                            aspectRatio={this.props.aspectRatio}
                        /> : null}
                    </div>
                </div>
            );
        }
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
                if (
                    image.width < (minWidth || 0) * 0.995 ||
                    (image.height < (minHeight || 0) * 0.995 && onInvalidImage)
                ) {
                    return onInvalidImage(
                        `${this.props.imageTooSmall ||
                        'Imagem muito pequena.'} ${minWidth} x ${minHeight}`
                    ); //pass error
                }

                if (
                    _this.props.dataSource &&
                    _this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE
                ) {
                    _this.props.dataSource.setFieldByName(
                        _this.props.dataField,
                        imageb64
                    );
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
    captureWidth: PropTypes.number.isRequired,
    captureHeight: PropTypes.number.isRequired,
    showCloseButton: PropTypes.bool,
    accept: PropTypes.string.isRequired,
    aspectRatio: PropTypes.number
};

AnterosImagePicker.defaultProps = {
    width: '150px',
    height: '200px',
    readOnly: false,
    value: '',
    disabled: false,
    captureWidth: 480,
    captureHeight: 270,
    showCloseButton: false,
    accept: 'image/png, image/jpeg',
    aspectRatio: NaN
};

class AnterosImagePickerEdicao extends Component {
    constructor(props) {
        super(props);
        this.imageContentRef = React.createRef();
        this.state = { activePage: 'tabArquivo' };
        this.onDetailPageChange = this.onDetailPageChange.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.clear = this.clear.bind(this);
    }

    clear() {
        this.imageContentRef.current.clear()
    }

    onDetailPageChange(id) {
        this.setState({
            ...this.state,
            activePage: id
        });
    }

    onButtonClick(event, button) {
        let _this = this;
        if (button.props.id === 'btnSave') {
            if (this.imageContentRef.current.getStatus() === 'ReadyToSave') {
                this.props.onButtonClick(event, button);
            } else {
                AnterosSweetAlert({
                    title: 'Imagem ainda em edição, deseja salvar mesmo assim ?',
                    text: 'Qualquer alteração não finalizada será perdida',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Salvar imagem',
                    focusCancel: false
                })
                    .then(function (isConfirm) {
                        if (_this.props.handleSaveWhileEditing) {
                            _this.props.handleSaveWhileEditing(isConfirm);
                        }
                    })
                    .catch(function (reason) {
                        // quando apertar o botao "Cancelar" cai aqui. Apenas ignora. (sem processamento necessario)
                    });
            }
        }
    }

    render() {
        return (
            <AnterosModal
                id={this.props.id}
                title={'Editando imagem'}
                secondary
                semifull
                showHeaderColor={true}
                showContextIcon={false}
                isOpen={this.props.isOpen}
                onCloseButton={this.props.onCloseButton}
            >
                <ImageContent
                    alt={'Imagem sendo editada'}
                    dataSource={this.props.dataSource}
                    dataField={this.props.dataField}
                    minSize={this.props.minSize}
                    width={this.props.captureWidth}
                    height={this.props.captureHeight}
                    accept={this.props.accept}
                    ref={this.imageContentRef}
                    aspectRatio={this.props.aspectRatio}
                />
                <AnterosRow horizontalEnd>
                    <AnterosCol
                        style={{
                            textAlign: 'end'
                        }}
                        small={12}
                    >
                        <AnterosButton
                            id="btnSave"
                            route="#"
                            style={{
                                marginRight: '4px'
                            }}
                            icon="fa fa-floppy-o"
                            success
                            caption="Salvar"
                            onButtonClick={this.onButtonClick}
                        />
                        <AnterosButton
                            id="btnCancel"
                            route="#"
                            icon="fa fa-ban"
                            danger
                            caption="Cancelar"
                            onButtonClick={this.props.onButtonClick}
                        />
                    </AnterosCol>
                </AnterosRow>
            </AnterosModal>
        );
    }
}
AnterosImagePickerEdicao.propTypes = {
    showCloseButton: PropTypes.bool,
    aspectRatio: PropTypes.number
};

AnterosImagePickerEdicao.defaultProps = {
    showCloseButton: false,
    aspectRatio: NaN
};

class ImageContent extends Component {
    constructor(props) {
        super(props);
        this.currentImageRef = React.createRef();
        this.selectImage = this.selectImage.bind(this);
        this.handleChangeStatus = this.handleChangeStatus.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onMenuLinkClick = this.onMenuLinkClick.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.clear = this.clear.bind(this);

        let imgToEdit = this.props.dataSource.fieldByName(this.props.dataField);

        if (!imgToEdit) {
            imgToEdit = null;
        }

        this.state = {
            activePage: 'tabArquivo',
            cropping: false,
            files: null,
            filesLoaded: [],
            currentImage: imgToEdit
        };
    }

    getStatus() {
        if (this.state.cropping) {
            return 'Cropping';
        }
        if (this.state.currentImage && !this.state.cropping) {
            return 'ReadyToSave';
        }
        return 'WaitingImage';
    }

    clear() {

        let imgToEdit = this.props.dataSource.fieldByName(this.props.dataField);

        if (!imgToEdit) {
            imgToEdit = null;
        }

        this.setState({
            ...this.state,
            activePage: 'tabArquivo',
            cropping: false,
            files: null,
            filesLoaded: [],
            currentImage: imgToEdit
        })
    }

    componentDidMount() {
        window.addEventListener('paste', this.handlePaste, false);
        window.addEventListener('copy', this.handleCopy, false);
    }

    componentWillUnmount() {
        window.removeEventListener('paste', this.handlePaste, false);
        window.removeEventListener('copy', this.handleCopy, false);
    }

    handleCopy(copyEvent) {
        let img = this.currentImageRef.current;
        let range = document.createRange();
        range.setStartBefore(img);
        range.setEndAfter(img);
        range.selectNode(img);
        var selection = window.getSelection();
        selection.addRange(range);
        document.execCommand('Copy');
    }

    handlePaste(pasteEvent) {
        let clipboardData = pasteEvent.clipboardData || window.clipboardData;
        if (clipboardData) {
            let items = clipboardData.items;
            for (var i = 0; i < items.length; i++) {
                // Se o item não for imagem, ignora
                if (items[i].type.indexOf('image') === -1) continue;
                // Recupera imagem do clipboard
                var blob = items[i].getAsFile();
            }

            if (blob) {
                this.selectImage(blob);
            }
        }
    }

    onButtonClick(event, button) {
        if (button.props.id === 'btnCapture') {
            let image = this.webcamRef ? this.webcamRef.getScreenshot() : null;
            this.setState({
                ...this.state,
                activePage: 'tabCamera',
                cropping: false,
                currentImage: image
            });
            if (this.props.dataSource && this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                this.props.dataSource.setFieldByName(
                    this.props.dataField,
                    image.split(',')[1]
                );
            }
        } else if (button.props.id === 'btnCut') {

            let image = this.cropperRef
                ? this.cropperRef.getCroppedCanvas({ width: this.props.width, height: this.props.height })
                : null;

            let cutedImg = image.toDataURL();
            if (!cutedImg) {
                cutedImg = null;
            }
            this.setState({
                ...this.state,
                cropping: false,
                currentImage: cutedImg
            });
            if (this.props.dataSource && this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE) {
                this.props.dataSource.setFieldByName(
                    this.props.dataField,
                    cutedImg.split(',')[1]
                );
            }
        }
    }

    onMenuLinkClick(caption) {
        if (caption === 'Crop') {
            if (this.state.currentImage) {
                this.setState({
                    ...this.state,
                    activePage: this.state.activePage,
                    cropping: true
                });
            }
        } else if (caption === 'Colar') {
        }
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
                if (
                    image.width < (minWidth || 0) * 0.995 ||
                    (image.height < (minHeight || 0) * 0.995 && onInvalidImage)
                ) {
                    return onInvalidImage(
                        `${this.props.imageTooSmall ||
                        'Imagem muito pequena.'} ${minWidth} x ${minHeight}`
                    ); //pass error
                }

                if (
                    _this.props.dataSource &&
                    _this.props.dataSource.getState() !== dataSourceConstants.DS_BROWSE && !_this.props.readOnly
                ) {
                    _this.props.dataSource.setFieldByName(
                        _this.props.dataField,
                        imageb64
                    );
                }
                _this.setState({
                    ..._this.state,
                    currentImage: imageb64
                });

                if (_this.props.onSelect) {
                    _this.props.onSelect(imageb64, imageFile);
                }
            } catch (error) {
                if (this.props.onErrorImageLoading) {
                    this.props.onErrorImageLoading(error);
                }
            }
        };
    }

    getValue() {
        if (isBase64(this.state.currentImage)) {
            if (this.isUrl(atob(this.state.currentImage))) {
                return atob(this.state.currentImage);
            } else {
                return 'data:image;base64,' + this.state.currentImage;
            }
        } else {
            return this.state.currentImage;
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

    handleChangeStatus(fileWithMeta, status, files) {
        if (status === 'done') {
            var hasChanges = false;
            var currentFiles = [];

            if (this.state.files && files.length !== this.state.files.length) {
                hasChanges = true;
            } else {
                for (let i = 0; i < files.length; i++) {
                    if (this.state.files && files[i].file !== this.state.files[i].file) {
                        hasChanges = true;
                        break;
                    }
                }
            }

            if (!this.state.files || hasChanges) {
                files.forEach(element => {
                    currentFiles.push(element.file);
                });
                this.setState({
                    ...this.state,
                    filesLoaded: currentFiles.length > 0 ? currentFiles : [],
                    files: files
                });
                let file = fileWithMeta.file;
                this.selectImage(file);
            }
        }
    }

    render() {
        return (
            <Fragment>
                <AnterosRow>
                    <AnterosCol small={12} medium={6} large={6}>
                        <AnterosPageControl
                            onPageChange={this.onDetailPageChange}
                            height={'540px'}
                        >
                            <PageHeaderActions />
                            <AnterosTab
                                caption="Arquivo"
                                id="tabArquivo"
                                active={this.state.activePage === 'tabArquivo'}
                            >
                                <AnterosDropzone
                                    initialFiles={this.state.filesLoaded}
                                    onChangeStatus={this.handleChangeStatus}
                                    onSubmit={this.handleSubmit}
                                    maxFiles={1}
                                    inputContent="Arraste aqui uma imagem ou clique para procurar"
                                    accept={this.props.accept}
                                    submitButtonDisabled={true}
                                />
                            </AnterosTab>

                            <AnterosTab
                                caption="Câmera"
                                id="tabCamera"
                                active={this.state.activePage === 'tabCamera'}
                                style={{}}
                            >
                                <AnterosWebcam
                                    // Tamanho da imagem capturada
                                    minScreenshotWidth={480}
                                    minScreenshotHeight={270}
                                    screenshotFormat="image/png"
                                    // Tamanho do preview
                                    width="100%"
                                    height="auto"
                                    style={{
                                        maxHeight: "45vh"
                                    }}
                                    ref={ref => (this.webcamRef = ref)}
                                />
                                <AnterosButton
                                    id="btnCapture"
                                    secondary
                                    block
                                    icon="fal fa-camera"
                                    onButtonClick={this.onButtonClick}
                                    caption="Capturar imagem"
                                />
                            </AnterosTab>
                        </AnterosPageControl>
                    </AnterosCol>
                    <AnterosCol small={12} medium={6} large={6}>
                        <AnterosNavigator handleSelectLink={this.onMenuLinkClick}>
                            <AnterosNavigatorLink href="#crop" caption="Crop" />
                        </AnterosNavigator>
                        {this.state.currentImage && !this.state.cropping ? (
                            <img
                                id="currentImg"
                                ref={this.currentImageRef}
                                alt={this.props.alt ? this.props.alt : ''}
                                style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '45vh'
                                }}
                                src={
                                    this.getValue()
                                }
                            />
                        ) : !this.state.cropping ? (
                            <h5>Capture, carregue ou cole uma imagem</h5>
                        ) : null}
                        {this.state.currentImage && this.state.cropping ? (
                            <Fragment>
                                <AnterosImageCropper
                                    crossOrigin="anonymous" // boolean, set it to true if your image is cors protected or it is hosted on cloud like aws s3 image server
                                    src={
                                        this.getValue()
                                    }
                                    style={{
                                        width: 'auto',
                                        height: 'auto',
                                        maxWidth: '100%',
                                        maxHeight: '45vh'
                                    }}
                                    guides={true}
                                    modal={true}
                                    rotatable={true}
                                    aspectRatio={this.props.aspectRatio}
                                    imageName="Imagem cortada"
                                    responseType="blob/base64"
                                    ref={ref => (this.cropperRef = ref)}
                                />
                                <AnterosButton
                                    id="btnCut"
                                    secondary
                                    block
                                    icon="fal fa-crop-alt"
                                    onButtonClick={this.onButtonClick}
                                    caption="Cortar imagem"
                                />
                            </Fragment>
                        ) : null}
                    </AnterosCol>
                </AnterosRow>
            </Fragment>
        );
    }
}




class AnterosNavigator extends Component {
    constructor(props) {
        super(props);
        this.state = { active: undefined };
        this.handleSelectLink = this.handleSelectLink.bind(this);
    }

    handleSelectLink(item) {
        this.setState({ active: item });
        if (this.props.handleSelectLink) {
            this.props.handleSelectLink(item)
        }
    }

    static get componentName() {
        return "AnterosNavigator";
    }

    render() {
        let children = [];
        if (this.props.children) {
            let _this = this;
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                let active = child.props.active;
                if (_this.state.active) {
                    active = false;
                    if (_this.state.active == child.props.caption) {
                        active = true;
                    }
                }

                children.push(
                    React.createElement(
                        AnterosNavigatorLink,
                        {
                            key: lodash.uniqueId(),
                            active: active,
                            href: child.props.href,
                            disabled: child.props.disabled,
                            caption: child.props.caption,
                            icon: child.props.icon,
                            onSelectLink: child.props.onSelectLink,
                            handleSelectLink: _this.handleSelectLink,
                            activeBackColor: _this.props.activeBackColor,
                            activeColor: _this.props.activeColor,
                            backgroundColor: _this.props.backgroundColor,
                            color: _this.props.color
                        },
                        child.props.children
                    )
                );
            });
        }

        let className = "nav";
        if (this.props.align == "center") {
            className += " justify-content-center";
        }

        if (this.props.align == "right") {
            className += " justify-content-end";
        }

        if (this.props.stack == "vertical") {
            className += " flex-sm-column";
        }

        if (this.props.pillFormat) {
            className += " nav-pills";
        }

        if (this.props.justified) {
            className += " nav-fill nav-justified";
        }

        return <ul className={className}>{children}</ul>;
    }
}

AnterosNavigator.propTypes = {
    handleSelectLink: PropTypes.func,
    align: PropTypes.string,
    stack: PropTypes.string,
    pillFormat: PropTypes.bool,
    justified: PropTypes.bool,
    activeBackColor: PropTypes.string,
    activeColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    color: PropTypes.string
};

AnterosNavigator.defaultProps = {
    align: "left",
    stack: "horizontal",
    pillFormat: false,
    justified: false,
    activeBackColor: undefined,
    activeColor: undefined,
    backgroundColor: undefined,
    color: undefined
};


class AnterosNavigatorLink extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.preventDefault();
        if (!this.props.disabled) {
            if (this.props.handleSelectLink) {
                this.props.handleSelectLink(this.props.caption);
            }
            if (this.props.onSelectLink) {
                this.props.onSelectLink(event);
            }
        }
    }

    static get componentName() {
        return "AnterosNavigatorLink";
    }

    render() {
        let className = "nav-link";
        if (this.props.active) {
            className += " active";
        }

        if (this.props.disabled) {
            className += " disabled";
        }

        let icon;
        if (this.props.icon) {
            icon = <i className={this.props.icon} />;
        }

        let style = {};
        if (
            this.props.activeBackColor &&
            this.props.activeColor &&
            this.props.active
        ) {
            style = {
                backgroundColor: this.props.activeBackColor,
                color: this.props.activeColor
            };
        }

        if (this.props.backgroundColor && this.props.color && !this.props.active) {
            style = {
                backgroundColor: this.props.backgroundColor,
                color: this.props.color
            };
        }

        return (
            <li className="nav-item">
                <a
                    style={style}
                    onClick={this.onClick}
                    className={className}
                    href={this.props.href}
                >
                    {icon}
                    <img src={this.props.image} /> {this.props.caption}
                    {this.props.badge}
                </a>
            </li>
        );
    }
}

AnterosNavigatorLink.propTypes = {
    active: PropTypes.bool,
    href: PropTypes.string,
    disabled: PropTypes.bool,
    caption: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    onSelectLink: PropTypes.func
};

AnterosNavigatorLink.defaultProps = {
    active: false,
    href: undefined,
    disabled: false
};
