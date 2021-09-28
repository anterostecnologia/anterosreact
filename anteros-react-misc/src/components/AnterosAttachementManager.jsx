import React, { Component } from 'react';
import { AnterosPanel, AnterosFlexBox } from "@anterostecnologia/anteros-react-containers";
import { AnterosMasonry } from "@anterostecnologia/anteros-react-masonry";
import { AnterosIcon, AnterosImage } from '@anterostecnologia/anteros-react-image';
import { AnterosText } from '@anterostecnologia/anteros-react-label';
import { AnterosCheckbox } from '@anterostecnologia/anteros-react-editors';
import { AnterosRemoteDatasource, AnterosLocalDatasource } from "@anterostecnologia/anteros-react-datasource";
import PropTypes from 'prop-types';
import { autoBind, processErrorMessage } from '@anterostecnologia/anteros-react-core';
import { AnterosDropzone } from "@anterostecnologia/anteros-react-dropzone";
import { AnterosModal, ModalActions } from '@anterostecnologia/anteros-react-containers';
import { AnterosAlert } from '@anterostecnologia/anteros-react-notification';
import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import { AnterosSweetAlert } from '@anterostecnologia/anteros-react-core';
import { Notification } from "@anterostecnologia/anteros-react-notification";
import { AnterosBlockUi, AnterosLoader } from '@anterostecnologia/anteros-react-loaders';
const placeHolderImage = "https://via.placeholder.com/150x150.png?text=Sem+foto";

const uuidv4 = require('uuid/v4');
const djsConfig = {
    addRemoveLinks: true,
    acceptedFiles: "image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessing,application/vnd.oasis.opendocument.text,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    autoProcessQueue: false
};

