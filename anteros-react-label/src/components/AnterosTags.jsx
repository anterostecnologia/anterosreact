import React, { Component } from 'react';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import escapeRegExp from 'lodash/escapeRegExp';
import flow from 'lodash/flow';
import { findDOMNode } from 'react-dom';


const KEYS = {
    ENTER: 13,
    TAB: 9,
    BACKSPACE: 8,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    ESCAPE: 27,
};

const DEFAULT_PLACEHOLDER = 'Add new tag';

const DEFAULT_LABEL_FIELD = 'text';

const DEFAULT_CLASSNAMES = {
    tags: 'ReactTags__tags',
    tagInput: 'ReactTags__tagInput',
    tagInputField: 'ReactTags__tagInputField',
    selected: 'ReactTags__selected',
    tag: 'ReactTags__tag',
    remove: 'ReactTags__remove',
    suggestions: 'ReactTags__suggestions',
    activeSuggestion: 'ReactTags__activeSuggestion',
};

const INPUT_FIELD_POSITIONS = {
    INLINE: 'inline',
    TOP: 'top',
    BOTTOM: 'bottom',
};


function buildRegExpFromDelimiters(delimiters) {
    const delimiterChars = delimiters
        .map((delimiter) => {
            // See: http://stackoverflow.com/a/34711175/1463681
            const chrCode = delimiter - 48 * Math.floor(delimiter / 48);
            return String.fromCharCode(96 <= delimiter ? chrCode : delimiter);
        })
        .join('');
    const escapedDelimiterChars = escapeRegExp(delimiterChars);
    return new RegExp(`[${escapedDelimiterChars}]+`);
}


function canDrag(params) {
    const { moveTag, readOnly, allowDragDrop } = params;
    return moveTag !== undefined && !readOnly && allowDragDrop;
}

function canDrop(params) {
    const { readOnly, allowDragDrop } = params;
    return !readOnly && allowDragDrop;
}

const tagSource = {
    beginDrag: (props) => {
        return { id: props.tag.index, index: props.index };
    },
    canDrag: (props) => canDrag(props),
};

const tagTarget = {
    hover: (props, monitor, component) => {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        if (dragIndex === hoverIndex) {
            return;
        }

        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;

        // Only perform the move when the mouse has crossed half of the items width
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
            return;
        }

        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
            return;
        }

        props.moveTag(dragIndex, hoverIndex);

        monitor.getItem().index = hoverIndex;
    },
    canDrop: (props) => canDrop(props),
};

const dragSource = (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    };
};

const dropCollect = (connect) => {
    return {
        connectDropTarget: connect.dropTarget(),
    };
};

const crossStr = String.fromCharCode(215);
const RemoveComponent = (props) => {
    const { readOnly, removeComponent, onClick, className } = props;
    if (readOnly) {
        return <span />;
    }

    if (removeComponent) {
        const Component = removeComponent;
        return <Component {...props} />;
    }

    return (
        <a href onClick={onClick} className={className} onKeyDown={onClick}>
            {crossStr}
        </a>
    );
};

RemoveComponent.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    removeComponent: PropTypes.func,
};

const ItemTypes = { TAG: 'tag' };

class Tag extends Component {
    render() {
        const { props } = this;
        const label = props.tag[props.labelField];
        const {
            readOnly,
            tag,
            classNames,
        } = props;
        const { className = '' } = tag;
        const tagComponent = (<span
            className={ClassNames('tag-wrapper', classNames.tag, className)}
            onClick={props.onTagClicked}
            onKeyDown={props.onTagClicked}
            onTouchStart={props.onTagClicked}>
            {label}
            <RemoveComponent
                tag={props.tag}
                className={classNames.remove}
                removeComponent={props.removeComponent}
                onClick={props.onDelete}
                readOnly={readOnly}
            />
        </span>
        );
        return tagComponent;
    }
}

Tag.propTypes = {
    labelField: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    tag: PropTypes.shape({
        id: PropTypes.string.isRequired,
        className: PropTypes.string,
        key: PropTypes.string,
    }),
    moveTag: PropTypes.func,
    removeComponent: PropTypes.func,
    onTagClicked: PropTypes.func,
    classNames: PropTypes.object,
    readOnly: PropTypes.bool,
};

