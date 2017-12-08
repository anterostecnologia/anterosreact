'use strict'
const React = require('react')
const PropTypes = require('prop-types')
import classNames from "classnames";
import { If, Then, Else } from "anteros-react-core";


const KEYS = {
    ENTER: 13,
    TAB: 9,
    BACKSPACE: 8,
    UP_ARROW: 38,
    DOWN_ARROW: 40
}

const CLASS_NAMES = {
    root: 'react-tags',
    rootFocused: 'is-focused',
    selected: 'react-tags__selected',
    selectedTag: 'react-tags__selected-tag',
    selectedTagName: 'react-tags__selected-tag-name',
    search: 'react-tags__search',
    searchInput: 'react-tags__search-input',
    suggestions: 'react-tags__suggestions',
    suggestionActive: 'is-active',
    suggestionDisabled: 'is-disabled'
}

export default class AnterosTagsInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            query: '',
            focused: false,
            expandable: false,
            selectedIndex: -1,
            classNames: Object.assign({}, CLASS_NAMES, this.props.classNames)
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            classNames: Object.assign({}, CLASS_NAMES, newProps.classNames)
        })
    }

    handleChange(e) {
        const query = e.target.value

        if (this.props.handleInputChange) {
            this.props.handleInputChange(query)
        }

        this.setState({ query })
    }

    handleKeyDown(e) {
        const { query, selectedIndex } = this.state

        // when one of the terminating keys is pressed, add current query to the tags.
        if (e.keyCode === KEYS.ENTER || e.keyCode === KEYS.TAB) {
            query && e.preventDefault()

            if (query.length >= this.props.minQueryLength) {
                // Check if the user typed in an existing suggestion.
                const match = this.suggestions.state.options.findIndex((suggestion) => {
                    return suggestion.name.search(new RegExp(`^${query}$`, 'i')) === 0
                })

                const index = selectedIndex === -1 ? match : selectedIndex

                if (index > -1) {
                    this.addTag(this.suggestions.state.options[index])
                } else if (this.props.allowNew) {
                    this.addTag({ name: query })
                }
            }
        }

        // when backspace key is pressed and query is blank, delete the last tag
        if (e.keyCode === KEYS.BACKSPACE && query.length === 0 && this.props.allowBackspace) {
            this.deleteTag(this.props.tags.length - 1)
        }

        if (e.keyCode === KEYS.UP_ARROW) {
            e.preventDefault()

            // if last item, cycle to the bottom
            if (selectedIndex <= 0) {
                this.setState({ selectedIndex: this.suggestions.state.options.length - 1 })
            } else {
                this.setState({ selectedIndex: selectedIndex - 1 })
            }
        }

        if (e.keyCode === KEYS.DOWN_ARROW) {
            e.preventDefault()

            this.setState({ selectedIndex: (selectedIndex + 1) % this.suggestions.state.options.length })
        }
    }

    handleClick(e) {
        if (document.activeElement !== e.target) {
            this.input.input.focus()
        }
    }

    handleBlur() {
        this.setState({ focused: false, selectedIndex: -1 })
    }

    handleFocus() {
        this.setState({ focused: true })
    }

    addTag(tag) {
        if (tag.disabled) {
            return
        }

        this.props.handleAddition(tag)

        // reset the state
        this.setState({
            query: '',
            selectedIndex: -1
        })
    }

    deleteTag(i) {
        this.props.handleDelete(i)
        this.setState({ query: '' })
    }

    render() {
        const listboxId = 'ReactTags-listbox'

        const TagComponent = this.props.tagComponent || Tag

        const tags = this.props.tags.map((tag, i) => (
            <TagComponent
                key={i}
                tag={tag}
                classNames={this.state.classNames}
                onDelete={this.deleteTag.bind(this, i)} />
        ))

        const expandable = this.state.focused && this.state.query.length >= this.props.minQueryLength
        const classNames = classNames([this.state.classNames.root],
            (this.props.inputGridSize ? " col-sm-" + this.props.inputGridSize : ""));


        this.state.focused && classNames.push(this.state.classNames.rootFocused);

        const classNameLabel = (this.props.labelGridSize ? "col-sm-" + this.props.labelGridSize : "");

        return (
            <div>
                <If condition={this.props.label!=undefined}>
                    <Then>
                        <label className={classNameLabel}>{this.props.label}</label>
                    </Then>
                </If>
                <div className={classNames.join(' ')} onClick={this.handleClick.bind(this)}>
                    <div className={this.state.classNames.selected} aria-live='polite' aria-relevant='additions removals'>
                        {tags}
                    </div>
                    <div
                        className={this.state.classNames.search}
                        onBlur={this.handleBlur.bind(this)}
                        onFocus={this.handleFocus.bind(this)}
                        onChange={this.handleChange.bind(this)}
                        onKeyDown={this.handleKeyDown.bind(this)}>
                        <Input {...this.state}
                            ref={(c) => { this.input = c }}
                            listboxId={listboxId}
                            autofocus={this.props.autofocus}
                            autoresize={this.props.autoresize}
                            expandable={expandable}
                            placeholder={this.props.placeholder} />
                        <Suggestions {...this.state}
                            ref={(c) => { this.suggestions = c }}
                            listboxId={listboxId}
                            expandable={expandable}
                            suggestions={this.props.suggestions}
                            addTag={this.addTag.bind(this)}
                            maxSuggestionsLength={this.props.maxSuggestionsLength} />
                    </div>
                </div>
            </div>
        )
    }
}

