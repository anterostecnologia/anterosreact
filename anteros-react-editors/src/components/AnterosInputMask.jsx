import React from 'react';
import {findDOMNode} from 'react-dom';
import {autoBind} from 'anteros-react-core';
import PropTypes from 'prop-types';



function setInputSelection(input, start, end) {
    if ('selectionStart' in input && 'selectionEnd' in input) {
      input.selectionStart = start;
      input.selectionEnd = end;
    } else {
      const range = input.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    }
  }
  
  function getInputSelection(input) {
    let start = 0;
    let end = 0;
  
    if ('selectionStart' in input && 'selectionEnd' in input) {
      start = input.selectionStart;
      end = input.selectionEnd;
    } else {
      const range = document.selection.createRange();
      if (range.parentElement() === input) {
        start = -range.moveStart('character', -input.value.length);
        end = -range.moveEnd('character', -input.value.length);
      }
    }
  
    return {
      start,
      end,
      length: end - start
    };
  }

function isWindowsPhoneBrowser() {
    const windows = new RegExp('windows', 'i');
    const phone = new RegExp('phone', 'i');
    const ua = navigator.userAgent;
    return windows.test(ua) && phone.test(ua);
  }

function getRequestAnimationFrame() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
}

function getCancelAnimationFrame() {
    return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
}

function defer(fn) {
    const hasCancelAnimationFrame = !!getCancelAnimationFrame();
    let deferFn;

    if (hasCancelAnimationFrame) {
        deferFn = getRequestAnimationFrame();
    } else {
        deferFn = (() => setTimeout(fn, 1000 / 60));
    }

    return deferFn(fn);
}

function cancelDefer(deferId) {
    const cancelFn = getCancelAnimationFrame() || clearTimeout;

    cancelFn(deferId);
}

function isDOMElement(element) {
    return typeof HTMLElement === 'object'
        ? element instanceof HTMLElement // DOM2
        : element.nodeType === 1 && typeof element.nodeName === 'string';
}

function isFunction(value) {
    return typeof value === 'function';
}

function processChange(maskOptions, value, selection, previousValue, previousSelection) {
    const {mask, prefix, lastEditablePosition} = maskOptions;
    let newValue = value;
    let enteredString = '';
    let formattedEnteredStringLength = 0;
    let removedLength = 0;
    let cursorPosition = Math.min(previousSelection.start, selection.start);

    if (selection.end > previousSelection.start) {
        enteredString = newValue.slice(previousSelection.start, selection.end);
        formattedEnteredStringLength = getInsertStringLength(maskOptions, previousValue, enteredString, cursorPosition);
        if (!formattedEnteredStringLength) {
            removedLength = 0;
        } else {
            removedLength = previousSelection.length;
        }
    } else if (newValue.length < previousValue.length) {
        removedLength = previousValue.length - newValue.length;
    }

    newValue = previousValue;

    if (removedLength) {
        if (removedLength === 1 && !previousSelection.length) {
            const deleteFromRight = previousSelection.start === selection.start;
            cursorPosition = deleteFromRight
                ? getRightEditablePosition(maskOptions, selection.start)
                : getLeftEditablePosition(maskOptions, selection.start);
        }
        newValue = clearRange(maskOptions, newValue, cursorPosition, removedLength);
    }

    newValue = insertString(maskOptions, newValue, enteredString, cursorPosition);

    cursorPosition = cursorPosition + formattedEnteredStringLength;
    if (cursorPosition >= mask.length) {
        cursorPosition = mask.length;
    } else if (cursorPosition < prefix.length && !formattedEnteredStringLength) {
        cursorPosition = prefix.length;
    } else if (cursorPosition >= prefix.length && cursorPosition < lastEditablePosition && formattedEnteredStringLength) {
        cursorPosition = getRightEditablePosition(maskOptions, cursorPosition);
    }

    newValue = formatValue(maskOptions, newValue);

    if (!enteredString) {
        enteredString = null;
    }

    return {
        value: newValue,
        enteredString,
        selection: {
            start: cursorPosition,
            end: cursorPosition
        }
    };
}

