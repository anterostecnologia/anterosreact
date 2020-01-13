//https://sanusart.github.io/react-dropdown-select/api
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { AnterosClickOutside } from "anteros-react-core";

const LIB_NAME = 'anteros-dropdown-select';

const valueExistInSelected = (value, values, props) =>
  !!values.find((val) => getByPath(val, props['valueField']) === value);

const hexToRGBA = (hex, alpha) => {
  const RR = parseInt(hex.slice(1, 3), 16);
  const GG = parseInt(hex.slice(3, 5), 16);
  const BB = parseInt(hex.slice(5, 7), 16);

  return `rgba(${RR}, ${GG}, ${BB}${alpha && `, ${alpha}`})`;
};

const debounce = (fn, delay = 0) => {
  let timerId;

  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
};

const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const getByPath = (object, path) => {
  if (!path) {
    return;
  }

  return path.split('.').reduce((acc, value) => acc[value], object)
};

const getProp = (object, path, defaultValue) => {
  if (!path) {
    return object;
  }

  const normalizedPath = Array.isArray(path) ? path : path.split('.').filter((item) => item.length);

  if (!normalizedPath.length) {
    return object === undefined ? defaultValue : object;
  }

  return getProp(object[normalizedPath.shift()], normalizedPath, defaultValue);
};



const dropdownPosition = (props, methods) => {
    const DropdownBoundingClientRect = methods.getSelectRef().getBoundingClientRect();
    const dropdownHeight =
      DropdownBoundingClientRect.bottom + parseInt(props.dropdownHeight, 10) + parseInt(props.dropdownGap, 10);
  
    if (props.dropdownPosition !== 'auto') {
      return props.dropdownPosition;
    }
  
    if (dropdownHeight > window.innerHeight && dropdownHeight > DropdownBoundingClientRect.top) {
      return 'top';
    }
  
    return 'bottom';
  };


  const handlePlaceHolder = (props, state) => {
    const { addPlaceholder, searchable, placeholder } = props;
    const noValues = state.values && state.values.length === 0;
    const hasValues = state.values && state.values.length > 0;
  
    if (hasValues && addPlaceholder && searchable) {
      return addPlaceholder;
    }
  
    if (noValues) {
      return placeholder;
    }
  
    if (hasValues && !searchable) {
      return '';
    }
  
    return '';
  };

  const Loading = ({ props }) =>
  props.loadingRenderer ? (
    props.loadingRenderer({ props })
  ) : (
    <LoadingComponent className={`${LIB_NAME}-loading`} color={props.color} />
  );

  const NoData = ({ props, state, methods }) =>
  props.noDataRenderer ? (
    props.noDataRenderer({ props, state, methods })
  ) : (
    <NoDataComponent className={`${LIB_NAME}-no-data`} color={props.color}>
      {props.noDataLabel}
    </NoDataComponent>
  );

const NoDataComponent = styled.div`
  padding: 10px;
  text-align: center;
  color: ${({ color }) => color};
`;


const Option = ({ item, props, state, methods }) =>
  item && props.optionRenderer ? (
    props.optionRenderer({ item, props, state, methods })
  ) : (
    <OptionComponent
      role="listitem"
      disabled={props.disabled}
      direction={props.direction}
      className={`${LIB_NAME}-option`}
      color={props.color}>
      <span className={`${LIB_NAME}-option-label`}>{getByPath(item, props.labelField)}</span>
      <span
        className={`${LIB_NAME}-option-remove`}
        onClick={(event) => methods.removeItem(event, item, props.closeOnSelect)}>
        &times;
      </span>
    </OptionComponent>
  );

const OptionComponent = styled.span`
  padding: 0 5px;
  border-radius: 2px;
  line-height: 21px;
  margin: 3px 0 3px 5px;
  background: ${({ color }) => color};
  color: #fff;
  display: flex;
  flex-direction: ${({ direction }) => direction === 'rtl' ? 'row-reverse' : 'row'};
  
  .${LIB_NAME}-option-remove {
    cursor: pointer;
    width: 22px;
    height: 22px;
    display: inline-block;
    text-align: center;
    margin: 0 -5px 0 0px;
    border-radius: 0 3px 3px 0;
    :hover {
      color: tomato;
    }
  }
  :hover,
  :hover > span {
    opacity: 0.9;
  }
`;

