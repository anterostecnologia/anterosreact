import React from 'react'
import ReactDOM from 'react-dom'
import "dropzone/dist/dropzone.css";



let Dropzone = null

var componentConfig = {
    iconFiletypes: ['.jpg', '.png', '.gif', 'pdf'],
    showFiletypeIcon: true,
    postUrl: '/uploadHandler'
};


export class AnterosDropzone extends React.Component {
    constructor(props) {
        super(props)

        this.state = { files: [] }
        this.clear = this.clear.bind(this);
    }


    getconfigDropzoneJs() {
        let options = null
        const defaults = {
            url: this.props.config.postUrl ? this.props.config.postUrl : null
        }

        if (this.props.configDropzoneJs) {
            options = extend(true, {}, defaults, this.props.configDropzoneJs)
        } else {
            options = defaults
        }

        return options
    }

    componentDidMount() {


        const options = this.getconfigDropzoneJs()

        Dropzone = Dropzone || require('dropzone')
        Dropzone.autoDiscover = false
        if (this.props.language == 'pt-BR') {
            Dropzone.prototype.defaultOptions.dictDefaultMessage = "Arraste os arquivos aqui";
            Dropzone.prototype.defaultOptions.dictFallbackMessage = "Seu navegador não suporta arrastar arquivos.";
            Dropzone.prototype.defaultOptions.dictFallbackText = "Use o formulário de retorno abaixo para fazer o upload de seus arquivos como nos dias anteriores.";
            Dropzone.prototype.defaultOptions.dictFileTooBig = "Arquivos é muito grande ({{filesize}}MiB). Máximo permitido: {{maxFilesize}}MiB.";
            Dropzone.prototype.defaultOptions.dictInvalidFileType = "Você não pode fazer envio deste tipo de arquivo.";
            Dropzone.prototype.defaultOptions.dictResponseError = "Servidor respondeu com o seguinte código {{statusCode}}.";
            Dropzone.prototype.defaultOptions.dictCancelUpload = "Cancelar envio";
            Dropzone.prototype.defaultOptions.dictCancelUploadConfirmation = "Você tem certeza que quer cancelar o envio?";
            Dropzone.prototype.defaultOptions.dictRemoveFile = "Remover arquivo";
            Dropzone.prototype.defaultOptions.dictMaxFilesExceeded = "Você não pode enviar mais arquivos.";
        }

        if (!this.props.config.postUrl && !this.props.onDrop) {
            console.info('Neither postUrl nor a "drop" eventHandler specified, the React-Dropzone component might misbehave.')
        }

        var dropzoneNode = this.props.config.dropzoneSelector || ReactDOM.findDOMNode(this)
        this.dropzone = new Dropzone(dropzoneNode, options)
        this.setupEvents()
    }

    componentWillUnmount() {
        if (this.dropzone) {
            const files = this.dropzone.getActiveFiles();
            if (files.length > 0) {
                this.queueDestroy = true
                const destroyInterval = window.setInterval(() => {
                    if (this.queueDestroy === false) {
                        return window.clearInterval(destroyInterval)
                    }
                    if (this.dropzone.getActiveFiles().length === 0) {
                        this.dropzone = this.destroy(this.dropzone)
                        return window.clearInterval(destroyInterval)
                    }
                }, 500)
            } else {
                this.dropzone = this.destroy(this.dropzone)
            }
        }
    }


    componentDidUpdate() {
        this.queueDestroy = false

        if (!this.dropzone) {
            const dropzoneNode = this.props.config.dropzoneSelector || ReactDOM.findDOMNode(this)
            this.dropzone = new Dropzone(dropzoneNode, this.getconfigDropzoneJs())
        }
    }

    componentWillUpdate() {
        let configDropzoneJsObj
        let postUrlConfigObj

        configDropzoneJsObj = this.props.configDropzoneJs ? this.props.configDropzoneJs : {}

        try {
            postUrlConfigObj = this.props.config.postUrl ? { url: this.props.config.postUrl } : {}
        } catch (err) {
            postUrlConfigObj = {}
        }

        this.dropzone.options = extend(true, {}, this.dropzone.options, configDropzoneJsObj, postUrlConfigObj)
    }

    render() {
        const icons = []
        const { files } = this.state
        const { config } = this.props
        const className = (this.props.className) ? 'filepicker dropzone ' + this.props.className : 'filepicker dropzone'

        if (config.showFiletypeIcon && config.iconFiletypes && (!files || files.length < 1)) {
            for (var i = 0; i < this.props.config.iconFiletypes.length; i = i + 1) {
                icons.push(<IconDropZone filetype={config.iconFiletypes[i]} key={'icon-component' + i} />)
            }
        }

        if (!this.props.config.postUrl && this.props.action) {
            return (
                <form action={this.props.action} className={className}>
                    {icons}
                    {this.props.children}
                </form>
            )
        } else {
            return (
                <div className={className}> {icons} {this.props.children} </div>
            )
        }
    }