const defaultFormatChars = {
    '9': '[0-9]',
    'a': '[A-Za-z]',
    '*': '[A-Za-z0-9]'
  };
  
const defaultMaskChar = '_';

function parseMask(mask, maskChar, formatChars) {
    let parsedMaskString = '';
    let prefix = '';
    let lastEditablePosition = null;
    const permanents = [];

    if (maskChar === undefined) {
        maskChar = defaultMaskChar;
    }

    if (formatChars == null) {
        formatChars = defaultFormatChars;
    }

    if (!mask || typeof mask !== 'string') {
        return {
            maskChar,
            formatChars,
            mask: null,
            prefix: null,
            lastEditablePosition: null,
            permanents: []
        };
    }

    let isPermanent = false;
    mask
        .split('')
        .forEach((character) => {
            if (!isPermanent && character === '\\') {
                isPermanent = true;
            } else {
                if (isPermanent || !formatChars[character]) {
                    permanents.push(parsedMaskString.length);
                    if (parsedMaskString.length === permanents.length - 1) {
                        prefix += character;
                    }
                } else {
                    lastEditablePosition = parsedMaskString.length + 1;
                }
                parsedMaskString += character;
                isPermanent = false;
            }
        });

    return {
        maskChar,
        formatChars,
        prefix,
        mask: parsedMaskString,
        lastEditablePosition,
        permanents
    };
}

export default class AnterosInputMask extends React.Component {
    

    constructor(props) {
        super(props);
        autoBind(this);

        this.focused = false
        this.mounted = false
        this.previousSelection = null
        this.selectionDeferId = null
        this.saveSelectionLoopDeferId = null

        const {mask, maskChar, formatChars, alwaysShowMask, beforeMaskedValueChange} = props;
        let {defaultValue, value} = props;

        this.maskOptions = parseMask(mask, maskChar, formatChars);

        if (defaultValue == null) {
            defaultValue = '';
        }
        if (value == null) {
            value = defaultValue;
        }

        let newValue = getStringValue(value);

        if (this.maskOptions.mask && (alwaysShowMask || newValue)) {
            newValue = formatValue(this.maskOptions, newValue);

            if (isFunction(beforeMaskedValueChange)) {
                let oldValue = props.value;
                if (props.value == null) {
                    oldValue = defaultValue;
                }
                oldValue = getStringValue(oldValue);

                const modifiedValue = beforeMaskedValueChange({
                    value: newValue,
                    selection: null
                }, {
                    value: oldValue,
                    selection: null
                }, null, this.getBeforeMaskedValueChangeConfig());

                newValue = modifiedValue.value;
            }
        }

        this.value = newValue;
    }

    componentDidMount() {
        this.mounted = true;

        // workaround for react-test-renderer
        // https://github.com/sanniassin/react-input-mask/issues/147
        if (!this.getInputDOMNode()) {
            return;
        }

        this.isWindowsPhoneBrowser = isWindowsPhoneBrowser();

        if (this.maskOptions.mask && this.getInputValue() !== this.value) {
            this.setInputValue(this.value);
        }
    }