Tag.defaultProps = {
    labelField: 'text',
    readOnly: false,
};


export default class AnterosTags extends Component {
    static propTypes = {
        placeholder: PropTypes.string,
        labelField: PropTypes.string,
        suggestions: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
            })
        ),
        delimiters: PropTypes.arrayOf(PropTypes.number),
        autofocus: PropTypes.bool,
        inline: PropTypes.bool,
        inputFieldPosition: PropTypes.oneOf([
            INPUT_FIELD_POSITIONS.INLINE,
            INPUT_FIELD_POSITIONS.TOP,
            INPUT_FIELD_POSITIONS.BOTTOM,
        ]),
        handleDelete: PropTypes.func,
        handleAddition: PropTypes.func,
        handleDrag: PropTypes.func,
        handleFilterSuggestions: PropTypes.func,
        handleTagClick: PropTypes.func,
        allowDeleteFromEmptyInput: PropTypes.bool,
        allowAdditionFromPaste: PropTypes.bool,
        allowDragDrop: PropTypes.bool,
        resetInputOnDelete: PropTypes.bool,
        handleInputChange: PropTypes.func,
        handleInputFocus: PropTypes.func,
        handleInputBlur: PropTypes.func,
        minQueryLength: PropTypes.number,
        shouldRenderSuggestions: PropTypes.func,
        removeComponent: PropTypes.func,
        autocomplete: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
        readOnly: PropTypes.bool,
        addTags:  PropTypes.bool,
        classNames: PropTypes.object,
        name: PropTypes.string,
        id: PropTypes.string,
        maxLength: PropTypes.number,
        inputValue: PropTypes.string,
        tags: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                className: PropTypes.string,
            })
        ),
        allowUnique: PropTypes.bool,
        renderSuggestion: PropTypes.func,
        onClear: PropTypes.func
    };

    static defaultProps = {
        placeholder: DEFAULT_PLACEHOLDER,
        labelField: DEFAULT_LABEL_FIELD,
        suggestions: [],
        delimiters: [KEYS.ENTER, KEYS.TAB],
        autofocus: true,
        inline: true, 
        inputFieldPosition: INPUT_FIELD_POSITIONS.INLINE,
        handleDelete: noop,
        handleAddition: noop,
        allowDeleteFromEmptyInput: true,
        allowAdditionFromPaste: true,
        resetInputOnDelete: true,
        autocomplete: false,
        readOnly: false,
        allowUnique: true,
        allowDragDrop: true,
        addTags: true,
        tags: [],
    };

    constructor(props) {
        super(props);

        if (!props.inline) {
            /* eslint-disable no-console */
            console.warn(
                '[Deprecation] The inline attribute is deprecated and will be removed in v7.x.x, please use inputFieldPosition instead.'
            );
            /* eslint-enable no-console */
        }

        const { suggestions } = props;
        this.state = {
            suggestions,
            query: '',
            isFocused: false,
            selectedIndex: -1,
            selectionMode: false,
        };
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.moveTag = this.moveTag.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.resetAndFocusInput = this.resetAndFocusInput.bind(this);
        this.handleSuggestionHover = this.handleSuggestionHover.bind(this);
        this.handleSuggestionClick = this.handleSuggestionClick.bind(this);
    }

    componentDidMount() {
        const { autofocus, readOnly } = this.props;

        if (autofocus && !readOnly) {
            this.resetAndFocusInput();
        }
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(prevProps.suggestions, this.props.suggestions)) {
            this.updateSuggestions();
        }
    }

    filteredSuggestions(query, suggestions) {
        if (this.props.handleFilterSuggestions) {
            return this.props.handleFilterSuggestions(query, suggestions);
        }

        const exactSuggestions = suggestions.filter((item) => {
            return this.getQueryIndex(query, item) === 0;
        });
        const partialSuggestions = suggestions.filter((item) => {
            return this.getQueryIndex(query, item) > 0;
        });
        return exactSuggestions.concat(partialSuggestions);
    }

    getQueryIndex = (query, item) => {
        return item[this.props.labelField]
            .toLowerCase()
            .indexOf(query.toLowerCase());
    };

    resetAndFocusInput() {
        this.setState({ query: '' });
        if (this.textInput) {
            this.textInput.value = '';
            this.textInput.focus();
        }
    }

    handleDelete(i, e) {
        this.props.handleDelete(i, e);
        if (!this.props.resetInputOnDelete) {
            this.textInput && this.textInput.focus();
        } else {
            this.resetAndFocusInput();
        }
        e.stopPropagation();
    }

    handleTagClick(i, e) {
        if (this.props.handleTagClick) {
            this.props.handleTagClick(i, e);
        }
        if (!this.props.resetInputOnDelete) {
            this.textInput && this.textInput.focus();
        } else {
            this.resetAndFocusInput();
        }
    }

    handleChange(e) {
        if (this.props.handleInputChange) {
            this.props.handleInputChange(e.target.value);
        }

        const query = e.target.value.trim();

        this.setState({ query }, this.updateSuggestions);
    }

    updateSuggestions = () => {
        const { query, selectedIndex } = this.state;
        const suggestions = this.filteredSuggestions(query, this.props.suggestions);

        this.setState({
            suggestions: suggestions,
            selectedIndex:
                selectedIndex >= suggestions.length
                    ? suggestions.length - 1
                    : selectedIndex,
        });
    }

    handleFocus(e) {
        const value = e.target.value;
        if (this.props.handleInputFocus) {
            this.props.handleInputFocus(value);
        }
        this.setState({ isFocused: true });
    }

    handleBlur(e) {
        const value = e.target.value;
        if (this.props.handleInputBlur) {
            this.props.handleInputBlur(value);
            if (this.textInput) {
                this.textInput.value = '';
            }
        }
        this.setState({ isFocused: false });
    }

    handleKeyDown(e) {
        const { query, selectedIndex, suggestions, selectionMode } = this.state;
        if (e.keyCode === KEYS.ESCAPE) {
            e.preventDefault();
            e.stopPropagation();
            this.setState({
                selectedIndex: -1,
                selectionMode: false,
                suggestions: [],
            });
        }
        if (this.props.delimiters.indexOf(e.keyCode) !== -1 && !e.shiftKey) {
            if (e.keyCode !== KEYS.TAB || query !== '') {
                e.preventDefault();
            }

            const selectedQuery =
                selectionMode && selectedIndex !== -1
                    ? suggestions[selectedIndex]
                    : { id: query, [this.props.labelField]: query };

            if (selectedQuery !== '') {
                this.addTag(selectedQuery);
            }
        }

        // when backspace key is pressed and query is blank, delete tag
        if (
            e.keyCode === KEYS.BACKSPACE &&
            query === '' &&
            this.props.allowDeleteFromEmptyInput
        ) {
            this.handleDelete(this.props.tags.length - 1, e);
        }

        // up arrow
        if (e.keyCode === KEYS.UP_ARROW) {
            e.preventDefault();
            this.setState({
                selectedIndex:
                    selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1,
                selectionMode: true,
            });
        }

        // down arrow
        if (e.keyCode === KEYS.DOWN_ARROW) {
            e.preventDefault();
            this.setState({
                selectedIndex:
                    suggestions.length === 0
                        ? -1
                        : (selectedIndex + 1) % suggestions.length,
                selectionMode: true,
            });
        }
    }

    handlePaste(e) {
        if (!this.props.allowAdditionFromPaste) {
            return;
        }

        e.preventDefault();

        const clipboardData = e.clipboardData || window.clipboardData;
        const clipboardText = clipboardData.getData('text');

        const { maxLength = clipboardText.length } = this.props;

        const maxTextLength = Math.min(maxLength, clipboardText.length);
        const pastedText = clipboardData.getData('text').substr(0, maxTextLength);

        // Used to determine how the pasted content is split.
        const delimiterRegExp = buildRegExpFromDelimiters(this.props.delimiters);
        const tags = pastedText.split(delimiterRegExp);

        // Only add unique tags
        uniq(tags).forEach((tag) =>
            this.addTag({ id: tag, [this.props.labelField]: tag })
        );
    }

    addTag = (tag) => {
        const { tags, labelField, allowUnique } = this.props;
        if (!tag.id || !tag[labelField]) {
            return;
        }
        const existingKeys = tags.map((tag) => tag.id.toLowerCase());

        // Return if tag has been already added
        if (allowUnique && existingKeys.indexOf(tag.id.toLowerCase()) >= 0) {
            return;
        }
        if (this.props.autocomplete) {
            const possibleMatches = this.filteredSuggestions(
                tag[labelField],
                this.props.suggestions
            );

            if (
                (this.props.autocomplete === 1 && possibleMatches.length === 1) ||
                (this.props.autocomplete === true && possibleMatches.length)
            ) {
                tag = possibleMatches[0];
            }
        }

        // call method to add
        this.props.handleAddition(tag);

        // reset the state
        this.setState({
            query: '',
            selectionMode: false,
            selectedIndex: -1,
        });

        this.resetAndFocusInput();
    };

    handleSuggestionClick(i) {
        this.addTag(this.state.suggestions[i]);
    }

    handleSuggestionHover(i) {
        this.setState({
            selectedIndex: i,
            selectionMode: true,
        });
    }

    moveTag(dragIndex, hoverIndex) {
        const tags = this.props.tags;

        // locate tags
        const dragTag = tags[dragIndex];

        // call handler with the index of the dragged tag
        // and the tag that is hovered
        this.props.handleDrag(dragTag, dragIndex, hoverIndex);
    }

    getTagItems = () => {
        const {
            classNames,
            tags,
            labelField,
            removeComponent,
            readOnly,
            allowDragDrop,
        } = this.props;

        const moveTag = allowDragDrop ? this.moveTag : null;
        return tags.map((tag, index) => {
            return (
                <Tag
                    key={tag.key || tag.id}
                    index={index}
                    tag={tag}
                    labelField={labelField}
                    onDelete={this.handleDelete.bind(this, index)}
                    moveTag={moveTag}
                    removeComponent={removeComponent}
                    onTagClicked={this.handleTagClick.bind(this, index)}
                    readOnly={readOnly}
                    classNames={{ ...DEFAULT_CLASSNAMES, ...classNames }}
                    allowDragDrop={allowDragDrop}
                />
            );
        });
    };

    render() {
        const tagItems = this.getTagItems();
        const classNames = { ...DEFAULT_CLASSNAMES, ...this.props.classNames };

        // get the suggestions for the given query
        const query = this.state.query.trim(),
            selectedIndex = this.state.selectedIndex,
            suggestions = this.state.suggestions;

        const {
            placeholder,
            name: inputName,
            id: inputId,
            maxLength,
            inline,
            inputFieldPosition,
        } = this.props;

        const position = !inline
            ? INPUT_FIELD_POSITIONS.BOTTOM
            : inputFieldPosition;

        const tagInput = !this.props.readOnly & this.props.addTags? (
            <div className={classNames.tagInput}>
                <input
                    ref={(input) => {
                        this.textInput = input;
                    }}
                    className={classNames.tagInputField}
                    type="text"
                    placeholder={placeholder}
                    aria-label={placeholder}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    onPaste={this.handlePaste}
                    name={inputName}
                    id={inputId}
                    maxLength={maxLength}
                    value={this.props.inputValue}
                />

                <Suggestions
                    query={query}
                    suggestions={suggestions}
                    labelField={this.props.labelField}
                    selectedIndex={selectedIndex}
                    handleClick={this.handleSuggestionClick}
                    handleHover={this.handleSuggestionHover}
                    minQueryLength={this.props.minQueryLength}
                    shouldRenderSuggestions={this.props.shouldRenderSuggestions}
                    isFocused={this.state.isFocused}
                    classNames={classNames}
                    renderSuggestion={this.props.renderSuggestion}
                />
            </div>
        ) : null;

        return (
            <div className={ClassNames(classNames.tags, 'react-tags-wrapper')}>
                {position === INPUT_FIELD_POSITIONS.TOP && tagInput}
                <div className={classNames.selected}>
                    {tagItems}
                    {position === INPUT_FIELD_POSITIONS.INLINE && tagInput}
                    <button className="fal fa-times" onClick={this.props.onClear} style={{border:0, color:'red'}}/>
                </div>                
                {position === INPUT_FIELD_POSITIONS.BOTTOM && tagInput}
            </div>
        );
    }
}