    setupEvents() {
        const eventHandlers = {
            init: this.props.onInit,
            drop: this.props.onDrop,
            dragstart: this.props.onDragStart,
            dragend: this.props.onDragEnd,
            dragenter: this.props.onDragEnter,
            dragover: this.props.onDragOver,
            dragleave: this.props.onDragLeave,
            addedfile: this.props.onAddedFile,
            removedfile: this.props.onRemovedFile,
            thumbnail: this.props.onThumbnail,
            error: this.props.onError,
            processing: this.props.onProcessing,
            uploadprogress: this.props.onUploadProgress,
            sending: this.props.onSending,
            success: this.props.onSuccess,
            complete: this.props.onComplete,
            canceled: this.props.onCanceled,
            maxfilesreached: this.props.onMaxFilesReached,
            maxfilesexceeded: this.props.onMaxFilesExceeded,
            processingmultiple: this.props.onProcessingMultiple,
            sendingmultiple: this.props.onSendingMultiple,
            successmultiple: this.props.onSuccessMultiple,
            completemultiple: this.props.onCompleteMultiple,
            canceledmultiple: this.props.onCanceledMultiple,
            totaluploadprogress: this.props.onTotalUploadProgress,
            reset: this.props.onReset,
            queuecomplete: this.props.onQueueComplete
        }

        if (!this.dropzone || !eventHandlers) return

        for (var eventHandler in eventHandlers) {
            if (eventHandlers.hasOwnProperty(eventHandler) && eventHandlers[eventHandler]) {
                if (Object.prototype.toString.call(eventHandlers[eventHandler]) === '[object Array]') {
                    for (var i = 0; i < eventHandlers[eventHandler].length; i = i + 1) {
                        if (eventHandler === 'init') {
                            eventHandlers[eventHandler][i](this.dropzone)
                        } else {
                            this.dropzone.on(eventHandler, eventHandlers[eventHandler][i])
                        }
                    }
                } else {
                    if (eventHandler === 'init') {
                        eventHandlers[eventHandler](this.dropzone)
                    } else {
                        this.dropzone.on(eventHandler, eventHandlers[eventHandler])
                    }
                }
            }
        }

        this.dropzone.on('addedfile', (file) => {
            if (!file) return

            const files = this.state.files || []

            files.push(file)
            this.setState({ files })
        })

        this.dropzone.on('removedfile', (file) => {
            if (!file) return

            const files = this.state.files || []
            files.forEach((fileInFiles, i) => {
                if (fileInFiles.name === file.name && fileInFiles.size === file.size) {
                    files.splice(i, 1)
                }
            })

            this.setState({ files })
        })
    }

    clear() {
        if (this.dropzone)
            this.dropzone.removeAllFiles(true);
        this.setState({ files: [] });
    }

    destroy(dropzone) {
        dropzone.off()
        return dropzone.destroy()
    }
}

class IconDropZone extends React.Component {
    render() {
        return <div data-filetype={this.props.filetype} className='filepicker-file-icon' />
    }
}


var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
    if (typeof Array.isArray === 'function') {
        return Array.isArray(arr);
    }

    return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
    if (!obj || toStr.call(obj) !== '[object Object]') {
        return false;
    }

    var hasOwnConstructor = hasOwn.call(obj, 'constructor');
    var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    // Not own constructor property must be Object
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    var key;
    for (key in obj) { /**/ }

    return typeof key === 'undefined' || hasOwn.call(obj, key);
};

function extend() {
    var options, name, src, copy, copyIsArray, clone;
    var target = arguments[0];
    var i = 1;
    var length = arguments.length;
    var deep = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }
    if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
        target = {};
    }

    for (; i < length; ++i) {
        options = arguments[i];
        // Only deal with non-null/undefined values
        if (options != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target !== copy) {
                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (typeof copy !== 'undefined') {
                        target[name] = copy;
                    }
                }
            }
        }
    }

    // Return the modified object
    return target;
};

AnterosDropzone.propTypes = {
    configDropzoneJs: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired,
    onInit: React.PropTypes.func,
    onDrop: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onDragend: React.PropTypes.func,
    onDragEnter: React.PropTypes.func,
    onDragOver: React.PropTypes.func,
    onDragLeave: React.PropTypes.func,
    onAddedFile: React.PropTypes.func,
    onRemovedFile: React.PropTypes.func,
    onThumbnail: React.PropTypes.func,
    onError: React.PropTypes.func,
    onProcessing: React.PropTypes.func,
    onUploadProgress: React.PropTypes.func,
    onSending: React.PropTypes.func,
    onSuccess: React.PropTypes.func,
    onComplete: React.PropTypes.func,
    onCanceled: React.PropTypes.func,
    onMaxFilesReached: React.PropTypes.func,
    onMaxFilesExceeded: React.PropTypes.func,
    onProcessingMultiple: React.PropTypes.func,
    onSendingMultiple: React.PropTypes.func,
    onSuccessMultiple: React.PropTypes.func,
    onCompleteMultiple: React.PropTypes.func,
    onCanceledMultiple: React.PropTypes.func,
    onTotalUploadProgress: React.PropTypes.func,
    onReset: React.PropTypes.func,
    onQueueComplete: React.PropTypes.func,
    language: React.PropTypes.string.isRequired

}

AnterosDropzone.defaultProps = {
    configDropzoneJs: {},
    config: {},
    onInit: null,
    onDrop: null,
    onDragStart: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragOver: null,
    onDragLeave: null,
    onAddedFile: null,
    onRemovedFile: null,
    onThumbnail: null,
    onError: null,
    onProcessing: null,
    onUploadProgress: null,
    onSending: null,
    onSuccess: null,
    onComplete: null,
    onCanceled: null,
    onMaxFilesReached: null,
    onMaxFilesExceeded: null,
    onProcessingMultiple: null,
    onSendingMultiple: null,
    onSuccessMultiple: null,
    onCompleteMultiple: null,
    onCanceledMultiple: null,
    onTotalUploadProgress: null,
    onReset: null,
    onQueueComplete: null,
    language: 'pt-BR'
}

export default AnterosDropzone