    componentDidUpdate() {
        const {previousSelection} = this;
        const {beforeMaskedValueChange, alwaysShowMask, mask, maskChar, formatChars} = this.props;
        const previousMaskOptions = this.maskOptions;
        const showEmpty = alwaysShowMask || this.isFocused();
        const hasValue = this.props.value != null;
        let newValue = hasValue
            ? getStringValue(this.props.value)
            : this.value;
        let cursorPosition = previousSelection
            ? previousSelection.start
            : null;

        this.maskOptions = parseMask(mask, maskChar, formatChars);

        if (!this.maskOptions.mask) {
            if (previousMaskOptions.mask) {
                this.stopSaveSelectionLoop();

                // render depends on this.maskOptions and this.value, call forceUpdate to keep
                // it in sync
                this.forceUpdate();
            }
            return;
        } else if (!previousMaskOptions.mask && this.isFocused()) {
            this.runSaveSelectionLoop();
        }

        const isMaskChanged = this.maskOptions.mask && this.maskOptions.mask !== previousMaskOptions.mask;

        if (!previousMaskOptions.mask && !hasValue) {
            newValue = this.getInputValue();
        }

        if (isMaskChanged || (this.maskOptions.mask && (newValue || showEmpty))) {
            newValue = formatValue(this.maskOptions, newValue);
        }

        if (isMaskChanged) {
            const filledLength = getFilledLength(this.maskOptions, newValue);
            if (cursorPosition === null || filledLength < cursorPosition) {
                if (isFilled(this.maskOptions, newValue)) {
                    cursorPosition = filledLength;
                } else {
                    cursorPosition = getRightEditablePosition(this.maskOptions, filledLength);
                }
            }
        }

        if (this.maskOptions.mask && isEmpty(this.maskOptions, newValue) && !showEmpty && (!hasValue || !this.props.value)) {
            newValue = '';
        }

        let newSelection = {
            start: cursorPosition,
            end: cursorPosition
        };

        if (isFunction(beforeMaskedValueChange)) {
            const modifiedValue = beforeMaskedValueChange({
                value: newValue,
                selection: newSelection
            }, {
                value: this.value,
                selection: this.previousSelection
            }, null, this.getBeforeMaskedValueChangeConfig());
            newValue = modifiedValue.value;
            newSelection = modifiedValue.selection;
        }

        this.value = newValue;
        const isValueChanged = this.getInputValue() !== this.value;

        // render depends on this.maskOptions and this.value, call forceUpdate to keep
        // it in sync
        if (isValueChanged) {
            this.setInputValue(this.value);
            this.forceUpdate();
        } else if (isMaskChanged) {
            this.forceUpdate();
        }

        let isSelectionChanged = false;
        if (newSelection.start != null && newSelection.end != null) {
            isSelectionChanged = !previousSelection || previousSelection.start !== newSelection.start || previousSelection.end !== newSelection.end;
        }

        if (isSelectionChanged || isValueChanged) {
            this.setSelection(newSelection.start, newSelection.end);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.selectionDeferId !== null) {
            cancelDefer(this.selectionDeferId);
        }
        this.stopSaveSelectionLoop();
    }

    saveSelectionLoop() {
        this.previousSelection = this.getSelection();
        this.saveSelectionLoopDeferId = defer(this.saveSelectionLoop);
    }

    runSaveSelectionLoop(){
        if (this.saveSelectionLoopDeferId === null) {
            this.saveSelectionLoop();
        }
    }

    stopSaveSelectionLoop() {
        if (this.saveSelectionLoopDeferId !== null) {
            cancelDefer(this.saveSelectionLoopDeferId);
            this.saveSelectionLoopDeferId = null;
            this.previousSelection = null;
        }
    }

    getInputDOMNode() {
        if (!this.mounted) {
            return null;
        }

        let input = findDOMNode(this);
        const isDOMNode = typeof window !== 'undefined' && input instanceof window.Element;

        // workaround for react-test-renderer
        // https://github.com/sanniassin/react-input-mask/issues/147
        if (input && !isDOMNode) {
            return null;
        }

        if (input.nodeName !== 'INPUT') {
            input = input.querySelector('input');
        }

        if (!input) {
            throw new Error('react-input-mask: inputComponent doesn\'t contain input node');
        }

        return input;
    }

    getInputValue() {
        const input = this.getInputDOMNode();
        if (!input) {
            return null;
        }

        return input.value;
    }

    setInputValue(value) {
        const input = this.getInputDOMNode();
        if (!input) {
            return;
        }

        this.value = value;
        input.value = value;
    }

    setCursorToEnd() {
        const filledLength = getFilledLength(this.maskOptions, this.value);
        const pos = getRightEditablePosition(this.maskOptions, filledLength);
        if (pos !== null) {
            this.setCursorPosition(pos);
        }
    }