const componentConfig = {
    iconFiletypes: ['.jpg', '.png', '.pdf', '.doc', '.docx', '.odt', '.xls', '.xlsx'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
};



class AnterosAttachementManager extends Component {
    constructor(props) {
        super(props);
        this.state = { focusedItem: undefined, loading: false };
        autoBind(this);
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {

    }

    showHideLoad(show) {
        this.setState({
            ...this.state,
            loading: show,
            update: Math.random()
        }, () => {

        })
    }


    getFile(file) {
        var reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onerror = () => { reader.abort(); reject(new Error("Error parsing file")); }
            reader.onload = function () {

                //This will result in an array that will be recognized by C#.NET WebApi as a byte[]
                let bytes = Array.from(new Uint8Array(this.result));

                //if you want the base64encoded file you would use the below line:
                let base64StringFile = btoa(bytes.map((item) => String.fromCharCode(item)).join(""));

                //Resolve the promise with your custom file structure
                resolve({
                    bytes: bytes,
                    base64StringFile: base64StringFile,
                    fileName: file.name,
                    fileType: file.type
                });
            }
            reader.readAsArrayBuffer(file);
        });
    }

    onUpLoadFiles(files) {

        let _this = this;
        _this.setState({ ..._this.state, modalOpen: '', loading: true });
        let lastItem = files.length - 1;
        _this.showHideLoad(true);
        files.forEach(function (f, index) {
            _this.getFile(f.file).then(async (data) => {
                if (_this.props.dataSource instanceof AnterosRemoteDatasource || _this.props.dataSource instanceof AnterosLocalDatasource) {
                    _this.props.dataSource.insert();
                    _this.props.dataSource.setFieldByName(_this.props.fieldNameContent, data.base64StringFile);
                    _this.props.dataSource.setFieldByName(_this.props.fieldNameMimeType, data.fileType);
                    _this.props.dataSource.setFieldByName(_this.props.fieldNameFileName, uuidv4());
                    await _this.props.dataSource.post((error) => {
                        if (error) {
                            _this.setState({ ..._this.state, loading: false, alertIsOpen: false });
                            var result = processErrorMessage(error);
                            Notification.error(result, {
                                position: Notification.POSITION.TOP_RIGHT,
                                autoClose: 5000
                            });
                        }
                    });
                } else {
                    _this.props.dataSource.push({
                        [_this.props.fieldNameContent]: data.base64StringFile,
                        [_this.props.fieldNameMimeType]: data.fileType,
                        [_this.props.fieldNameFileName]: uuidv4()
                    })
                }
                if (lastItem === index) {
                    _this.setState({ ..._this.state, modalOpen: '', loading: false, update: Math.random() });
                    if (_this.props.onAfterSelectFiles) {
                        _this.props.onAfterSelectFiles();
                    }
                }
            });
        });
    }


    onFocusedItem(item) {
        if (this.props.onFocusedItem) {
            this.props.onFocusedItem(item);
        }
        this.setState({ ...this.state, focusedItem: item });
    }

    removeSelectedFiles(callback) {
        let selectedFiles = this.getSelectedFiles();
        if (selectedFiles.length > 0) {
            let _this = this;
            AnterosSweetAlert({
                title: 'Deseja remover o(s) arquivo(s) selecionado(s)?',
                text: "",
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                focusCancel: true
            }).then(function () {
                _this.setState({ ..._this.state, modalOpen: '', loading: true });
                selectedFiles.forEach(async function (file) {
                    if (_this.props.dataSource.gotoRecordByData(file)) {
                        await _this.props.dataSource.delete((error) => {
                            if (error) {
                                _this.setState({ ..._this.state, alertIsOpen: false, loading: false });
                                var result = processErrorMessage(error);
                                Notification.error(result, {
                                    position: Notification.POSITION.TOP_RIGHT,
                                    autoClose: 5000
                                });
                            } else {
                                _this.setState({ ..._this.state, alertIsOpen: false, loading: false });
                            }
                        });
                    }
                });
                if (callback)
                    callback();
            }).catch(function (error) {
                if (callback)
                    callback(error);
                _this.setState({ ..._this.state, alertIsOpen: true, loading: false });
                var result = processErrorMessage(error);
                Notification.error(result, {
                    position: Notification.POSITION.TOP_RIGHT,
                    autoClose: 5000
                });
            });
        }
    }

    getSelectedFiles() {
        let files = [];
        if (this.props.dataSource) {
            this.props.dataSource.getData().forEach(function (file) {
                if (file.checked !== undefined && file.checked === true) {
                    files.push(file);
                }
            });
        }
        return files;
    }

    render() {
        let data = [];
        if (this.props.dataSource instanceof AnterosRemoteDatasource || this.props.dataSource instanceof AnterosLocalDatasource) {
            data = this.props.dataSource.getData();
        } else {
            data = this.props.dataSource;
        }
        return (<AnterosPanel style={{ ...this.props.style }} width={this.props.width} height={this.props.height}>
            <AnterosBlockUi
                tagStyle={{
                    height: 'auto'
                }}
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
                blocking={this.state.loading}
                message={"Aguarde..."}
                loader={
                    <AnterosLoader active type="ball-pulse" color="#02a17c" />
                }
            >
                {this.props.children}
                <AnterosMasonry
                    id="masonryAttachements"
                    className={'my-gallery-class'}
                    elementType={'ul'}
                    options={{
                        transitionDuration: 0,
                        gutter: 10,
                        horizontalOrder: true
                    }}
                    disableImagesLoaded={false}
                    updateOnEachImageLoad={false}>

                    {data && data.length > 0 ? data.map(r => {
                        return (<AnterosAttachementItem
                            onFocusedItem={this.onFocusedItem}
                            key={r.id}
                            record={r}
                            fieldNameId={this.props.fieldNameId}
                            fieldNameContent={this.props.fieldNameContent}
                            fieldNameMimeType={this.props.fieldNameMimeType}
                            fieldNameFileName={this.props.fieldNameFileName}
                            onButtonClick={this.onButtonClick}
                            focused={r === this.state.focusedItem}
                            selected={r.checked} />);
                    }) : <AnterosFlexBox flexDirection="column"
                        style={{ width: "100%", height: "100%" }}
                        alignContent='center'
                        alignItems='center'>
                            <AnterosText h5 color="Silver" text="Clique no botão ações para adicionar ou remover anexos" />
                        </AnterosFlexBox>}
                </AnterosMasonry>
            </AnterosBlockUi>
        </AnterosPanel>);
    }
}

AnterosAttachementManager.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    fieldNameId: PropTypes.string.isRequired,
    fieldNameContent: PropTypes.string.isRequired,
    fieldNameMimeType: PropTypes.string.isRequired,
    fieldNameFileName: PropTypes.string.isRequired
}

AnterosAttachementManager.defaultProps = {
    fieldNameId: 'id',
    fieldNameContent: 'conteudo',
    fieldNameMimeType: 'tipoConteudo',
    fieldNameFileName: 'nome'
}



class AnterosAttachementItem extends Component {
    constructor(props) {
        super(props);
        this.id = "attachement" + this.props.record.id;
        autoBind(this);
    }

    componentDidMount() {
    }

    onFocusedItem(event) {
        this.props.onFocusedItem(this.props.record);
    }

    onSelectItem(value, checked, checkbox) {
        this.props.record.checked = checked;
    }

    getImagem(value, defaultImg) {
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

    base64ToBlob(base64, type) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new Blob([bytes], { type: type });
    };

