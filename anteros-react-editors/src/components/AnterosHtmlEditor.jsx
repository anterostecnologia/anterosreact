var React = require('react')
    , PropTypes = require('prop-types')
    , createReactClass = require('create-react-class')
    , uuid = require('uuid');

const DIRECT_PASSTHROUGH_EVENTS = [
    'Activate',
    'Deactivate',
    'Focus',
    'Hide',
    'Init',
    'Remove',
    'Reset',
    'Show',
    'Submit',
    'Click',
];
const PSEUDO_HIDDEN = { position: 'absolute', left: -200, top: -200, height: 0 };

import lodash from "lodash";
import {AnterosUtils} from "@anterostecnologia/anteros-react-core";
import { buildGridClassNames, columnProps } from "@anterostecnologia/anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "@anterostecnologia/anteros-react-datasource"

function isBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

export default class AnterosHtmlEditor extends React.Component {
    constructor(props) {
        super();
        this.setupPassthroughEvents = this.setupPassthroughEvents.bind(this);
        this.setupEditor = this.setupEditor.bind(this);
        this.createMCEContextForComponent = this.createMCEContextForComponent.bind(this);
        this.initTinyMCE = this.initTinyMCE.bind(this);
        this.clearDropOverride = this.clearDropOverride.bind(this);
        this.flagDropOverride = this.flagDropOverride.bind(this);
        this.isDropOverrideFlagged = this.isDropOverrideFlagged.bind(this);
        this.syncChange = this.syncChange.bind(this);
        this.triggerEventHandler = this.triggerEventHandler.bind(this);
        this.checkForChanges = this.checkForChanges.bind(this);
        this.onTinyMCEChange = this.onTinyMCEChange.bind(this);
        this.onTinyMCEBlur = this.onTinyMCEBlur.bind(this);
        this.onTinyMCEUndo = this.onTinyMCEUndo.bind(this);
        this.onTinyMCERedo = this.onTinyMCERedo.bind(this);
        this.onTinyMCEDrop = this.onTinyMCEDrop.bind(this);
        this.onTextareaChange = this.onTextareaChange.bind(this);

        if (props.dataSource) {
            let value = props.dataSource.fieldByName(props.dataField);
            if (!value) {
                value = '';
            }
            if (isBase64(value)) {
                this.state = { id: uuid(), value: atob(value) };
            } else {
                this.state = { id: uuid(), value: value };
            }
        } else {
            this.state = { id: uuid(), value: props.value };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }


    componentDidMount() {
        this.initStartTime = Date.now();
        if (typeof tinymce !== 'undefined') {
            this.initTinyMCE();
        } else {
            this.initTimeout = setTimeout(this.initTinyMCE, 100);
        }
        this.updateInterval = setInterval(this.checkForChanges, this.props.pollInterval);
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

    componentDidUpdate() {
        $('mce-branding mce-widget mce-label mce-flow-layout-item mce-last').remove();
        if (this.props.focus) {
            var editor = tinymce.get(this.state.id);
            if (editor) { editor.focus(); }
        }
    }

    componentWillUnmount() {
        tinymce.remove(this.state.id);
        clearTimeout(this.initTimeout);
        clearInterval(this.updateInterval);
        this.initTimeout = undefined;
        this.initStartTime = undefined;
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
        if (isBase64(value)) {
            this.setState({ value: atob(value) });
        } else {
            this.setState({ value: value });
        }
    }

    componentWillReceiveProps(nextProps) {
        $('mce-branding mce-widget mce-label mce-flow-layout-item mce-last').remove();
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            if (isBase64(value)) {
                this.setState({ value: atob(value) });
            } else {
                this.setState({ value: value });
            }
        } else {
            this.setState({ value: nextProps.value });
        }

        var editor = tinymce.get(this.state.id);
        if (editor) {
            if (!this.props.ignoreUpdatesWhenFocused || tinymce.focusedEditor !== editor || this.isDropOverrideFlagged()) {
                var bookmark = editor.selection.getBookmark(2, true);
                editor.setContent(this.state.value);
                editor.selection.moveToBookmark(bookmark);
            }
        }
    }

    setupPassthroughEvents(editor) {
        var _this = this, event;

        /* eslint-disable no-loop-func */
        for (var i = 0, len = DIRECT_PASSTHROUGH_EVENTS.length; i < len; ++i) {
            (function (event) {
                editor.on(event.toLowerCase(), function (tinyMCEEvent) {
                    var handler = _this.props['on' + event];
                    if (typeof handler === 'function') {
                        handler(tinyMCEEvent);
                    }
                });
            })(DIRECT_PASSTHROUGH_EVENTS[i])
        }

        var handlers = this.props.otherEventHandlers;
        for (var eventName in handlers) {
            if (handlers.hasOwnProperty(eventName)) {
                editor.on(eventName, handlers[eventName]);
            }
        }
    }

    setupEditor(editor) {
        editor.on('change', this.onTinyMCEChange);
        editor.on('blur', this.onTinyMCEBlur);
        editor.on('drop', this.onTinyMCEDrop);
        editor.on('undo', this.onTinyMCEUndo);
        editor.on('redo', this.onTinyMCERedo);
        this.setupPassthroughEvents(editor);

        if (this.props.onSetupEditor) {
            this.props.onSetupEditor(editor);
        }

        if (this.props.focus) { editor.focus(); }
        this.initTimeout = undefined;
    }

    createMCEContextForComponent() {
        var tinymceConfig = Object.assign(
            {},
            this.props.config,
            {
                selector: '#' + this.state.id,
                setup: this.setupEditor
            }
        );
        tinymce.init(tinymceConfig);
    }

    initTinyMCE() {
        var currentTime = Date.now();
        if (!tinymce) {
            if (currentTime - this.initStartTime > this.props.maxInitWaitTime) {
                this.initTimeout = undefined;
            } else {
                this.initTimeout = setTimeout(this.initTinyMCE, 100);
            }
        } else {
            this.createMCEContextForComponent();
            this.initTimeout = undefined;
        }
    }
    clearDropOverride() {
        this._tempDropOverride = undefined;
        var editor = tinymce.get(this.state.id);
        if (editor) {
            this.syncChange(editor.getContent());
        }
    }

    flagDropOverride() {
        this._tempDropOverride = true;
        if (this._tempDropOverrideTimeout) { clearTimeout(this.clearDropOverride); }
        this._tempDropOverrideTimeout = setTimeout(this.clearDropOverride, 250);
    }

    isDropOverrideFlagged() {
        return this._tempDropOverride;
    }
    syncChange(newValue) {
        if (newValue !== this.state.value) {

            if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
                this.props.dataSource.setFieldByName(this.props.dataField, btoa(newValue));
            } else {
                this.setState({ value: newValue });
            }

            if (this.props.onChange) { this.props.onChange(newValue); }
        }
    }
    triggerEventHandler(handler, event) {
        if (handler) {
            handler(event);
        }
    }
    checkForChanges() {
        var editor = tinymce.get(this.state.id);
        if (tinymce.focusedEditor === editor) {
            if (editor != undefined) {
                var content = editor.getContent();
                if (content !== this.state.value) {
                    this.syncChange(content);
                }
            }
        }
    }
    onTinyMCEChange(tinyMCEEvent) {
        this.syncChange(tinyMCEEvent.target.getContent());
    }
    onTinyMCEBlur(tinyMCEEvent) {
        this.triggerEventHandler(this.props.onBlur, tinyMCEEvent);
        if (this.props.ignoreUpdatesWhenFocused) {
            // if we have been ignoring updates while focused (to preserve cursor position)
            // sync them now that we no longer have focus.
            tinyMCEEvent.target.setContent(this.state.value);
        }
    }
    onTinyMCEUndo(tinyMCEEvent) {
        this.triggerEventHandler(this.props.onUndo, tinyMCEEvent);
        this.syncChange(tinyMCEEvent.target.getContent());
    }
    onTinyMCERedo(tinyMCEEvent) {
        this.triggerEventHandler(this.props.onRedo, tinyMCEEvent);
        this.syncChange(tinyMCEEvent.target.getContent());
    }
    onTinyMCEDrop() {
        // We want to process updates just after a drop, even if processUpdatesWhenFocused
        // is false. The processUpdatesWhenFocused flag exists to keep the cursor from
        // jumping around, and we do not cares so much if the cursor jumps after dropping
        // an image because that is a mouse event. However, ignoring updates right after a
        // drop means that anything that relies on knowing the content has changed is
        // won't actually know.
        this.flagDropOverride();
    }
    onTextareaChange(e) {
        // should only be called when tinymce failed to load and we are getting changes directly in the textarea (fallback mode?)
        this.syncChange(e.target.value);
    }
    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }
        const colClasses = buildGridClassNames(this.props, false, []);
        const className = AnterosUtils.buildClassNames(
            (this.props.className ? this.props.className : ""), (colClasses.length > 0 ? "form-control" : ""));

        // the textarea is controlled by tinymce... and react, neither of which agree on the value
        // solution: keep a separate input element, controlled by just react, that will actually be submitted
        const Component = this.props.component;

        let textArea = <div className={this.props.className} style={this.props.style} >
            <input type="hidden" name={this.props.name} value={this.state.value} readOnly />
            <Component
                id={this.state.id}
                defaultValue={this.state.value}
                onChange={this.onTextareaChange}
                disabled={(this.props.disabled ? true : false)}
                rows={this.props.rows}
                readOnly={readOnly}
                style={this.props.config.inline ? {} : PSEUDO_HIDDEN}
                {...this.props.textareaProps}
            />
        </div>;

        if (colClasses.length > 0) {
            return (<div className={AnterosUtils.buildClassNames(colClasses)}>
                {textArea}
            </div>);
        } else {
            return textArea
        }
    }
}