    setSelection(start, end, options = {}) {
        const input = this.getInputDOMNode();
        const isFocused = this.isFocused();
        // don't change selection on unfocused input because Safari sets focus on
        // selection change (#154)
        if (!input || !isFocused) {
            return;
        }

        const {deferred} = options;

        if (!deferred) {
            setInputSelection(input, start, end);
        }

        if (this.selectionDeferId !== null) {
            cancelDefer(this.selectionDeferId);
        }

        // deferred selection update is required for pre-Lollipop Android browser, but
        // for consistent behavior we do it for all browsers
        this.selectionDeferId = defer(() => {
            this.selectionDeferId = null;
            setInputSelection(input, start, end);
        });

        this.previousSelection = {
            start,
            end,
            length: Math.abs(end - start)
        };
    }

    getSelection() {
        const input = this.getInputDOMNode();

        return getInputSelection(input);
    }

    getCursorPosition() {
        return this
            .getSelection()
            .start;
    }

    setCursorPosition(pos) {
        this.setSelection(pos, pos);
    }

    isFocused() {
        return this.focused;
    }

    getBeforeMaskedValueChangeConfig() {
        const {mask, maskChar, permanents, formatChars} = this.maskOptions;
        const {alwaysShowMask} = this.props;

        return {
            mask,
            maskChar,
            permanents,
            alwaysShowMask: !!alwaysShowMask,
            formatChars
        };
    }

    isInputAutofilled(value, selection, previousValue, previousSelection) {
        const input = this.getInputDOMNode();

        // only check for positive match because it will be false negative in case of
        // autofill simulation in tests
        //
        // input.matches throws an exception if selector isn't supported
        try {
            if (input.matches(':-webkit-autofill')) {
                return true;
            }
        } catch (e) {}

        // if input isn't focused then change event must have been triggered either by
        // autofill or event simulation in tests
        if (!this.focused) {
            return true;
        }

        // if cursor has moved to the end while previousSelection forbids it then it
        // must be autofill
        return previousSelection.end < previousValue.length && selection.end === value.length;
    }

    onChange(event) {
        const {beforePasteState} = this;
        let {previousSelection} = this;
        const {beforeMaskedValueChange} = this.props;
        let value = this.getInputValue();
        let previousValue = this.value;
        let selection = this.getSelection();

        // autofill replaces entire value, ignore old one
        // https://github.com/sanniassin/react-input-mask/issues/113
        if (this.isInputAutofilled(value, selection, previousValue, previousSelection)) {
            previousValue = formatValue(this.maskOptions, '');
            previousSelection = {
                start: 0,
                end: 0,
                length: 0
            };
        }

        // set value and selection as if we haven't cleared input in onPaste handler
        if (beforePasteState) {
            previousSelection = beforePasteState.selection;
            previousValue = beforePasteState.value;
            selection = {
                start: previousSelection.start + value.length,
                end: previousSelection.start + value.length,
                length: 0
            };
            value = previousValue.slice(0, previousSelection.start) + value + previousValue.slice(previousSelection.end);
            this.beforePasteState = null;
        }

        const changedState = processChange(this.maskOptions, value, selection, previousValue, previousSelection);
        const enteredString = changedState.enteredString;
        let newSelection = changedState.selection;
        let newValue = changedState.value;

        if (isFunction(beforeMaskedValueChange)) {
            const modifiedValue = beforeMaskedValueChange({
                value: newValue,
                selection: newSelection
            }, {
                value: previousValue,
                selection: previousSelection
            }, enteredString, this.getBeforeMaskedValueChangeConfig());
            newValue = modifiedValue.value;
            newSelection = modifiedValue.selection;
        }

        this.setInputValue(newValue);

        if (isFunction(this.props.onChange)) {
            this
                .props
                .onChange(event);
        }

        if (this.isWindowsPhoneBrowser) {
            this.setSelection(newSelection.start, newSelection.end, {deferred: true});
        } else {
            this.setSelection(newSelection.start, newSelection.end);
        }
    }