    openFileDocument() {
        const blob = this.base64ToBlob(this.props.record[this.props.fieldNameContent], this.props.record[this.props.fieldNameMimeType]);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl);
    }

    createContentView() {
        let mimeType = this.props.record[this.props.fieldNameMimeType].toLowerCase();
        if (mimeType.includes("pdf")) {
            return <AnterosIcon icon="far fa-file-pdf" size={96} color="red" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("doc")) {
            return <AnterosIcon icon="far fa-file-word" size={96} color="blue" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("odt")) {
            return <AnterosIcon icon="far fa-file-word" size={96} color="blue" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("excel")) {
            return <AnterosIcon icon="far fa-file-excel" size={96} color="green" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("xls")) {
            return <AnterosIcon icon="far fa-file-excel" size={96} color="green" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("zip")) {
            return <AnterosIcon icon="far fa-file-archive" size={96} color="#FECA1F" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("csv")) {
            return <AnterosIcon icon="far fa-file-csv" size={96} color="#931E30" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("svg")) {
            return <AnterosIcon icon="far fa-image-polaroid" size={96} color="#3CAEA3" onDoubleClick={(event) => { this.openFileDocument() }} />;
        } else if (mimeType.includes("image")) {
            let imgSrc = this.getImagem(this.props.record[this.props.fieldNameContent], placeHolderImage);
            return <AnterosImage src={imgSrc} width="140px" maxHeight={"160px"} onDoubleClick={(event) => { window.open(imgSrc) }} />
        }
    }

    render() {
        return (
            <div onClick={this.onFocusedItem}>
                <AnterosPanel id={this.id}
                    className={
                        this.props.focused
                            ? this.props.record.checked ? 'fm-griditem-file-focused fm-griditem-file-selected' : 'fm-griditem-file-focused'
                            : this.props.record.checked ? 'fm-griditem-file-selected' : 'fm-griditem-file'
                    }
                    style={{ overflow: "hidden" }}>
                    <AnterosCheckbox
                        small={12}
                        id={"chSelected" + this.props.record.index}
                        style={{
                            color: '#464D69', position: 'absolute', zIndex: 22
                        }}
                        value=""
                        checked={this.props.selected}
                        valueChecked={true}
                        onCheckboxChange={this.onSelectItem}
                        valueUnchecked={false}
                    />
                    <div style={{ height: "160px", alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                        {this.createContentView()}
                    </div>
                    <div style={{ height: "30px", alignItems: 'center', justifyContent: 'center', display: 'flex', paddingLeft: '6px', paddingRight: '6px' }}>
                        <AnterosText text={this.props.record[this.props.fieldNameFileName]} truncate={true} fontSize={10} />
                    </div>
                </AnterosPanel>
            </div>
        );
    }
}


class AnterosAttachementUploadModal extends Component {

    constructor(props) {
        super(props);
        this.state = { files: [] };
        autoBind(this);
    }


    handleSubmit(files, allFiles) {
        this.props.onClickOk(allFiles);
    }

    onChangeStatus(fileWithMeta, status, files) {
        if (status === "rejected_file_type") {
            AnterosSweetAlert({
                title: 'Formato de arquivo não suportado!',
                text: "",
                type: 'warning',
            })
        } else if (status === "error_file_size") {
            AnterosSweetAlert({
                title: 'Arquivo muito grande!',
                text: "",
                type: 'warning',
            })
        }
    }

    render() {
        return (
            <AnterosModal
                id="modalUploadFiles"
                title="Upload de arquivos"
                primary
                large
                showHeaderColor={true}
                showContextIcon={false}
                isOpen={this.props.modalOpen === "attachementUploadModal"}
                onClose={this.onClose}
            >
                <AnterosAlert
                    danger
                    fill
                    isOpen={this.state.alertIsOpen}
                    autoCloseInterval={15000}
                >
                    {this.state.alertMessage}
                </AnterosAlert>
                <ModalActions>
                    <AnterosButton danger dataUser="btnCancel" onClick={this.props.onClickCancel}>
                        Cancela
                      </AnterosButton>
                </ModalActions>
                <div>
                    <AnterosDropzone ref={(c) => this.dropZoneRef = c} configDropzoneJs={djsConfig} config={componentConfig}
                        accept={this.props.accept ? this.props.accept : djsConfig.acceptedFiles}
                        maxSizeBytes={53000000}
                        onSubmit={this.handleSubmit} width="800px" height="600px"
                        onChangeStatus={this.onChangeStatus}
                    />
                </div>
            </AnterosModal>
        );
    }
}

export { AnterosAttachementManager, AnterosAttachementUploadModal };