AnterosHtmlEditor.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    className: PropTypes.string,
    config: PropTypes.object.isRequired,
    name: PropTypes.string,                           // the form name for the input element
    value: PropTypes.string,
    rows: PropTypes.number,
    focus: PropTypes.bool,                            // focus the tinymce element if not already focused
    maxInitWaitTime: PropTypes.number,                // [20000] maximum amount of time to wait, in ms, for tinymce to create an editor before giving up
    style: PropTypes.object,
    ignoreUpdatesWhenFocused: PropTypes.bool,         // tinymce can sometimes have cursor position issues on updates, if you app does not need live updates from the backing model, then set the prop and it will only update when the editor does not have focus

    pollInterval: PropTypes.number.isRequired,        // [1000] inteval to wait between polling for changes in tinymce editor (since blur does not always work), changes are then synced if the editor is focused

    // intercepted events
    onChange: PropTypes.func.isRequired,              // this is a controlled component, we require onChange
    onBlur: PropTypes.func,
    onSetupEditor: PropTypes.func,

    // direct pass through events
    onActivate: PropTypes.func,
    onClick: PropTypes.func,
    onDeactivate: PropTypes.func,
    onFocus: PropTypes.func,
    onHide: PropTypes.func,
    onInit: PropTypes.func,
    onRedo: PropTypes.func,
    onRemove: PropTypes.func,
    onReset: PropTypes.func,
    onShow: PropTypes.func,
    onSubmit: PropTypes.func,
    onUndo: PropTypes.func,

    textareaProps: PropTypes.object.isRequired,       // props passed through to the textarea
    otherEventHandlers: PropTypes.objectOf(
        PropTypes.func.isRequired
    ).isRequired,

}


AnterosHtmlEditor.defaultProps = {
    config: {},
    maxInitWaitTime: 20000,
    pollInterval: 1000,
    textareaProps: {},
    value: '',
    otherEventHandlers: {},
    onChange: function () { },
    component: 'textarea',
};