    onFocus(event) {
        const {beforeMaskedValueChange} = this.props;
        const {mask, prefix} = this.maskOptions;
        this.focused = true;

        // if autoFocus is set, onFocus triggers before componentDidMount
        this.mounted = true;

        if (mask) {
            if (!this.value) {
                const emptyValue = formatValue(this.maskOptions, prefix);
                let newValue = formatValue(this.maskOptions, emptyValue);
                const filledLength = getFilledLength(this.maskOptions, newValue);
                const cursorPosition = getRightEditablePosition(this.maskOptions, filledLength);
                let newSelection = {
                    start: cursorPosition,
                    end: cursorPosition
                };

                if (isFunction(beforeMaskedValueChange)) {
                    const modifiedValue = beforeMaskedValueChange({
                        value: newValue,
                        selection: newSelection
                    }, {
                        value: this.value,
                        selection: null
                    }, null, this.getBeforeMaskedValueChangeConfig());
                    newValue = modifiedValue.value;
                    newSelection = modifiedValue.selection;
                }

                const isInputValueChanged = newValue !== this.getInputValue();

                if (isInputValueChanged) {
                    this.setInputValue(newValue);
                }

                if (isInputValueChanged && isFunction(this.props.onChange)) {
                    this
                        .props
                        .onChange(event);
                }

                this.setSelection(newSelection.start, newSelection.end);
            } else if (getFilledLength(this.maskOptions, this.value) < this.maskOptions.mask.length) {
                this.setCursorToEnd();
            }

            this.runSaveSelectionLoop();
        }

        if (isFunction(this.props.onFocus)) {
            this
                .props
                .onFocus(event);
        }
    }

    onBlur(event){
        const {beforeMaskedValueChange} = this.props;
        const {mask} = this.maskOptions;

        this.stopSaveSelectionLoop();
        this.focused = false;

        if (mask && !this.props.alwaysShowMask && isEmpty(this.maskOptions, this.value)) {
            let newValue = '';

            if (isFunction(beforeMaskedValueChange)) {
                const modifiedValue = beforeMaskedValueChange({
                    value: newValue,
                    selection: null
                }, {
                    value: this.value,
                    selection: this.previousSelection
                }, null, this.getBeforeMaskedValueChangeConfig());
                newValue = modifiedValue.value;
            }

            const isInputValueChanged = newValue !== this.getInputValue();

            if (isInputValueChanged) {
                this.setInputValue(newValue);
            }

            if (isInputValueChanged && isFunction(this.props.onChange)) {
                this
                    .props
                    .onChange(event);
            }
        }

        if (isFunction(this.props.onBlur)) {
            this
                .props
                .onBlur(event);
        }
    }

    onMouseDown(event){
        // tiny unintentional mouse movements can break cursor position on focus, so we
        // have to restore it in that case
        //
        // https://github.com/sanniassin/react-input-mask/issues/108
        if (!this.focused && document.addEventListener) {
            this.mouseDownX = event.clientX;
            this.mouseDownY = event.clientY;
            this.mouseDownTime = (new Date()).getTime();

            const mouseUpHandler = (mouseUpEvent) => {
                document.removeEventListener('mouseup', mouseUpHandler);

                if (!this.focused) {
                    return;
                }

                const deltaX = Math.abs(mouseUpEvent.clientX - this.mouseDownX);
                const deltaY = Math.abs(mouseUpEvent.clientY - this.mouseDownY);
                const axisDelta = Math.max(deltaX, deltaY);
                const timeDelta = (new Date()).getTime() - this.mouseDownTime;

                if ((axisDelta <= 10 && timeDelta <= 200) || (axisDelta <= 5 && timeDelta <= 300)) {
                    this.setCursorToEnd();
                }
            };

            document.addEventListener('mouseup', mouseUpHandler);
        }

        if (isFunction(this.props.onMouseDown)) {
            this
                .props
                .onMouseDown(event);
        }
    }

