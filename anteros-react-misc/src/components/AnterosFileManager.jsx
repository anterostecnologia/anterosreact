import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import { AnterosModal, AnterosPanel, ModalActions,
    AnterosFlexContainer, AnterosFlexElement, AnterosFlexSplitter } from "@anterostecnologia/anteros-react-containers";
import { boundClass } from "@anterostecnologia/anteros-react-core";
import { AnterosDropzone } from "@anterostecnologia/anteros-react-dropzone";
import { AnterosCheckbox } from '@anterostecnologia/anteros-react-editors';
import { AnterosIcon, AnterosImage } from "@anterostecnologia/anteros-react-image";
import { AnterosText } from "@anterostecnologia/anteros-react-label";
import { AnterosBlockUi, AnterosLoader } from '@anterostecnologia/anteros-react-loaders';
import { AnterosMasonry } from "@anterostecnologia/anteros-react-masonry";
import { AnterosAlert } from '@anterostecnologia/anteros-react-notification';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { TailSpin } from "react-loader-spinner";
import { AnterosTreeView } from '@anterostecnologia/anteros-react-treeview';

var djsConfig = {
    addRemoveLinks: true,
    acceptedFiles: "image/jpeg,image/png,image/gif",
    autoProcessQueue: false
};

var componentConfig = {
    iconFiletypes: ['.jpg', '.png', '.gif'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
};


export class AnterosToolbar extends Component {
    render(){
        return (
            <nav className="anteros_widget anteros_toolbar anteros_widget--bordered anteros_widget--bg" style={this.props.style}>
                <ul className="anteros_toolbar anteros_toolbar--horizontal">
                    {this.props.children}
                </ul>
            </nav>
        )
    }
}



export class AnterosToolbarItem extends Component {
    render(){
        let className = "anteros_toolbar__item";
        if (this.props.separate){
            className += " anteros_toolbar__item--separator";
        }
        return (
            <li className={className}>
                {this.props.children}
            </li>
        )
    }
}

@boundClass
class AnterosFileManager extends Component {

    constructor(props) {
        super(props);

        this.state = { modalOpen: undefined, selectedRecord: undefined };
    }

    onButtonClick(event, button) {
        if (button.props.route) {
            this.props.history.push(button.props.route);
        }
    }

    onUpLoadFiles() {
        this.setState({ ...this.state, modalOpen: "modalUploadFiles" })
    }

    onClickOk(files) {
        if (this.state.modalOpen === 'modalUploadFiles') {
            if (this.props.onUpLoadFiles) {
                this.props.onUpLoadFiles(files);
            }
            this.setState({
                ...this.state,
                modalOpen: ""
            })
        }
    }

    onClickCancel(event) {
        if (this.state.modalOpen === 'modalUploadFiles') {
            this.setState({
                ...this.state,
                modalOpen: ""
            })
        }
    }

    onFocusedItem(item) {
        if (this.props.onFocusedItem) {
            this.props.onFocusedItem(item);
        }
        this.setState({ ...this.state, selectedRecord: item });
    }

    onFocusedFolder(folder) {
        this.setState({ ...this.state, selectedFolder: folder });
        if (this.props.onFocusedFolder) {
            this.props.onFocusedFolder(folder);
        }
    }

    countSelectedFiles() {
        let count = 0;
        if (this.props.dataSourceFiles) {
            this.props.dataSourceFiles.forEach(function (file) {
                if (file.checked !== undefined && file.checked === true) {
                    count++;
                }
            });
        }
        return count;
    }

    render() {
        return <AnterosPanel height={this.props.height} style={{borderRadius: '8px 8px 0 0'}}>
            <AnterosFileToolbar routeClose={this.props.routeClose}
                onRemoveFolder={this.props.onRemoveFolder}
                onAddFolder={this.props.onAddFolder}
                onUpLoadFiles={this.onUpLoadFiles}
                onRemoveFiles={this.props.onRemoveFiles}
                disabledRemoveFolder={!this.state.selectedFolder || this.props.readOnly}
                disabledRemoveFile={this.countSelectedFiles() === 0 || this.props.readOnly}
                disabledUploadFiles={!this.state.selectedFolder || this.props.readOnly}
                disabledDownloadFiles={!this.state.selectedRecord || this.props.readOnly}
                title={this.props.title}
                selected={this.state.selectedRecord}
                onButtonClick={this.onButtonClick}
                style={{ border: 'none', borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
            </AnterosFileToolbar>
            <AnterosBlockUi
                tagStyle={{
                  height: "100%",
                }}
                styleBlockMessage={{
                  border: "2px solid white",
                  width: "200px",
                  height: "80px",
                  padding: "8px",
                  backgroundColor: "rgb(56 70 112)",
                  borderRadius: "8px",
                  color: "white",
                }}
                styleOverlay={{
                  opacity: 0.1,
                  backgroundColor: "black",
                }}
                tag="div"
                blocking={this.props.loading}
                message={"Aguarde..."}
                loader={
                    <TailSpin
                      width="40px"
                      height="40px"
                      ariaLabel="loading-indicator"
                      color="#f2d335"
                    />
                }
              >
                <AnterosFlexContainer orientation="vertical" style={{ height: this.props.contentHeight, backgroundColor: "white" }}>

                    <AnterosFlexElement className="left-pane" minSize="300" size="300">
                        <AnterosFileSideBar onFocusedFolder={this.onFocusedFolder} selectable={this.props.selectableFolder} dataSource={this.props.dataSourceFolders} />
                    </AnterosFlexElement>

                    <AnterosFlexSplitter />

                    <AnterosFlexElement className="right-pane">
                        <AnterosFilePreview style={{ border: 'none' }} height="70vh"
                            onFocusedItem={this.onFocusedItem}
                            dataSource={this.props.dataSourceFiles}>

                        </AnterosFilePreview>
                    </AnterosFlexElement>

                </AnterosFlexContainer>
            </AnterosBlockUi>
            <UploadFilesModal modalOpen={this.state.modalOpen} onClickOk={this.onClickOk} onClickCancel={this.onClickCancel} />
        </AnterosPanel>
    }
}

AnterosFileManager.defaultProps = {
    readOnly: false,
    height: "800px",
    contentHeight: "750px"
}

@boundClass
class UploadFilesModal extends Component {

    constructor(props) {
        super(props);
        this.state = { files: [] };
    }


    handleSubmit(files, allFiles) {
        this.props.onClickOk(allFiles);
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
                isOpen={this.props.modalOpen === "modalUploadFiles"}
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
                        onSubmit={this.handleSubmit} width="800px" height="600px" />
                </div>
            </AnterosModal>
        );
    }
}


@boundClass
class AnterosFileSideBar extends Component {

    render() {
        return (<AnterosTreeView
            id="treeview"
            ref="treeview"
            width={this.props.width} height={this.props.height}
            dataSource={this.props.dataSource}
            onChangedDataSource={this.onChangedDataSource}
            onSelectedNode={this.props.onSelectedNode}
            onUnSelectedNode={this.props.onUnSelectedNode}
            onExpandedNode={this.props.onUnSelectedNode}
            onCollapsedNode={this.props.onUnSelectedNode}
            onLoadDataSource={this.props.onLoadDataSource}
            onFocusedNode={this.props.onFocusedFolder}
            color={"#428bca"}
            enableLinks={false}
            showBorder={false}
            showTags={false}
            selectable={this.props.selectable} />);
    }
}

AnterosFileSideBar.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string
}

AnterosFileSideBar.defaultProps = {
    width: "100%",
    height: "calc(100% - 20px)"
}

@boundClass
class AnterosFilePreview extends Component {
    constructor(props) {
        super(props);
        this.state = { focusedFile: undefined };
    }

    onFocusedItem(file) {
        if (this.props.onFocusedItem) {
            this.props.onFocusedItem(file);
        }
        this.setState({ ...this.state, focusedFile: file });
    }

    render() {
        return (<AnterosPanel style={{ ...this.props.style }} width={this.props.width} height={this.props.height}>
            <AnterosMasonry
                id="masonryFiles"
                className={'my-gallery-class'}
                elementType={'ul'}
                options={{
                    transitionDuration: 0,
                    gutter: 10,
                    horizontalOrder: true
                }}
                disableImagesLoaded={false}
                updateOnEachImageLoad={false}>

                {this.props.dataSource ? this.props.dataSource.map(r => {
                    if (!r.isDirectory)
                        return (<FileItem onFocusedItem={this.onFocusedItem} key={r.id} record={r} onButtonClick={this.onButtonClick} focused={r === this.state.focusedFile} selected={r.checked} />);
                    return null;
                }) : null}
            </AnterosMasonry>
        </AnterosPanel>);
    }
}

@boundClass
class FileItem extends React.Component {

    constructor(props) {
        super(props);
        this.id = "fileItem" + this.props.record.id;
    }

    componentDidMount() {
    }

    onFocusedItem(event) {
        this.props.onFocusedItem(this.props.record);
    }

    onSelectItem(value, checked, checkbox) {
        this.props.record.checked = checked;
    }

    createContentView() {
        if (this.props.record.directory) {
            return <AnterosIcon icon="far fa-folder" size={28} />;
        } else if (this.props.record.mimetype.includes("pdf")) {
            return <AnterosIcon icon="far fa-file-pdf" size={96} color="red" />;
        } else if (this.props.record.mimetype.includes("doc")) {
            return <AnterosIcon icon="far fa-file-word" size={96} color="blue" />;
        } else if (this.props.record.mimetype.includes("excel")) {
            return <AnterosIcon icon="far fa-file-excel" size={96} color="green" />;
        } else if (this.props.record.mimetype.includes("zip")) {
            return <AnterosIcon icon="far fa-file-archive" size={96} color="#FECA1F" />;
        } else if (this.props.record.mimetype.includes("csv")) {
            return <AnterosIcon icon="far fa-file-csv" size={96} color="#931E30" />;
        } else if (this.props.record.mimetype.includes("svg")) {
            return <AnterosIcon icon="far fa-image-polaroid" size={96} color="#3CAEA3" />;
        } else if (this.props.record.mimetype.includes("image")) {
            return <AnterosImage src={this.props.record.url + "/preview#"} width="140px" maxHeight={"160px"} />
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
                        <AnterosText text={this.props.record.name} truncate={true} fontSize={10} />
                    </div>
                </AnterosPanel>
            </div>
        );
    }

}


FileItem.propTypes = {
    index: PropTypes.number,
    record: PropTypes.object
}

AnterosFilePreview.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string
}