AnterosTagsInput.defaultProps = {
    tags: [],
    placeholder: 'Adicione uma tag',
    suggestions: [],
    autofocus: true,
    autoresize: true,
    minQueryLength: 2,
    maxSuggestionsLength: 6,
    allowNew: true,
    allowBackspace: true,
    tagComponent: null
}

AnterosTagsInput.propTypes = {
    tags: PropTypes.array,
    placeholder: PropTypes.string,
    suggestions: PropTypes.array,
    autofocus: PropTypes.bool,
    autoresize: PropTypes.bool,
    handleDelete: PropTypes.func.isRequired,
    handleAddition: PropTypes.func.isRequired,
    handleInputChange: PropTypes.func,
    minQueryLength: PropTypes.number,
    maxSuggestionsLength: PropTypes.number,
    classNames: PropTypes.object,
    allowNew: PropTypes.bool,
    allowBackspace: PropTypes.bool,
    label: React.PropTypes.string,
    inputGridSize: React.PropTypes.number,
    labelGridSize: React.PropTypes.number,
    tagComponent: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.element
    ])
}




function escapeForRegExp(query) {
    return query.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
}

function markIt(input, query) {
    const regex = RegExp(escapeForRegExp(query), 'gi')

    return {
        __html: input.replace(regex, '<mark>$&</mark>')
    }
}

function filterSuggestions(query, suggestions, length) {
    const regex = new RegExp(`(?:^|\\s)${escapeForRegExp(query)}`, 'i')
    return suggestions.filter((item) => regex.test(item.name)).slice(0, length)
}

class Suggestions extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            options: filterSuggestions(this.props.query, this.props.suggestions, this.props.maxSuggestionsLength)
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            options: filterSuggestions(newProps.query, newProps.suggestions, newProps.maxSuggestionsLength)
        })
    }

    handleMouseDown(item, e) {
        // focus is shifted on mouse down but calling preventDefault prevents this
        e.preventDefault()
        this.props.addTag(item)
    }

    render() {
        if (!this.props.expandable || !this.state.options.length) {
            return null
        }

        const options = this.state.options.map((item, i) => {
            const key = `${this.props.listboxId}-${i}`
            const classNames = []

            if (this.props.selectedIndex === i) {
                classNames.push(this.props.classNames.suggestionActive)
            }

            if (item.disabled) {
                classNames.push(this.props.classNames.suggestionDisabled)
            }

            return (
                <li
                    id={key}
                    key={key}
                    role='option'
                    className={classNames.join(' ')}
                    aria-disabled={item.disabled === true}
                    onMouseDown={this.handleMouseDown.bind(this, item)}>
                    <span dangerouslySetInnerHTML={markIt(item.name, this.props.query)} />
                </li>
            )
        })

        return (
            <div className={this.props.classNames.suggestions}>
                <ul role='listbox' id={this.props.listboxId}>{options}</ul>
            </div>
        )
    }
}


class Tag extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<button type='button' className={this.props.classNames.selectedTag} title='Click to remove tag' onClick={this.props.onDelete}>
            <span className={this.props.classNames.selectedTagName}>{this.props.tag.name}</span>
        </button>);
    }
}



const SIZER_STYLES = {
    position: 'absolute',
    width: 0,
    height: 0,
    visibility: 'hidden',
    overflow: 'scroll',
    whiteSpace: 'pre'
}

const STYLE_PROPS = [
    'fontSize',
    'fontFamily',
    'fontWeight',
    'fontStyle',
    'letterSpacing'
]

class Input extends React.Component {
    constructor(props) {
        super(props)
        this.state = { inputWidth: null }
    }

    componentDidMount() {
        if (this.props.autoresize) {
            this.copyInputStyles()
            this.updateInputWidth()
        }

        if (this.props.autofocus) {
            this.input.focus()
        }
    }

    componentDidUpdate(prevProps) {
        this.updateInputWidth()
    }

    componentWillReceiveProps(newProps) {
        if (this.input.value !== newProps.query) {
            this.input.value = newProps.query
        }
    }

    copyInputStyles() {
        const inputStyle = window.getComputedStyle(this.input)

        STYLE_PROPS.forEach((prop) => {
            this.sizer.style[prop] = inputStyle[prop]
        })
    }

    updateInputWidth() {
        let inputWidth

        if (this.props.autoresize) {
            // scrollWidth is designed to be fast not accurate.
            // +2 is completely arbitrary but does the job.
            inputWidth = Math.ceil(this.sizer.scrollWidth) + 2
        }

        if (inputWidth !== this.state.inputWidth) {
            this.setState({ inputWidth })
        }
    }

    render() {
        const sizerText = this.props.query || this.props.placeholder

        const { expandable, placeholder, listboxId, selectedIndex } = this.props

        const selectedId = `${listboxId}-${selectedIndex}`

        return (
            <div className={this.props.classNames.searchInput}>
                <input disabled={(this.props.disabled ? true : false)}
                    ref={(c) => { this.input = c }}
                    role='combobox'
                    aria-autocomplete='list'
                    aria-label={placeholder}
                    aria-owns={listboxId}
                    aria-activedescendant={selectedIndex > -1 ? selectedId : null}
                    aria-expanded={expandable}
                    placeholder={placeholder}
                    style={{ width: this.state.inputWidth }} />
                <div ref={(c) => { this.sizer = c }} style={SIZER_STYLES}>{sizerText}</div>
            </div>
        )
    }
}