    onPaste(event){
        if (isFunction(this.props.onPaste)) {
            this
                .props
                .onPaste(event);
        }

        // event.clipboardData might not work in Android browser cleaning input to get
        // raw text inside onChange handler
        if (!event.defaultPrevented) {
            this.beforePasteState = {
                value: this.getInputValue(),
                selection: this.getSelection()
            };
            this.setInputValue('');
        }
    }

    handleRef(ref) {
        if (this.props.children == null && isFunction(this.props.inputRef)) {
            this
                .props
                .inputRef(ref);
        }
    }

    render() {
        const {
            mask,
            alwaysShowMask,
            maskChar,
            formatChars,
            inputRef,
            beforeMaskedValueChange,
            children,
            style,
            ...restProps
        } = this.props;
        let inputElement = <input ref={this.handleRef} {...restProps} style={{...style,margin: 0}}/>;

        const changedProps = {
            onFocus: this.onFocus,
            onBlur: this.onBlur
        };

        if (this.maskOptions.mask) {
            if (!restProps.disabled && !restProps.readOnly) {
                changedProps.onChange = this.onChange;
                changedProps.onPaste = this.onPaste;
                changedProps.onMouseDown = this.onMouseDown;
            }

            if (restProps.value != null) {
                changedProps.value = this.value;
            }
        }

        inputElement = React.cloneElement(inputElement, changedProps);

        return inputElement;
    }
}

AnterosInputMask.propTypes = {
    disabled: PropTypes.bool,
    style: PropTypes.style,
    readOnly: PropTypes.style,
    className: PropTypes.string
}

AnterosInputMask.defaultProps = {
    disabled : false,
    readOnly: false
}

function isPermanentCharacter(maskOptions, pos) {
    return maskOptions
        .permanents
        .indexOf(pos) !== -1;
}

function isAllowedCharacter(maskOptions, pos, character) {
    const {mask, formatChars} = maskOptions;

    if (!character) {
        return false;
    }

    if (isPermanentCharacter(maskOptions, pos)) {
        return mask[pos] === character;
    }

    const ruleChar = mask[pos];
    const charRule = formatChars[ruleChar];

    return (new RegExp(charRule)).test(character);
}

export function isEmpty(maskOptions, value) {
    return value
        .split('')
        .every((character, i) => {
            return isPermanentCharacter(maskOptions, i) || !isAllowedCharacter(maskOptions, i, character);
        });
}

function getFilledLength(maskOptions, value) {
    const {maskChar, prefix} = maskOptions;

    if (!maskChar) {
        while (value.length > prefix.length && isPermanentCharacter(maskOptions, value.length - 1)) {
            value = value.slice(0, value.length - 1);
        }
        return value.length;
    }

    let filledLength = prefix.length;
    for (let i = value.length; i >= prefix.length; i--) {
        const character = value[i];
        const isEnteredCharacter = !isPermanentCharacter(maskOptions, i) && isAllowedCharacter(maskOptions, i, character);
        if (isEnteredCharacter) {
            filledLength = i + 1;
            break;
        }
    }

    return filledLength;
}

function isFilled(maskOptions, value) {
    return getFilledLength(maskOptions, value) === maskOptions.mask.length;
}

function formatValue(maskOptions, value) {
    const {maskChar, mask, prefix} = maskOptions;

    if (!maskChar) {
        value = insertString(maskOptions, '', value, 0);

        if (value.length < prefix.length) {
            value = prefix;
        }

        while (value.length < mask.length && isPermanentCharacter(maskOptions, value.length)) {
            value += mask[value.length];
        }

        return value;
    }

    if (value) {
        const emptyValue = formatValue(maskOptions, '');
        return insertString(maskOptions, emptyValue, value, 0);
    }

    for (let i = 0; i < mask.length; i++) {
        if (isPermanentCharacter(maskOptions, i)) {
            value += mask[i];
        } else {
            value += maskChar;
        }
    }

    return value;
}