const maybeScrollSuggestionIntoView = (suggestionEl, suggestionsContainer) => {
    const containerHeight = suggestionsContainer.offsetHeight;
    const suggestionHeight = suggestionEl.offsetHeight;
    const relativeSuggestionTop =
        suggestionEl.offsetTop - suggestionsContainer.scrollTop;

    if (relativeSuggestionTop + suggestionHeight >= containerHeight) {
        suggestionsContainer.scrollTop +=
            relativeSuggestionTop - containerHeight + suggestionHeight;
    } else if (relativeSuggestionTop < 0) {
        suggestionsContainer.scrollTop += relativeSuggestionTop;
    }
};

class Suggestions extends Component {
    static propTypes = {
        query: PropTypes.string.isRequired,
        selectedIndex: PropTypes.number.isRequired,
        suggestions: PropTypes.array.isRequired,
        handleClick: PropTypes.func.isRequired,
        handleHover: PropTypes.func.isRequired,
        minQueryLength: PropTypes.number,
        shouldRenderSuggestions: PropTypes.func,
        isFocused: PropTypes.bool.isRequired,
        classNames: PropTypes.object,
        labelField: PropTypes.string.isRequired,
        renderSuggestion: PropTypes.func,
    };

    static defaultProps = {
        minQueryLength: 2,
    };