AnterosFilePreview.defaultProps = {
    width: "100%",
    height: "100%"
}

@boundClass
class AnterosFileToolbar extends Component {

    onUpLoadFiles() {
        if (this.props.onUpLoadFiles) {
            this.props.onUpLoadFiles();
        }
    }

    downloadFile(url, fileName) {
        var a = document.createElement("a");
        a.href = url;
        a.setAttribute("download", fileName);
        a.click();
    }


    onDownloadClick(event) {
        this.downloadFile(this.props.selected.url + "/download#", this.props.selected.name);
    }

    render() {
        return (<AnterosPanel className="d-flex justify-content-between" style={{
            ...this.props.style, alignItems: 'center', border:0,backgroundColor: '#eceff1',
            padding: '10px'
        }} width={this.props.width} height={this.props.height}>
            <div style={{ width: "500px" }}>
                <AnterosText text={this.props.title} />
            </div>
            <AnterosToolbar style={{width:'300px', backgroundColor:'transparent', border:'0'}}>
                <AnterosToolbarItem>
                    <AnterosButton hint="Nova pasta" hintPosition="down" primary style={{ width: "38px", color: '#10c1de', fontSize: '20px' }} icon="far fa-folder-plus" onButtonClick={this.props.onAddFolder} />
                </AnterosToolbarItem>
                <AnterosToolbarItem>
                    <AnterosButton hint="Remover pasta" hintPosition="down" primary style={{ width: "38px", color: '#e47777', fontSize: '20px' }} icon="far fa-folder-minus" onButtonClick={this.props.onRemoveFolder} disabled={this.props.disabledRemoveFolder} />
                </AnterosToolbarItem>
                <AnterosToolbarItem separate={true} />
                <AnterosToolbarItem>
                    <AnterosButton hint="Remover arquivo" hintPosition="down" primary style={{ width: "38px", color: '#e47777', fontSize: '20px' }} icon="far fa-trash" onButtonClick={this.props.onRemoveFiles} disabled={this.props.disabledRemoveFile} />
                </AnterosToolbarItem>
                <AnterosToolbarItem>
                    <AnterosButton hint="Upload arquivo" hintPosition="down" primary style={{ width: "38px", color: '#28a745', fontSize: '20px', paddingLeft: '6px' }} icon="far fa-cloud-upload-alt" onButtonClick={this.onUpLoadFiles} disabled={this.props.disabledUploadFiles} />
                </AnterosToolbarItem>
                <AnterosToolbarItem>
                    <AnterosButton  hint="Download arquivo" hintPosition="down" primary style={{ width: "38px", color: '#dfec19', fontSize: '20px', paddingLeft: '6px' }} icon="far fa-cloud-download-alt" onButtonClick={this.onDownloadClick} disabled={this.props.disabledDownloadFiles} />
                </AnterosToolbarItem>
                <AnterosToolbarItem separate={true} />
                <AnterosToolbarItem>
                    <AnterosButton
                        id="btnClose"
                        hint="Fechar"
                        hintPosition="down"
                        style={{ width: "38px" }}
                        onButtonClick={this.props.onButtonClick}
                        route={this.props.routeClose}
                        icon="fa fa-times"
                        small
                        secondary
                    />
                </AnterosToolbarItem>
            </AnterosToolbar>
        </AnterosPanel>);
    }
}

AnterosFileToolbar.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string
}

AnterosFileToolbar.defaultProps = {
    width: "100%",
    height: "60px"
}

export default AnterosFileManager;