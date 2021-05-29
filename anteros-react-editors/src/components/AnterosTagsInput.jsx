import React, { createRef, Component } from "react";
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';

var ERROR = {
    EMPTY: 'TagEmptyError',
    REPEAT: 'TagRepeatError'
}
var ERROR_MSG = {
    'TagEmptyError': 'Tag não deve ser vazia',
    'TagRepeatError': 'Tag dever ser única'
}
var KEYS = {
    BACKSPACE: 8,
    LEFT: 37,
    RIGHT: 39
}

var utils = {
    uuid() {
        var i, random
        var uuid = ''
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-'
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
            .toString(16)
        }
        return uuid
    },
    getCharcode(e) {
        var charCode = e.charCode
        return (typeof charCode === "number" && charCode !== 0 )? charCode: e.keyCode
    },
    setCaretPos(input_node, pos) {
        if (input_node.setSelectionRange) {
            input_node.setSelectionRange(pos, pos)
        } else if (input_node.createTextRange) {
            input_node.createTextRange().move('character', pos)
        }
        input_node.focus()
    },
    getCaretPos(input_node) {
        return 'selectionStart' in input_node? input_node.selectionStart: Math.abs(document.selection.createRange().moveStart('character', -input_node.value.length))
    },
    autoSize(node) {
        var mirror = document.querySelector('.tag-editor-mirror')
        if (!mirror) {
            mirror = document.createElement('div')
            mirror.setAttribute('class', 'tag-editor-mirror')
            document.body.appendChild(mirror)
        }
        mirror.textContent = node.value
        node.style.width = getComputedStyle(mirror).width
    },
    error(name, message) {
        var error = new Error(message)
        error.name = name
        return error
    }
}

class TagStore {
    constructor(options) {
        this.tags = []
        this.options = options || {
            validate: function() {}
        }
        this._listeners = []
    }
    subscribe(fn) {
        this._listeners.push(fn)
    }
    broadcast() {
        this._listeners.forEach(fn => {
            fn()
        })
    }
    add(text, cb) {
        var newTag = {
            id: utils.uuid(),
            text: text
        }
        this.tags.push(newTag)
        cb && cb({}, newTag, this.tags.length - 1)
        this.broadcast()
    }
    index(text) {
        var tagIndex = -1
        for(var i = 0, l = this.tags.length; i < l; i++) {
            if (text === this.tags[i].text) {
                tagIndex = i
                break
            }
        }
        return tagIndex
    }
    insertAfterTag(tag, text, cb) {
        var tagIndex
          , newTag
        this.tags.forEach((t, i) => {
            if (t.id === tag.id) {
                tagIndex = i
            }
        })
        if (tagIndex === void 0) {
            return
        }
        newTag = {
            id: utils.uuid(),
            text: text
        }
        this.tags.splice(tagIndex + 1, 0, newTag)
        cb && cb(null, newTag, tagIndex + 1)
    }
    validate(tagToSave, text) {
        // tags should
        // * be unique
        // * length > 0
        if (!text.length) {
            throw utils.error(ERROR.EMPTY, ERROR_MSG[ERROR.EMPTY])
        }
        for(var i = 0, l = this.tags.length; i < l; i++) {
            var tag = this.tags[i]
            if (tag === tagToSave) { continue }
            if (tag.text.trim() === text.trim()) {
                throw utils.error(ERROR.REPEAT, ERROR_MSG[ERROR.REPEAT])
            }
        }
        this.options.validate(text, this.output())
    }
    save(tagToSave, text, cb) {
        try {
            this.validate(tagToSave, text)

            this.tags.forEach(tag => {
                if (tag === tagToSave) {
                    tag.text = text
                }
            })
            cb && cb()
            this.broadcast()
        } catch(exception) {
            cb(exception)
        }
    }
    remove(tag) {
        var text = (typeof tag === "string")? tag: tag.text
        this.tags = this.tags.filter(candidate => {
            return candidate.text !== text
        })
        this.broadcast()
    }
    output() {
        return this.tags.map(function(tag) {
            return tag.text
        })
    }
}

