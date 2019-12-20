import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import lodash from 'lodash';
import { AnterosUtils, AnterosSweetAlert } from 'anteros-react-core';
import { buildGridClassNames, columnProps } from 'anteros-react-layout';
import {
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
  dataSourceEvents
} from 'anteros-react-datasource';
import PropTypes from 'prop-types';
import { AnterosButton } from 'anteros-react-buttons';
import {
  AnterosModal,
  AnterosPageControl,
  AnterosTab,
  PageHeaderActions
} from 'anteros-react-containers';
import { AnterosNavigator, AnterosNavigatorLink } from 'anteros-react-menu';
import { AnterosCol, AnterosRow } from 'anteros-react-layout';
import { AnterosDropzone } from 'anteros-react-dropzone';
import AnterosWebcam from './AnterosWebcam';
import AnterosImageCropper from './AnterosImageCropper';
 

const $ = window.$;

let base64ImageFile = function(imageFile) {
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

    if (this.props.dataSource.isEmptyField(this.props.dataField)) {
      this.props.dataSource.setFieldByName(this.props.dataField, '');
    }
    this.dsImage = new AnterosLocalDatasource();
    this.dsImage.open();
    this.dsImage.insert();
    this.dsImage.setFieldByName(
      'editedImg',
      this.props.dataSource.fieldByName(this.props.dataField)
    );
    this.dsImage.post();

    this.state = {...this.state, cropping: true};
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
      readOnly = this.props.dataSource.getState() === 'dsBrowse';
    }
    if (!readOnly && !this.props.disabled) {
      $('#' + this.idImage + '_input').click();
    }
  }

  saveImg(isConfirm) {
    if (isConfirm) {
      this.dsImage.post();
      this.props.dataSource.setFieldByName(
        this.props.dataField,
        this.dsImage.fieldByName('editedImg')
      );
      this.setState({ ...this.state, modal: false });
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
        .then(function(isConfirm) {
          _this.saveImg(isConfirm);
          return;
        })
        .catch(function(reason) {
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
        .then(function(isConfirm) {
          if (isConfirm) {
            _this.dsImage.cancel();
            _this.setState({ ..._this.state, modal: false });
          }
          return;
        })
        .catch(function(reason) {
          // quando apertar o botao "Não" cai aqui. Apenas ignora. (sem processamento necessario)
        });
    }
  }

  onCloseButton(event) {
    this.dsImage.cancel();
    this.setState({ ...this.state, modal: false });
  }

  render() {
    const colClasses = buildGridClassNames(this.props, false, []);
    let className = AnterosUtils.buildClassNames(
      colClasses.length > 0 || this.props.icon ? 'form-control' : '',
      'fileUpload'
    );

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
              style={{ border: 0, height: this.props.height }}
              id={this.idImage}
            >
              <img
                alt={this.props.alt ? this.props.alt : ''}
                src={
                  this.state.value && this.state.value !== ''
                    ? isBase64(this.state.value)
                      ? 'data:image;base64,' + this.state.value
                      : this.state.value
                    : null
                }
                style={{
                  ...this.props.style,
                  width: this.props.width,
                  height: this.props.height,
                  border: '1px solid silver'
                }}
                onDoubleClick={this.onDoubleClickImage}
              />
              <input
                id={this.idImage + '_input'}
                type="file"
                className="imageUpload"
                onChange={this.onSelect}
                ref="input"
                style={{ display: 'none' }}
              />
            </div>
            <AnterosImagePickerEdicao
              id={this.idImage + '_modal'}
              isOpen={this.state.modal}
              showCloseButton={this.props.showCloseButton}
              onCloseButton={this.onCloseButton}
              onButtonClick={this.onButtonClick}
              handleSaveWhileEditing={this.saveImg}
              dataSource={this.dsImage}
              dataField={'editedImg'}
              minSize={this.props.minSize}
              captureWidth={this.props.captureWidth}
              captureHeight={this.props.captureHeight}
              ref={this.AnterosImagePickerEdicaoRef}
            />
          </div>
          <AnterosButton
            secondary
            id="btnEditImg"
            icon="fal fa-image"
            visible={!this.props.disabled}
            onButtonClick={this.onButtonClick}
            caption="Editar a imagem"
          />
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
              src={
                this.state.value && this.state.value !== ''
                  ? isBase64(this.state.value)
                    ? 'data:image;base64,' + this.state.value
                    : this.state.value
                  : null
              }
              style={{
                ...this.props.style,
                height: this.props.height,
                border: '1px solid silver'
              }}
              onDoubleClick={this.onDoubleClickImage}
            />
            <input
              id={this.idImage + '_input'}
              type="file"
              className="imageUpload"
              onChange={this.onSelect}
              ref="input"
              style={{ display: 'none' }}
            />
            <AnterosImagePickerEdicao
              id={this.idImage + '_modal'}
              isOpen={this.state.modal}
              showCloseButton={this.props.showCloseButton}
              onCloseButton={this.onCloseButton}
              onButtonClick={this.onButtonClick}
              handleSaveWhileEditing={this.saveImg}
              dataSource={this.dsImage}
              dataField={'editedImg'}
              minSize={this.props.minSize}
              captureWidth={this.props.captureWidth}
              captureHeight={this.props.captureHeight}
              ref={this.AnterosImagePickerEdicaoRef}
            />
          </div>
          <AnterosButton
            secondary
            icon="fal fa-image"
            visible={!this.props.disabled}
            onButtonClick={this.onButtonClick}
            caption="Editar a imagem"
          />
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
          _this.props.dataSource.getState() !== 'dsBrowse'
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
  showCloseButton: PropTypes.bool
};

AnterosImagePicker.defaultProps = {
  width: '150px',
  height: '200px',
  readOnly: false,
  value: '',
  disabled:false,
  captureWidth: 480,
  captureHeight: 270,
  showCloseButton: false
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

  clear(){
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
          .then(function(isConfirm) {
            if (_this.props.handleSaveWhileEditing) {
              _this.props.handleSaveWhileEditing(isConfirm);
            }
          })
          .catch(function(reason) {
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
          ref={this.imageContentRef}
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
  showCloseButton: PropTypes.bool
};

AnterosImagePickerEdicao.defaultProps = {
  showCloseButton: false
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
      this.props.dataSource.setFieldByName(
        this.props.dataField,
        image.split(',')[1]
      );
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
      this.props.dataSource.setFieldByName(
        this.props.dataField,
        cutedImg.split(',')[1]
      );
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
          _this.props.dataSource.getState() !== 'dsBrowse'
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
                  isBase64(this.state.currentImage)
                    ? 'data:image;base64,' + this.state.currentImage
                    : this.state.currentImage
                }
              />
            ) : !this.state.cropping ? (
              <h5>Capture, carregue ou cole uma imagem</h5>
            ) : null}
            {this.state.currentImage && this.state.cropping ? (
              <Fragment>
                <AnterosImageCropper
                  crossOrigin="true" // boolean, set it to true if your image is cors protected or it is hosted on cloud like aws s3 image server
                  src={
                    isBase64(this.state.currentImage)
                      ? 'data:image;base64,' + this.state.currentImage
                      : this.state.currentImage
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
                  aspectRatio={this.props.width / this.props.height}
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