const Separator = ({ props, state, methods }) =>
  props.separatorRenderer ? (
    props.separatorRenderer({ props, state, methods })
  ) : (
    <SeparatorComponent className={`${LIB_NAME}-separator`} />
  );

const SeparatorComponent = styled.div`
  border-left: 1px solid #ccc;
  width: 1px;
  height: 25px;
  display: block;
`;

const LoadingComponent = styled.div`
  @keyframes dual-ring-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(180deg);
    }
  }
  padding: 0 5px;
  display: block;
  width: auto;
  height: auto;
  :after {
    content: ' ';
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border-width: 1px;
    border-style: solid;
    border-color: ${({ color }) => color} transparent;
    animation: dual-ring-spin 0.7s ease-in-out infinite;
    margin: 0 0 0 -10px;
  }
`;


  class Item extends Component {
    item = React.createRef();
  
    componentDidUpdate() {
      if (this.props.state.cursor === this.props.itemIndex) {
        this.item.current &&
          this.item.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  
    render() {
      const { props, state, methods, item, itemIndex } = this.props;
  
      if (props.itemRenderer) {
        return props.itemRenderer({ item, itemIndex, props, state, methods });
      }
  
      if (!props.keepSelectedInList && methods.isSelected(item)) {
        return null;
      }
  
      return (
        <ItemComponent
          role="option"
          ref={this.item}
          aria-selected={methods.isSelected(item)}
          aria-disabled={item.disabled}
          disabled={item.disabled}
          aria-label={getByPath(item, props.labelField)}
          key={`${getByPath(item, props.valueField)}${getByPath(item, props.labelField)}`}
          tabIndex="-1"
          className={`${LIB_NAME}-item ${
            methods.isSelected(item) ? `${LIB_NAME}-item-selected` : ''
          } ${state.cursor === itemIndex ? `${LIB_NAME}-item-active` : ''} ${
            item.disabled ? `${LIB_NAME}-item-disabled` : ''
          }`}
          onClick={item.disabled ? undefined : () => methods.addItem(item)}
          onKeyPress={item.disabled ? undefined : () => methods.addItem(item)}
          color={props.color}>
          {getByPath(item, props.labelField)} {item.disabled && <ins>{props.disabledLabel}</ins>}
        </ItemComponent>
      );
    }
  }
  
  Item.propTypes = {
    props: PropTypes.any,
    state: PropTypes.any,
    methods: PropTypes.any,
    item: PropTypes.any,
    itemIndex: PropTypes.any
  };
  
  const ItemComponent = styled.span`
    padding: 5px 10px;
    cursor: pointer;
    border-bottom: 1px solid #fff;
    &.${LIB_NAME}-item-active {
      border-bottom: 1px solid #fff;
      ${({ disabled, color }) => !disabled && color && `background: ${hexToRGBA(color, 0.1)};`}
    }
    :hover,
    :focus {
      background: ${({ color }) => color && hexToRGBA(color, 0.1)};
      outline: none;
    }
    &.${LIB_NAME}-item-selected {
      ${({ disabled, color }) =>
        disabled
          ? `
      background: #f2f2f2;
      color: #ccc;
      `
          : `
      background: ${color};
      color: #fff;
      border-bottom: 1px solid #fff;
      `}
    }
    ${({ disabled }) =>
      disabled
        ? `
      background: #f2f2f2;
      color: #ccc;
      ins {
        text-decoration: none;
        border:1px solid #ccc;
        border-radius: 2px;
        padding: 0px 3px;
        font-size: x-small;
        text-transform: uppercase;
      }
      `
        : ''}
  `;
  
  
  class Input extends Component {
    input = React.createRef();
  
    componentDidUpdate(prevProps) {
      if (
        this.props.state.dropdown || (prevProps.state.dropdown !== this.props.state.dropdown && this.props.state.dropdown) ||
        this.props.props.autoFocus
      ) {
        this.input.current.focus();
      }
  
      if (prevProps.state.dropdown !== this.props.state.dropdown && !this.props.state.dropdown) {
        this.input.current.blur();
      }
    }
  
    onBlur = () => {
      if (!this.props.state.dropdown) {
        return this.input.current.blur();
      }
  
      return this.input.current.focus();
    };
  
    handleKeyPress = (event) => {
      const { props, state, methods } = this.props;
  
      return (
        props.create &&
        event.key === 'Enter' &&
        !valueExistInSelected(state.search, state.values, this.props) &&
        state.search &&
        state.cursor === null &&
        methods.createNew(state.search)
      );
    };
  
    render() {
      const { props, state, methods } = this.props;
  
      if (props.inputRenderer) {
        return props.inputRenderer({ props, state, methods, inputRef: this.input });
      }
  
      return (
        <InputComponent
          ref={this.input}
          tabIndex="-1"
          className={`${LIB_NAME}-input`}
          size={methods.getInputSize()}
          value={state.search}
          readOnly={!props.searchable}
          onClick={() => methods.dropDown('open')}
          onKeyPress={this.handleKeyPress}
          onChange={methods.setSearch}
          onBlur={this.onBlur}
          placeholder={handlePlaceHolder(props, state)}
        />
      );
    }
  }
  
  Input.propTypes = {
    props: PropTypes.object,
    state: PropTypes.object,
    methods: PropTypes.object
  };
  
  const InputComponent = styled.input`
    line-height: inherit;
    width: calc(${({ size }) => `${size}ch`} + 5px);
    border: none;
    margin-left: 5px;
    background: transparent;
    font-size: smaller;
    ${({ readOnly }) => readOnly && 'cursor: pointer;'}
    :focus {
      outline: none;
    }
  `;


  const DropdownHandle = ({ props, state, methods }) =>
  props.dropdownHandleRenderer ? (
    props.dropdownHandleRenderer({ props, state, methods })
  ) : (
    <DropdownHandleComponent
      tabIndex="-1"
      onClick={(event) => methods.dropDown(state.dropdown ? 'close': 'open', event)}
      dropdownOpen={state.dropdown}
      onKeyPress={(event) => methods.dropDown('toggle', event)}
      onKeyDown={(event) => methods.dropDown('toggle', event)}
      className={`${LIB_NAME}-dropdown-handle`}
      color={props.color}>
      <svg fill="currentColor" viewBox="0 0 40 40"><path d="M31 26.4q0 .3-.2.5l-1.1 1.2q-.3.2-.6.2t-.5-.2l-8.7-8.8-8.8 8.8q-.2.2-.5.2t-.5-.2l-1.2-1.2q-.2-.2-.2-.5t.2-.5l10.4-10.4q.3-.2.6-.2t.5.2l10.4 10.4q.2.2.2.5z"/></svg>
    </DropdownHandleComponent>
  );

const DropdownHandleComponent = styled.div`
  text-align: center;
  ${({ dropdownOpen }) =>
    dropdownOpen
      ? `
      pointer-events: all;
      transform: rotate(0deg);
      margin: 0px 0 -3px 5px;
      `
      : `
      pointer-events: none;
      margin: 0 0 0 5px;
      transform: rotate(180deg);
      `};
  cursor: pointer;
  svg {
    width: 16px;
    height: 16px;
  }
  :hover {
    path {
      stroke: ${({ color }) => color};
    }
  }
  :focus {
    outline: none;
    path {
      stroke: ${({ color }) => color};
    }
  }
`;
  
  const Dropdown = ({ props, state, methods }) => (
    <DropDown
      tabIndex="-1"
      aria-expanded="true"
      role="list"
      dropdownPosition={dropdownPosition(props, methods)}
      selectBounds={state.selectBounds}
      portal={props.portal}
      dropdownGap={props.dropdownGap}
      dropdownHeight={props.dropdownHeight}
      className={`${LIB_NAME}-dropdown ${LIB_NAME}-dropdown-position-${dropdownPosition(
        props,
        methods
      )}`}>
      {props.dropdownRenderer ? (
        props.dropdownRenderer({ props, state, methods })
      ) : (
        <React.Fragment>
          {props.create && state.search && !valueExistInSelected(state.search, state.values, props) && (
            <AddNew
              className={`${LIB_NAME}-dropdown-add-new`}
              color={props.color}
              onClick={() => methods.createNew(state.search)}>
              {props.createNewLabel.replace('{search}', `"${state.search}"`)}
            </AddNew>
          )}
          {methods.searchResults().length === 0 ? (
            <NoData
              className={`${LIB_NAME}-no-data`}
              state={state}
              props={props}
              methods={methods}
            />
          ) : (
            methods
              .searchResults()
              .map((item, itemIndex) => (
                <Item
                  key={item[props.valueField]}
                  item={item}
                  itemIndex={itemIndex}
                  state={state}
                  props={props}
                  methods={methods}
                />
              ))
          )}
        </React.Fragment>
      )}
    </DropDown>
  );
  
  const DropDown = styled.div`
    position: absolute;
    ${({ selectBounds, dropdownGap, dropdownPosition }) =>
      dropdownPosition === 'top'
        ? `bottom: ${selectBounds.height + 2 + dropdownGap}px`
        : `top: ${selectBounds.height + 2 + dropdownGap}px`};
    
    ${({ selectBounds, dropdownGap, portal }) =>
      portal
        ? `
        position: fixed;
        top: ${selectBounds.bottom + dropdownGap}px;
        left: ${selectBounds.left - 1}px;`
        : 'left: -1px;'};
    border: 1px solid #ccc;
    width: ${({ selectBounds }) => selectBounds.width}px;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 0 10px 0 ${() => hexToRGBA('#000000', 0.2)};
    max-height: ${({ dropdownHeight }) => dropdownHeight};
    overflow: auto;
    z-index: 9;
    
    :focus {
      outline: none;
    }
  }
  `;
  
  const AddNew = styled.div`
    color: ${({ color }) => color};
    padding: 5px 10px;
    :hover {
      background: ${({ color }) => color && hexToRGBA(color, 0.1)};
      outline: none;
      cursor: pointer;
    }
  `;


const Content = ({ props, state, methods }) => {
    return (
      <ContentComponent
        className={`${LIB_NAME}-content ${
          props.multi ? `${LIB_NAME}-type-multi` : `${LIB_NAME}-type-single`
        }`}
        onClick={() => methods.dropDown('open')}>
        {props.contentRenderer ? (
          props.contentRenderer({ props, state, methods })
        ) : (
          <React.Fragment>
            {props.multi
              ? state.values &&
                state.values.map((item) => (
                  <Option
                    key={`${getByPath(item, props.valueField)}${getByPath(item, props.labelField)}`}
                    item={item}
                    state={state}
                    props={props}
                    methods={methods}
                  />
                ))
              : state.values &&
                state.values.length > 0 && <span>{getByPath(state.values[0], props.labelField)}</span>}
            <Input props={props} methods={methods} state={state} />
          </React.Fragment>
        )}
      </ContentComponent>
    );
  };
  
  const ContentComponent = styled.div`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
  `;


const Clear = ({ props, state, methods }) =>
  props.clearRenderer ? (
    props.clearRenderer({ props, state, methods })
  ) : (
    <ClearComponent
      className={`${LIB_NAME}-clear`}
      tabIndex="-1"
      onClick={() => methods.clearAll()}
      onKeyPress={() => methods.clearAll()}>
      &times;
    </ClearComponent>
  );

const ClearComponent = styled.div`
  line-height: 25px;
  margin: 0 10px;
  cursor: pointer;
  :focus {
    outline: none;
  }
  :hover {
    color: tomato;
  }
`;

export default class AnterosDropdownSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdown: false,
      values: props.values,
      search: '',
      selectBounds: {},
      cursor: null
    };

    this.methods = {
      removeItem: this.removeItem,
      dropDown: this.dropDown,
      addItem: this.addItem,
      setSearch: this.setSearch,
      getInputSize: this.getInputSize,
      toggleSelectAll: this.toggleSelectAll,
      clearAll: this.clearAll,
      selectAll: this.selectAll,
      searchResults: this.searchResults,
      getSelectRef: this.getSelectRef,
      isSelected: this.isSelected,
      getSelectBounds: this.getSelectBounds,
      areAllSelected: this.areAllSelected,
      handleKeyDown: this.handleKeyDown,
      activeCursorItem: this.activeCursorItem,
      createNew: this.createNew,
      sortBy: this.sortBy,
      safeString: this.safeString
    };

    this.select = React.createRef();
    this.dropdownRoot = typeof document !== 'undefined' && document.createElement('div');
  }

  componentDidMount() {
    this.props.portal && this.props.portal.appendChild(this.dropdownRoot);
    window.addEventListener('resize', debounce(this.updateSelectBounds));
    window.addEventListener('scroll', debounce(this.onScroll));

    this.dropDown('close');

    if (this.select) {
      this.updateSelectBounds();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !isEqual(prevProps.values, this.props.values) &&
      isEqual(prevProps.values, prevState.values)
    ) {
      this.setState({
        values: this.props.values
      }, () => {
        this.props.onChange(this.state.values);
      });
      this.updateSelectBounds();
    }

    if (prevState.values !== this.state.values) {
      this.props.onChange(this.state.values);
      this.updateSelectBounds();
    }

    if (prevState.search !== this.state.search) {
      this.updateSelectBounds();
    }

    if (prevState.values !== this.state.values && this.props.closeOnSelect) {
      this.dropDown('close');
    }

    if (prevProps.multi !== this.props.multi) {
      this.updateSelectBounds();
    }

    if (prevState.dropdown && prevState.dropdown !== this.state.dropdown) {
      this.onDropdownClose();
    }

    if (!prevState.dropdown && prevState.dropdown !== this.state.dropdown) {
      this.props.onDropdownOpen();
    }
  }

  componentWillUnmount() {
    this.props.portal && this.props.portal.removeChild(this.dropdownRoot);
    window.removeEventListener(
      'resize',
      debounce(this.updateSelectBounds, this.props.debounceDelay)
    );
    window.removeEventListener('scroll', debounce(this.onScroll, this.props.debounceDelay));
  }

  onDropdownClose = () => {
    this.setState({ cursor: null });
    this.props.onDropdownClose();
  };

  onScroll = () => {
    if (this.props.closeOnScroll) {
      this.dropDown('close');
    }

    this.updateSelectBounds();
  };

  updateSelectBounds = () =>
    this.select.current &&
    this.setState({
      selectBounds: this.select.current.getBoundingClientRect()
    });

  getSelectBounds = () => this.state.selectBounds;

  dropDown = (action = 'toggle', event) => {
    const target = (event && event.target) || (event && event.srcElement);

    if (
      this.props.portal &&
      !this.props.closeOnScroll &&
      !this.props.closeOnSelect &&
      event &&
      target &&
      target.offsetParent &&
      target.offsetParent.classList.contains('react-dropdown-select-dropdown')
    ) {
      return;
    }

    if (this.props.keepOpen) {
      return this.setState({ dropdown: true });
    }

    if (action === 'close' && this.state.dropdown) {
      this.select.current.blur();

      return this.setState({
        dropdown: false,
        search: this.props.clearOnBlur ? '' : this.state.search
      });
    }

    if (action === 'open' && !this.state.dropdown) {
      return this.setState({ dropdown: true });
    }

    if (action === 'toggle') {
      this.select.current.focus();
      return this.setState({ dropdown: !this.state.dropdown });
    }

    return false;
  };

  getSelectRef = () => this.select.current;

  addItem = (item) => {
    if (this.props.multi) {
      if (
        valueExistInSelected(getByPath(item, this.props.valueField), this.state.values, this.props)
      ) {
        return this.removeItem(null, item, false);
      }

      this.setState({
        values: [...this.state.values, item]
      });
    } else {
      this.setState({
        values: [item],
        dropdown: false
      });
    }

    this.props.clearOnSelect && this.setState({ search: '' });

    return true;
  };

  removeItem = (event, item, close = false) => {
    if (event && close) {
      event.preventDefault();
      event.stopPropagation();
      this.dropDown('close');
    }

    this.setState({
      values: this.state.values.filter(
        (values) =>
          getByPath(values, this.props.valueField) !== getByPath(item, this.props.valueField)
      )
    });
  };

  setSearch = (event) => {
    this.setState({
      cursor: null
    });

    this.setState({
      search: event.target.value
    });
  };

  getInputSize = () => {
    if (this.state.search) {
      return this.state.search.length;
    }

    if (this.state.values.length > 0) {
      return this.props.addPlaceholder.length;
    }

    return this.props.placeholder.length;
  };

  toggleSelectAll = () => {
    return this.setState({
      values: this.state.values.length === 0 ? this.selectAll() : this.clearAll()
    });
  };

  clearAll = () => {
    this.props.onClearAll();
    this.setState({
      values: []
    });
  };

  selectAll = (valuesList=[]) => {
    this.props.onSelectAll();
    const values = valuesList.length > 0
      ? valuesList
      : this.props.options.filter((option) => !option.disabled);

    this.setState({ values });
  };

  isSelected = (option) =>
    !!this.state.values.find(
      (value) =>
        getByPath(value, this.props.valueField) === getByPath(option, this.props.valueField)
    );

  areAllSelected = () =>
    this.state.values.length === this.props.options.filter((option) => !option.disabled).length;

  safeString = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  sortBy = () => {
    const { sortBy, options } = this.props;

    if (!sortBy) {
      return options;
    }

    options.sort((a, b) => {
      if (getProp(a, sortBy) < getProp(b, sortBy)) {
        return -1;
      } else if (getProp(a, sortBy) > getProp(b, sortBy)) {
        return 1;
      } else {
        return 0;
      }
    });

    return options;
  };

  searchFn = ({ state, methods }) => {
    const regexp = new RegExp(methods.safeString(state.search), 'i');

    return methods
      .sortBy()
      .filter((item) =>
        regexp.test(getByPath(item, this.props.searchBy) || getByPath(item, this.props.valueField))
      );
  };

  searchResults = () => {
    const args = { state: this.state, props: this.props, methods: this.methods };

    return this.props.searchFn(args) || this.searchFn(args);
  };

  activeCursorItem = (activeCursorItem) =>
    this.setState({
      activeCursorItem
    });

  handleKeyDown = (event) => {
    const args = {
      event,
      state: this.state,
      props: this.props,
      methods: this.methods,
      setState: this.setState.bind(this)
    };

    return this.props.handleKeyDownFn(args) || this.handleKeyDownFn(args);
  };

  handleKeyDownFn = ({ event, state, props, methods, setState }) => {
    const { cursor } = state;
    const escape = event.key === 'Escape';
    const enter = event.key === 'Enter';
    const arrowUp = event.key === 'ArrowUp';
    const arrowDown = event.key === 'ArrowDown';
    const tab = event.key === 'Tab' && !event.shiftKey;
    const shiftTab = event.shiftKey && event.key === 'Tab';

    if ((arrowDown || tab) && cursor === null) {
      return setState({
        cursor: 0
      });
    }

    if (arrowUp || arrowDown || shiftTab || tab) {
      event.preventDefault();
    }

    if (escape) {
      this.dropDown('close');
    }

    if (enter) {
      const currentItem = methods.searchResults()[cursor];
      if (currentItem && !currentItem.disabled) {
        if (props.create && valueExistInSelected(state.search, state.values, props)) {
          return null;
        }

        methods.addItem(currentItem);
      }
    }

    if ((arrowDown || tab) && methods.searchResults().length === cursor) {
      return setState({
        cursor: 0
      });
    }

    if (arrowDown || tab) {
      setState((prevState) => ({
        cursor: prevState.cursor + 1
      }));
    }

    if ((arrowUp || shiftTab) && cursor > 0) {
      setState((prevState) => ({
        cursor: prevState.cursor - 1
      }));
    }

    if ((arrowUp || shiftTab) && cursor === 0) {
      setState({
        cursor: methods.searchResults().length
      });
    }
  };

  renderDropdown = () =>
    this.props.portal ? (
      ReactDOM.createPortal(
        <Dropdown props={this.props} state={this.state} methods={this.methods} />,
        this.dropdownRoot
      )
    ) : (
      <Dropdown props={this.props} state={this.state} methods={this.methods} />
    );

  createNew = (item) => {
    const newValue = {
      [this.props.labelField]: item,
      [this.props.valueField]: item
    };

    this.addItem(newValue);
    this.props.onCreateNew(newValue);
    this.setState({ search: '' });
  };

  render() {
    return (
      <AnterosClickOutside onClickOutside={(event) => this.dropDown('close', event)}>
        <AnterosDropdownSelectDiv
          onKeyDown={this.handleKeyDown}
          onClick={(event) => this.dropDown('open', event)}
          onFocus={(event) => this.dropDown('open', event)}
          tabIndex="0"
          direction={this.props.direction}
          style={this.props.style}
          ref={this.select}
          disabled={this.props.disabled}
          className={`${LIB_NAME} ${this.props.className}`}
          color={this.props.color}
          {...this.props.additionalProps}>
          <Content props={this.props} state={this.state} methods={this.methods} />

          {this.props.name && (
            <input name={this.props.name} type="hidden" value={this.props.values} />
          )}

          {this.props.loading && <Loading props={this.props} />}

          {this.props.clearable && (
            <Clear props={this.props} state={this.state} methods={this.methods} />
          )}

          {this.props.separator && (
            <Separator props={this.props} state={this.state} methods={this.methods} />
          )}

          {this.props.dropdownHandle && (
            <DropdownHandle
              onClick={() => this.select.current.focus()}
              props={this.props}
              state={this.state}
              methods={this.methods}
            />
          )}

          {this.state.dropdown && this.renderDropdown()}
        </AnterosDropdownSelectDiv>
      </AnterosClickOutside>
    );
  }
}

AnterosDropdownSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    onDropdownClose: PropTypes.func,
    onDropdownOpen: PropTypes.func,
    onClearAll: PropTypes.func,
    onSelectAll: PropTypes.func,
    values: PropTypes.array,
    options: PropTypes.array.isRequired,
    keepOpen: PropTypes.bool,
    dropdownGap: PropTypes.number,
    multi: PropTypes.bool,
    placeholder: PropTypes.string,
    addPlaceholder: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    loading: PropTypes.bool,
    clearable: PropTypes.bool,
    searchable: PropTypes.bool,
    separator: PropTypes.bool,
    dropdownHandle: PropTypes.bool,
    searchBy: PropTypes.string,
    sortBy: PropTypes.string,
    closeOnScroll: PropTypes.bool,
    openOnTop: PropTypes.bool,
    style: PropTypes.object,
    contentRenderer: PropTypes.func,
    dropdownRenderer: PropTypes.func,
    itemRenderer: PropTypes.func,
    noDataRenderer: PropTypes.func,
    optionRenderer: PropTypes.func,
    inputRenderer: PropTypes.func,
    loadingRenderer: PropTypes.func,
    clearRenderer: PropTypes.func,
    separatorRenderer: PropTypes.func,
    dropdownHandleRenderer: PropTypes.func,
    direction: PropTypes.string
  };