function clearRange(maskOptions, value, start, len) {
    const end = start + len;
    const {maskChar, mask, prefix} = maskOptions;
    const arrayValue = value.split('');

    if (!maskChar) {
        // remove any permanent chars after clear range, they will be added back by
        // formatValue
        for (let i = end; i < arrayValue.length; i++) {
            if (isPermanentCharacter(maskOptions, i)) {
                arrayValue[i] = '';
            }
        }

        start = Math.max(prefix.length, start);
        arrayValue.splice(start, end - start);
        value = arrayValue.join('');

        return formatValue(maskOptions, value);
    }

    return arrayValue.map((character, i) => {
        if (i < start || i >= end) {
            return character;
        }
        if (isPermanentCharacter(maskOptions, i)) {
            return mask[i];
        }
        return maskChar;
    }).join('');
}

function insertString(maskOptions, value, insertStr, insertPosition) {
    const {mask, maskChar, prefix} = maskOptions;
    const arrayInsertStr = insertStr.split('');
    const isInputFilled = isFilled(maskOptions, value);

    const isUsablePosition = (pos, character) => {
        return !isPermanentCharacter(maskOptions, pos) || character === mask[pos];
    };
    const isUsableCharacter = (character, pos) => {
        return !maskChar || !isPermanentCharacter(maskOptions, pos) || character !== maskChar;
    };

    if (!maskChar && insertPosition > value.length) {
        value += mask.slice(value.length, insertPosition);
    }

    arrayInsertStr.every((insertCharacter) => {
        while (!isUsablePosition(insertPosition, insertCharacter)) {
            if (insertPosition >= value.length) {
                value += mask[insertPosition];
            }

            if (!isUsableCharacter(insertCharacter, insertPosition)) {
                return true;
            }

            insertPosition++;

            // stop iteration if maximum value length reached
            if (insertPosition >= mask.length) {
                return false;
            }
        }

        const isAllowed = isAllowedCharacter(maskOptions, insertPosition, insertCharacter) || insertCharacter === maskChar;
        if (!isAllowed) {
            return true;
        }

        if (insertPosition < value.length) {
            if (maskChar || isInputFilled || insertPosition < prefix.length) {
                value = value.slice(0, insertPosition) + insertCharacter + value.slice(insertPosition + 1);
            } else {
                value = value.slice(0, insertPosition) + insertCharacter + value.slice(insertPosition);
                value = formatValue(maskOptions, value);
            }
        } else if (!maskChar) {
            value += insertCharacter;
        }

        insertPosition++;

        // stop iteration if maximum value length reached
        return insertPosition < mask.length;
    });

    return value;
}

function getInsertStringLength(maskOptions, value, insertStr, insertPosition) {
    const {mask, maskChar} = maskOptions;
    const arrayInsertStr = insertStr.split('');
    const initialInsertPosition = insertPosition;

    const isUsablePosition = (pos, character) => {
        return !isPermanentCharacter(maskOptions, pos) || character === mask[pos];
    };

    arrayInsertStr.every((insertCharacter) => {
        while (!isUsablePosition(insertPosition, insertCharacter)) {
            insertPosition++;

            // stop iteration if maximum value length reached
            if (insertPosition >= mask.length) {
                return false;
            }
        }

        const isAllowed = isAllowedCharacter(maskOptions, insertPosition, insertCharacter) || insertCharacter === maskChar;

        if (isAllowed) {
            insertPosition++;
        }

        // stop iteration if maximum value length reached
        return insertPosition < mask.length;
    });

    return insertPosition - initialInsertPosition;
}

function getLeftEditablePosition(maskOptions, pos) {
    for (let i = pos; i >= 0; --i) {
        if (!isPermanentCharacter(maskOptions, i)) {
            return i;
        }
    }
    return null;
}

function getRightEditablePosition(maskOptions, pos) {
    const {mask} = maskOptions;
    for (let i = pos; i < mask.length; ++i) {
        if (!isPermanentCharacter(maskOptions, i)) {
            return i;
        }
    }
    return null;
}

function getStringValue(value) {
    return !value && value !== 0 ? '' : value + '';
}
