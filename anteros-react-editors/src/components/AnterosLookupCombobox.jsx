import AnterosCombobox from "./AnterosCombobox";
import {
	AnterosLocalDatasource,
	AnterosRemoteDatasource,
	dataSourceEvents
} from "anteros-react-datasource";
import PropTypes from "prop-types";
import { AnterosError } from "anteros-react-core";

export default class AnterosLookupCombobox extends AnterosCombobox {
	constructor(props) {
		super(props);

		this.onLookupDatasourceEvent = this.onLookupDatasourceEvent.bind(this);
	}

	componentDidMount() {
		if (this.props.lookupDataSource) { 
			this.props.lookupDataSource.addEventListener([dataSourceEvents.AFTER_OPEN,
			dataSourceEvents.AFTER_POST, dataSourceEvents.AFTER_DELETE], this.onLookupDatasourceEvent);
		}
	}

	componentWillUnmount() {
		if (this.props.lookupDataSource) {
			this.props.lookupDataSource.removeEventListener([dataSourceEvents.AFTER_OPEN,
			dataSourceEvents.AFTER_POST, dataSourceEvents.AFTER_DELETE], this.onLookupDatasourceEvent);
		}
	}

	onLookupDatasourceEvent(event, error) {
		if (
			event == dataSourceEvents.AFTER_OPEN ||
			event == dataSourceEvents.AFTER_POST ||
			event == dataSourceEvents.AFTER_DELETE
		) {
			if (this.props.lookupDataSource) {
				this.buildOptions(this.props);
				this.setState({
					...this.state,
					update: Math.random()
				});
				this.closeMenu();
			}
		}
	}

	getDataSourceFieldValue(props) {
		let _value = "";
		if (props.dataSource) {
			_value = props.dataSource.fieldByName(props.dataField);
			if (_value) {
				if (typeof props.lookupDataFieldText === "function") {
					_value = props.lookupDataFieldText(
						props.dataSource.getCurrentRecord()
					);
				} else {
					_value = _value[this.props.lookupDataFieldId];
				}
			} else if (!_value) {
				_value = "";
			}
		}
		return _value;
	}

	setDataSourceFieldValue(value) {
		if (value != undefined && value != "") {
			if (
				this.props.lookupDataSource.locate({
					[`${this.props.lookupDataFieldId}`]: value
				})
			) {
				if (this.props.dataSource) {
					this.props.dataSource.setFieldByName(
						this.props.dataField,
						this.props.lookupDataSource.getCurrentRecord()
					);
				}
			}
		} else {
			if (this.props.dataSource) {
				this.props.dataSource.setFieldByName(this.props.dataField, undefined);
			}
		}
	}

	buildOptions(props) {
		if (props.options) {
			this._flatOptions = this.flattenOptions(props.options);
		} else if (props.children) {
			this._flatOptions = this.flattenOptions(this.rebuildOptions(props.children));
		} else if (props.lookupDataSource) {
			this._flatOptions = this.flattenOptions(this.rebuildOptions());
		}
	}

	rebuildOptions(children) {
		let options = [];
		let _this = this;

		if (this.props.lookupDataSource && this.props.lookupDataSource.getTotalRecords() > 0) {
			this.props.lookupDataSource.getData().map(record => {
				if (
					!record.hasOwnProperty(_this.props.lookupDataFieldId) ||
					!record[_this.props.lookupDataFieldId]
				) {
					throw new AnterosError(
						"Foi encontrado um registro sem ID no dataSource passado para o Select."
					);
				}
				if (typeof _this.props.lookupDataFieldText !== "function") {
					if (
						!record.hasOwnProperty(_this.props.lookupDataFieldText) ||
						!record[_this.props.lookupDataFieldText]
					) {
						throw new AnterosError(
							"Foi encontrado um registro sem o texto no dataSource passado para a Select."
						);
					}
				}

				options.push({
					label: record.label ? record.label : _this.getTextValue(record),
					disabled: record.disabled,
					value: record[_this.props.lookupDataFieldId]
				});
			});
		}
		return options;
	}

	getTextValue(record) {
		if (typeof this.props.lookupDataFieldText === "function") {
			return this.props.lookupDataFieldText(record);
		} else {
			return record[this.props.lookupDataFieldText];
		}
	}
}

AnterosLookupCombobox.propTypes = {
	...AnterosCombobox.propTypes,
	lookupDataSource: PropTypes.oneOfType([
		PropTypes.instanceOf(AnterosLocalDatasource),
		PropTypes.instanceOf(AnterosRemoteDatasource)
	]).isRequired,
	lookupDataFieldText: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
	lookupDataFieldId: PropTypes.string.isRequired
};

AnterosLookupCombobox.defaultProps = {
	...AnterosCombobox.defaultProps
};