AnterosDropdownSelect.defaultProps = {
  addPlaceholder: '',
  placeholder: 'Selecione...',
  values: [],
  options: [],
  multi: false,
  disabled: false,
  searchBy: 'label',
  sortBy: null,
  clearable: false,
  searchable: true,
  dropdownHandle: true,
  separator: false,
  keepOpen: undefined,
  noDataLabel: 'Sem dados',
  createNewLabel: 'Adicionar {search}',
  disabledLabel: 'disabled',
  dropdownGap: 5,
  closeOnScroll: false,
  debounceDelay: 0,
  labelField: 'label',
  valueField: 'value',
  color: '#0074D9',
  keepSelectedInList: true,
  closeOnSelect: false,
  clearOnBlur: true,
  clearOnSelect: true,
  dropdownPosition: 'bottom',
  dropdownHeight: '300px',
  autoFocus: false,
  portal: null,
  create: false,
  direction: 'ltr',
  name: null,
  onChange: () => undefined,
  onDropdownOpen: () => undefined,
  onDropdownClose: () => undefined,
  onClearAll: () => undefined,
  onSelectAll: () => undefined,
  onCreateNew: () => undefined,
  searchFn: () => undefined,
  handleKeyDownFn: () => undefined,
  additionalProps: null
};

const AnterosDropdownSelectDiv = styled.div`
  position: relative;
  display: flex;
  border: 1px solid #ccc;
  width: 100%;
  border-radius: 2px;
  padding: 2px 5px;
  flex-direction: row;
  direction: ${({ direction }) => direction};
  align-items: center;
  cursor: pointer;
  min-height: 36px;
  ${({ disabled }) =>
    disabled ? 'cursor: not-allowed;pointer-events: none;opacity: 0.3;' : 'pointer-events: all;'}
  :hover,
  :focus-within {
    border-color: ${({ color }) => color};
  }
  :focus,
  :focus-within {
    outline: 0;
    box-shadow: 0 0 0 3px ${({ color }) => hexToRGBA(color, 0.2)};
  }
`;