    shouldComponentUpdate(nextProps) {
        const { props } = this;
        const shouldRenderSuggestions =
            props.shouldRenderSuggestions || this.shouldRenderSuggestions;
        return (
            props.isFocused !== nextProps.isFocused ||
            !isEqual(props.suggestions, nextProps.suggestions) ||
            shouldRenderSuggestions(nextProps.query) ||
            shouldRenderSuggestions(nextProps.query) !==
            shouldRenderSuggestions(props.query)
        );
    }

    componentDidUpdate(prevProps) {
        const { selectedIndex, classNames } = this.props;

        if (
            this.suggestionsContainer &&
            prevProps.selectedIndex !== selectedIndex
        ) {
            const activeSuggestion = this.suggestionsContainer.querySelector(
                classNames.activeSuggestion
            );

            if (activeSuggestion) {
                maybeScrollSuggestionIntoView(
                    activeSuggestion,
                    this.suggestionsContainer
                );
            }
        }
    }

    markIt = (input, query) => {
        const escapedRegex = query.trim().replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
        const { [this.props.labelField]: labelValue } = input;

        return {
            __html: labelValue.replace(RegExp(escapedRegex, 'gi'), (x) => {
                return `<mark>${escape(x)}</mark>`;
            }),
        };
    };

    shouldRenderSuggestions = (query) => {
        const { minQueryLength, isFocused } = this.props;
        return query.length >= minQueryLength && isFocused;
    };

    renderSuggestion = (item, query) => {
        const { renderSuggestion } = this.props;
        if (typeof renderSuggestion === 'function') {
            return renderSuggestion(item, query);
        }
        return <span dangerouslySetInnerHTML={this.markIt(item, query)} />;
    };

    render() {
        const { props } = this;

        const suggestions = props.suggestions.map(
            function (item, i) {
                return (
                    <li
                        key={i}
                        onMouseDown={props.handleClick.bind(null, i)}
                        onTouchStart={props.handleClick.bind(null, i)}
                        onMouseOver={props.handleHover.bind(null, i)}
                        className={
                            i === props.selectedIndex ? props.classNames.activeSuggestion : ''
                        }>
                        {this.renderSuggestion(item, props.query)}
                    </li>
                );
            }.bind(this)
        );

        // use the override, if provided
        const shouldRenderSuggestions =
            props.shouldRenderSuggestions || this.shouldRenderSuggestions;
        if (suggestions.length === 0 || !shouldRenderSuggestions(props.query)) {
            return null;
        }

        return (
            <div
                ref={(elem) => {
                    this.suggestionsContainer = elem;
                }}
                className={this.props.classNames.suggestions}>
                <ul> {suggestions} </ul>
            </div>
        );
    }
}
