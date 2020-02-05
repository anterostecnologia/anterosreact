import React, { Component } from "react";
import lodash from "lodash";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosUtils } from "anteros-react-core";
import {
	AnterosLocalDatasource,
	AnterosRemoteDatasource,
	dataSourceEvents
} from "anteros-react-datasource";
import PropTypes from "prop-types";

class AnterosCheckbox extends Component {
	constructor(props) {
		super(props);
		this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
		this.onClick = this.onClick.bind(this);
		this.idCheckbox = lodash.uniqueId("check");

		if (this.props.dataSource) {
			let value = this.props.dataSource.fieldByName(this.props.dataField);
			if (value == undefined || value == null) {
				value = false;
			}
			this.state = { isChecked: value == this.props.valueChecked };
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
			this.setState({ isChecked: value == nextProps.valueChecked });
		} else {
			this.setState({ isChecked: nextProps.checked });
		}
	}

	componentDidMount() {
		if (this.props.dataSource) {
			this.props.dataSource.addEventListener(
				[
					dataSourceEvents.AFTER_CLOSE,
					dataSourceEvents.AFTER_OPEN,
					dataSourceEvents.AFTER_GOTO_PAGE,
					dataSourceEvents.AFTER_CANCEL,
					dataSourceEvents.AFTER_POST,
					dataSourceEvents.AFTER_SCROLL
				],
				this.onDatasourceEvent
			);
			this.props.dataSource.addEventListener(
				dataSourceEvents.DATA_FIELD_CHANGED,
				this.onDatasourceEvent,
				this.props.dataField
			);
		}
	}

	componentWillUnmount() {
		if (this.props.dataSource) {
			this.props.dataSource.removeEventListener(
				[
					dataSourceEvents.AFTER_CLOSE,
					dataSourceEvents.AFTER_OPEN,
					dataSourceEvents.AFTER_GOTO_PAGE,
					dataSourceEvents.AFTER_CANCEL,
					dataSourceEvents.AFTER_POST,
					dataSourceEvents.AFTER_SCROLL
				],
				this.onDatasourceEvent
			);
			this.props.dataSource.removeEventListener(
				dataSourceEvents.DATA_FIELD_CHANGED,
				this.onDatasourceEvent,
				this.props.dataField
			);
		}
	}

	onDatasourceEvent(event, error) {
		let value = this.props.dataSource.fieldByName(this.props.dataField);
		if (value == undefined || value == null) {
			value = false;
		}
		this.setState({ isChecked: value == this.props.valueChecked });
	}

	onClick(event) {
		if (this.props.readOnly) {
			event.preventDefault();
		}
	}

	toggleCheckboxChange() {
		if (!this.props.readOnly) {
			let checked = !this.state.isChecked;
			if (
				this.props.dataSource &&
				this.props.dataSource.getState !== "dsBrowse"
			) {
				let value = checked
					? this.props.valueChecked
					: this.props.valueUnchecked;
				this.props.dataSource.setFieldByName(this.props.dataField, value);
			} else {
				this.setState({ isChecked: checked });
			}
			if (this.props.onCheckboxChange)
				this.props.onCheckboxChange(this.props.value, checked, this);
		}
	}

	render() {
		let readOnly = this.props.readOnly;
		if (this.props.dataSource && !readOnly) {
			readOnly = this.props.dataSource.getState() == "dsBrowse";
		}

		const colClasses = buildGridClassNames(this.props, false, []);
		const { name, id, value, disabled, rounded } = this.props;
		const { isChecked } = this.state;
		let className = `checkbox ${rounded ? " rounded" : ""}`;
		className = AnterosUtils.buildClassNames(
			className,
			this.props.primary ? "checkbox-primary" : "",
			this.props.info ? "checkbox-info" : "",
			this.props.danger ? "checkbox-danger" : "",
			this.props.warning ? "checkbox-warning" : "",
			this.props.secondary ? "checkbox-secondary" : ""
		);

		let dataToggle, ariaHaspopup, ariaExpanded, ariaControls, href;
		if (this.props.collapseContent) {
			dataToggle = "collapse";
			ariaExpanded = isChecked ? "true" : "false";
			ariaControls = this.props.collapseContent;
			href = "#" + this.props.collapseContent;
			className += " collapsed";
		}

		let icon;
		if (this.props.icon) {
			icon = (
				<i
					data-user={this.props.dataUser}
					className={this.props.icon}
					style={{ color: this.props.iconColor }}
				/>
			);
		}

		return (
			<div
				className={AnterosUtils.buildClassNames(colClasses)}
				style={{
					width: this.props.width,
					height: this.props.height,
					...this.props.style
				}}
			>
				<label style={{ margin: "0" }}>
					<input
						className={className}
						id={id ? id : this.idCheckbox}
						type="checkbox"
						key={id ? id : this.idCheckbox}
						name={name}
						checked={isChecked}
						disabled={disabled}
						readOnly={readOnly}
						onChange={this.toggleCheckboxChange}
						onClick={this.onClick}
						data-toggle={dataToggle}
						aria-haspopup={ariaHaspopup}
						aria-expanded={ariaExpanded}
						aria-controls={ariaControls}
						href={href}
					/>
					{icon}
					{value ?
						<span style={this.props.valueStyle} onClick={this.toggleCheckboxChange}>
							{value}
						</span>
						:
						<span style={this.props.valueStyle} onClick={e => e}>
							{value}
						</span>
					}
				</label>
			</div>
		);
	}
}

AnterosCheckbox.propTypes = {
	dataSource: PropTypes.oneOfType([
		PropTypes.instanceOf(AnterosLocalDatasource),
		PropTypes.instanceOf(AnterosRemoteDatasource)
	]),
	dataField: PropTypes.string,
	value: PropTypes.string.isRequired,
	valueChecked: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.bool,
		PropTypes.number
	]).isRequired,
	valueUnchecked: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.bool,
		PropTypes.number
	]).isRequired,
	onCheckboxChange: PropTypes.func,
	id: PropTypes.string,
	className: PropTypes.string,
	extraSmall: columnProps,
	small: columnProps,
	medium: columnProps,
	large: columnProps,
	extraLarge: columnProps,
	width: PropTypes.string,
	height: PropTypes.string,
	success: PropTypes.bool,
	info: PropTypes.bool,
	warning: PropTypes.bool,
	primary: PropTypes.bool,
	danger: PropTypes.bool,
	secondary: PropTypes.bool,
	default: PropTypes.bool,
	collapseContent: PropTypes.string,
	style: PropTypes.object,
	valueStyle: PropTypes.object,
	icon: PropTypes.string,
	iconColor: PropTypes.string,
	image: PropTypes.string,
	readOnly: PropTypes.bool
};

AnterosCheckbox.defaultProps = {
	valueChecked: true,
	valueUnchecked: false,
	readOnly: false
};

export default AnterosCheckbox;
