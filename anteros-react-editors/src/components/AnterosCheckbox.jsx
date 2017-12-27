import React, { Component } from 'react';
import lodash from 'lodash';
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import {AnterosUtils} from "anteros-react-core";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";

class AnterosCheckbox extends Component {
    constructor(props) {
        super(props);
        this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
        this.idCheckbox = lodash.uniqueId('check');

        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (value == undefined || value == null) {
                value = false;
            }
            this.state = { isChecked: (value == this.props.valueChecked) };
        } else {
            this.state = { isChecked: this.props.checked };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (value == undefined || value == null) {
                value = false;
            }
            this.state = { isChecked: (value == nextProps.valueChecked) };
        } else {
            this.state = { isChecked: nextProps.checked };
        }
    }

    componentDidMount() {
        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_POST,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    componentWillUnmount() {
        if ((this.props.dataSource)) {
            this.props.dataSource.removeEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_POST,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    onDatasourceEvent(event, error) {
        let value = this.props.dataSource.fieldByName(this.props.dataField);
        if (value == undefined || value == null) {
            value = false;
        }
        this.setState({ isChecked: (value == this.props.valueChecked) });
    }

    toggleCheckboxChange() {
        let checked = !this.state.isChecked;
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            let value = (checked ? this.props.valueChecked : this.props.valueUnchecked);
            this.props.dataSource.setFieldByName(this.props.dataField, value);
        } else {
            this.setState(({ isChecked }) => ({ isChecked: checked }));
        }
        if (this.props.onCheckboxChange)
            this.props.onCheckboxChange(this.props.value, checked, this);
    }

    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);
        const { name, id, value, disabled, rounded } = this.props;
        const { isChecked } = this.state;
        let className = `checkbox ${(rounded ? " rounded" : "")}`;
        className = AnterosUtils.buildClassNames(className, (this.props.primary ? "checkbox-primary" : ""),
            (this.props.info ? "checkbox-info" : ""),
            (this.props.danger ? "checkbox-danger" : ""),
            (this.props.warning ? "checkbox-warning" : ""),
            (this.props.secondary ? "checkbox-secondary" : ""));

        let dataToggle, ariaHaspopup, ariaExpanded, ariaControls, href;    
        if (this.props.collapseContent) {
            dataToggle = "collapse";
            ariaExpanded = (isChecked?"true":"false");
            ariaControls = this.props.collapseContent;
            href = "#" + this.props.collapseContent;
            className += " collapsed";
        }

        return (
            <div className={AnterosUtils.buildClassNames(colClasses)} style={{ width: this.props.width, height: this.props.height }}>
                <label style={{ margin: "0" }}>
                    <input className={className} id={id ? id : this.idCheckbox}
                        type="checkbox"
                        key={id ? id : this.idCheckbox}
                        name={name}
                        checked={isChecked}
                        disabled={disabled}
                        readOnly={readOnly}
                        onChange={this.toggleCheckboxChange}
                        data-toggle={dataToggle} aria-haspopup={ariaHaspopup} aria-expanded={ariaExpanded} aria-controls={ariaControls} href={href}
                    />
                    <span onClick={e => (e)}>{value}</span>
                </label>
            </div>
        );
    }
}

AnterosCheckbox.propTypes = {
    dataSource: React.PropTypes.oneOfType([
        React.PropTypes.instanceOf(AnterosLocalDatasource),
        React.PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: React.PropTypes.string,
    value: React.PropTypes.string.isRequired,
    valueChecked: React.PropTypes.oneOfType([React.PropTypes.string,
    React.PropTypes.bool,
    React.PropTypes.number]).isRequired,
    valueUnchecked: React.PropTypes.oneOfType([React.PropTypes.string,
    React.PropTypes.bool,
    React.PropTypes.number]).isRequired,
    onCheckboxChange: React.PropTypes.func,
    id: React.PropTypes.string,
    className: React.PropTypes.string,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    default: React.PropTypes.bool,
    collapseContent : React.PropTypes.string
};

AnterosCheckbox.defaultProps = {
    valueChecked: true,
    valueUnchecked: false
}

export default AnterosCheckbox;