var connectToStore = TagEditor => (class extends Component {
    constructor() {
        super()
        this.state = { store: null }
    }
    componentDidMount() {
        var store = new TagStore({
            validate: this.props.validate || function() {}
        })
        this.props.tags.forEach(tag => {
            store.add(tag)
        })
        this.setState({
            store: store
        })
        store.subscribe(() => {
            this.setState({
                store: store
            })
        })
    }
    add(text) {
        var store = this.state.store
          , tagIndex = store.index(text)
        if (tagIndex > -1) {
            store.save(store.tags[tagIndex], text)
        } else {
            store.add(text)
        }
    }
    remove(text) {
        this.state.store.remove(text)
    }
    output() {
        return this.state.store.output()
    }
    render() {
        return <TagEditor {...this.props} store={this.state.store} />
    }
})

class Tag extends Component {
    constructor(props) {
        super(props)
        this.inputRef = createRef()
    }
    componentDidMount() {
        var node = this.inputRef.current
        if (this.props.active) {
            node.focus()
        } else {
            node.blur()
        }
        utils.autoSize(node)
    }
    componentWillReceiveProps(nextProps) {
        var node = this.inputRef.current
          , tagNode = findDOMNode(this)
          , activityChanged = this.props.active !== nextProps.active

        if (nextProps.active) {
            utils.setCaretPos(node, nextProps.caret)
        } else {
            node.blur()
        }
    }
    handleClick(e) {
        e.stopPropagation()
        if (e.target.tagName === 'A') {
            // click on X to remove
            this.props.onRemove()
        }
    }
    handleFocus() {
        this.props.onFocus()
    }
    handleBlur() {
        var node = this.inputRef.current
        this.props.onSave(node.value)
    }
    handleKeyDown(e) {
        var charCode = utils.getCharcode(e)
        for (var key in KEYS) {
            if (KEYS[key] === charCode) {
                keyHandlers[key].call(this, {
                    originalEvent: e,
                    caret: utils.getCaretPos(this.inputRef.current),
                    node: this.inputRef.current
                })
            }
        }
        if (this.props.delimiterKeys.indexOf(charCode) > -1) {
            e.preventDefault()
            var node = this.inputRef.current
            this.split(node, utils.getCaretPos(node))
        }
    }
    handleChange(e) {
        var tagText = e.target.value
          , node = this.inputRef.current
          , caretPos = utils.getCaretPos(node)
          , lastInput = tagText.charAt(caretPos - 1)
        this.props.delimiterChars.forEach(delimiter =>  {
            if (lastInput === delimiter) {
                this.split(node, caretPos - 1, caretPos)
            }
        })
        utils.autoSize(node)
    }
    split(node) {
        var positions = Array.prototype.slice.call(arguments, 1)
          , tagText = node.value
          , textBeforeCaret = tagText.substring(0, positions[0])
          , textAfterCaret = tagText.substring(positions[1] || positions[0], tagText.length)
        node.value = textBeforeCaret
        node.blur()
        this.props.onSplit(textBeforeCaret, textAfterCaret)
    }
    render() {
        return (
            <div className={"tag" + (this.props.error? " has-error": "")} onClick={this.handleClick.bind(this)}>
                <input
                    type="text"
                    defaultValue={this.props.children.toString()}
                    ref={this.inputRef}
                    onFocus={this.handleFocus.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    onChange={this.handleChange.bind(this)} />
                <a className="">&times;</a>
            </div>
        )
    }
}

var keyHandlers = {
        LEFT: function(e) {
            if (e.caret === 0) {
                // seems that:
                // if current node do not blur
                // can not set next node to focus
                e.node.blur()
                e.originalEvent.preventDefault()
                this.props.onBlur(e.caret, KEYS.LEFT)
            }
        },
        RIGHT: function(e) {
            if (e.caret === e.node.value.length) {
                e.node.blur()
                e.originalEvent.preventDefault()
                this.props.onBlur(e.caret, KEYS.RIGHT)
            }
        },
        BACKSPACE: function(e) {
            if (e.caret === 0) {
                var node = e.node
                if (node.selectionStart !== node.selectionEnd) { return }
                e.node.blur()
                e.originalEvent.preventDefault()
                this.props.onBlur(e.caret, KEYS.LEFT)
            }
        }
}

class AnterosTagsInput extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: null,
            caret: null,
            repeat: null
        }
    }
    handleClick() {
        this.props.store.add('', function(err, newTag, indexOfNewTag) {
            this.setState({
                editing: indexOfNewTag,
                caret: 0
            })
        }.bind(this))
    }
    handleTagSave(tag, text) {
        this.props.store.save(tag, text, function(err) {
            if (!err) {
                this.props.onChange && this.props.onChange(text, this.props.store.output(), 'add')
                return
            }
            switch(err.name) {
                case ERROR.EMPTY:
                    break
                case ERROR.REPEAT:
                    var tagIndex
                    this.props.store.tags.forEach((t, i) => {
                        if (t.text === text) {
                            tagIndex = i
                        }
                    })
                    this.setState({
                        repeat: tagIndex
                    })
                    setTimeout(() => {
                        this.setState({ repeat: null })
                    }, 1500)
                    break
                default:
                    break
            }
            this.props.onError && this.props.onError(err)
            this.handleTagRemove(tag)
        }.bind(this))
        this.setState({
            editing: null,
            caret: null
        })
    }
    handleTagFocus(tag) {
        var tagIndex
        this.props.store.tags.forEach((t, i) => {
            if (tag.id === t.id) {
                tagIndex = i
            }
        })
        if (tagIndex === void 0) { return }
        this.setState({
            editing: tagIndex
        })
    }
    handleTagBlur(tag, caretOnBlur, lastKeyOnBlur) {
        var tags = this.props.store.tags
          , tagIndex

        if (!tags.length) {
            this.handleClick()
            return
        }
        tags.forEach((t, i) => {
            if (t.id === tag.id) {
                tagIndex = i
            }
        })
        if (caretOnBlur === 0) {
            if (tagIndex > 0) {
                this.setState({
                    editing: tagIndex - 1,
                    caret: tags[tagIndex - 1].text.length
                })
            } else if (tagIndex === 0) {
                this.setState({
                    editing: 0,
                    caret: 0
                })
            } else {
                // tagIndex === void 0
                // this case happens when
                // press left/right/backspace key on empty tag
                var newState = {}
                if (lastKeyOnBlur === KEYS.LEFT) {
                    if (this.state.editing - 1 < 0) { return }
                    newState.editing = this.state.editing - 1
                    newState.caret = tags[newState.editing].text.length
                }
                if (lastKeyOnBlur === KEYS.RIGHT) {
                    newState.editing = this.state.editing
                    newState.caret = 0
                }
                this.setState(newState)
            }
        }
        if (caretOnBlur > 0) {
            if (tagIndex < tags.length - 1) {
                this.setState({
                    editing: tagIndex + 1,
                    caret: 0
                })
            } else if (tagIndex === tags.length - 1) {
                this.setState({
                    editing: tags.length - 1,
                    caret: tags[tags.length - 1].text.length
                })
            }
        }
    }
    handleTagRemove(tag) {
        var tagText = tag.text
        this.props.store.remove(tag)
        tagText.length && this.props.onChange && this.props.onChange(tagText, this.props.store.output(), 'remove')
    }
    handleTagSplit(tag, textBeforeCaret, textAfterCaret) {
        this.props.store.insertAfterTag(tag, textAfterCaret, function(err, newTag, indexOfNewTag) {
            this.setState({
                editing: indexOfNewTag,
                caret: 0
            })
        }.bind(this))
    }
    render() {
        var store = this.props.store
        if (!store) {
            return <div />
        }

        var tags = this.props.store.tags
        var tagNodes = tags.map((tag, i) => {
            return (
                <Tag
                    active={this.state.editing === i? true: false}
                    error={this.state.repeat === i? true: false}
                    caret={this.state.editing === i? this.state.caret: null}
                    onSave={this.handleTagSave.bind(this, tag)}
                    onFocus={this.handleTagFocus.bind(this, tag)}
                    onBlur={this.handleTagBlur.bind(this, tag)}
                    onRemove={this.handleTagRemove.bind(this, tag)}
                    onSplit={this.handleTagSplit.bind(this, tag)}
                    delimiterKeys={this.props.delimiters.filter( d => { return typeof d === 'number'} )}
                    delimiterChars={this.props.delimiters.filter( d=> { return typeof d === 'string'} )}
                    key={tag.id}>
                    {tag.text}
                </Tag>
            )
        })
        if (!tags.length) {
            tagNodes = <div className="tag-editor-placeholder">{this.props.placeholder}</div>
        }
        return (
            <div className={"tag-editor" + (typeof this.state.editing === 'number'? " is-active": "")} onClick={this.handleClick.bind(this)}>
                {tagNodes}
            </div>
        )
    }
}

AnterosTagsInput.propTypes = {
    delimiters: PropTypes.arrayOf
}

AnterosTagsInput.defaultProps = {
    delimiters: [13,',']
}

export default connectToStore(AnterosTagsInput)