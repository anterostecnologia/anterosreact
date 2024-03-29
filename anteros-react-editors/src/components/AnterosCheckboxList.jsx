import React, { createElement, Children, Component } from "react";
import lodash from "lodash";
import { AnterosError, AnterosUtils } from "@anterostecnologia/anteros-react-core";
import PropTypes from "prop-types";
import AnterosCheckbox from "./AnterosCheckbox";
import {
	AnterosRemoteDatasource,
	AnterosLocalDatasource,
	dataSourceEvents
} from "@anterostecnologia/anteros-react-datasource";

const DATASOURCE_EVENTS = [
	dataSourceEvents.AFTER_CLOSE,
	dataSourceEvents.AFTER_CANCEL,
	dataSourceEvents.AFTER_POST,
	dataSourceEvents.AFTER_EDIT,
	dataSourceEvents.AFTER_INSERT,
	dataSourceEvents.AFTER_OPEN,
	dataSourceEvents.AFTER_SCROLL,
	dataSourceEvents.AFTER_GOTO_PAGE,
	dataSourceEvents.AFTER_DELETE
];

export default class AnterosCheckboxList extends Component {
	constructor(props) {
		super(props);
		this.state = { activeIndex: this.props.activeIndex, itemsChecked: this.props.itemsChecked };
		this.handleSelectItem = this.handleSelectItem.bind(this);
		this.numberOfItens = 0;
		this.idList = lodash.uniqueId("list");
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.rebuildChildrens = this.rebuildChildrens.bind(this);
		this.buildChildrensFromDataSource = this.buildChildrensFromDataSource.bind(
			this
		);
		this.rebuildedChildrens = [];
		this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
		this.getRecordDataFromChildren = this.getRecordDataFromChildren.bind(this);
		this.handleCheckedListItem = this.handleCheckedListItem.bind(this);
		if (
			this.props.dataSource instanceof AnterosRemoteDatasource ||
			this.props.dataSource instanceof AnterosLocalDatasource
		) {
			this.props.dataSource.addEventListener(
				DATASOURCE_EVENTS,
				this.onDatasourceEvent
			);
		}
	}
	componentDidMount() {
		//
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ activeIndex: nextProps.activeIndex, itemsChecked: nextProps.itemsChecked });
	}

	componentWillUnmount() {
		if (
			this.props.dataSource instanceof AnterosRemoteDatasource ||
			this.props.dataSource instanceof AnterosLocalDatasource
		) {
			this.props.dataSource.removeEventListener(
				DATASOURCE_EVENTS,
				this.onDatasourceEvent
			);
		}
	}

	onDatasourceEvent(event, error) {
		if (event == dataSourceEvents.AFTER_SCROLL) {
			if (this.props.onSelectListItem && !this.props.dataSource.isEmpty()) {
				this.setState({ activeIndex: this.props.dataSource.getRecno() });
				this.props.onSelectListItem(
					this.props.dataSource.getRecno(),
					this.props.dataSource.getCurrentRecord()
				);
			}
		} else {
			this.setState({ activeIndex: this.props.dataSource.getRecno() });
			if (this.props.onSelectListItem && !this.props.dataSource.isEmpty()) {
				this.props.onSelectListItem(
					this.props.dataSource.getRecno(),
					this.props.dataSource.getCurrentRecord()
				);
			}
		}
	}

	handleSelectItem(index, data) {
		this.setState({ activeIndex: index });
		if (
			this.props.dataSource &&
			(this.props.dataSource.constructor === AnterosRemoteDatasource ||
				this.props.dataSource.constructor === AnterosLocalDatasource)
		) {
			this.props.dataSource.gotoRecordByData(data);
		} else if (this.props.onSelectListItem) {
			this.props.onSelectListItem(index, data);
		}
	}

	handleKeyDown(event) {
		event.preventDefault();
		if (this.state.activeIndex >= 0 && this.numberOfItens > 0) {
			if (event.keyCode == 38 || event.keyCode == 37) {
				let index = this.state.activeIndex;
				if (index - 1 >= 0) {
					this.setState({ activeIndex: index - 1 });
					this.handleSelectItem(
						index - 1,
						this.getRecordDataFromChildren(index - 1)
					);
				}
			} else if (event.keyCode == 40 || event.keyCode == 39) {
				let index = this.state.activeIndex;
				if (index + 1 < this.numberOfItens) {
					this.setState({ activeIndex: index + 1 });
					this.handleSelectItem(
						index + 1,
						this.getRecordDataFromChildren(index + 1)
					);
				}
			} else if (event.keyCode == 33) {
				this.setState((prevState, props) => {
					return {
						activeIndex:
							prevState.activeIndex - 5 >= 0 ? prevState.activeIndex - 5 : 0
					};
				});
				this.handleSelectItem(
					this.state.activeIndex,
					this.getRecordDataFromChildren(this.state.activeIndex)
				);
			} else if (event.keyCode == 34) {
				this.setState((prevState, props) => {
					return {
						activeIndex:
							prevState.activeIndex + 5 < this.numberOfItens
								? prevState.activeIndex + 5
								: this.numberOfItens - 1
					};
				});
				this.handleSelectItem(
					this.state.activeIndex,
					this.getRecordDataFromChildren(this.state.activeIndex)
				);
			} else if (event.keyCode == 36) {
				this.setState((prevState, props) => {
					return { activeIndex: 0 };
				});
				this.handleSelectItem(0, this.getRecordDataFromChildren(0));
			} else if (event.keyCode == 35) {
				this.setState((prevState, props) => {
					return { activeIndex: this.numberOfItens - 1 };
				});
				this.handleSelectItem(
					this.state.activeIndex,
					this.getRecordDataFromChildren(this.state.activeIndex)
				);
			}
		}
	}

	componentDidUpdate(prevProps, prevState) {
		//
	}

	scrollToItem(element) {
		var scrollTo = element.offsetTop;
		if (
			element.offsetTop + element.clientHeight >
			this.list.scrollTop + this.list.clientHeight
		) {
			this.list.scrollTop =
				this.list.scrollTop +
				(element.offsetTop + element.clientHeight) -
				(this.list.scrollTop + this.list.clientHeight);
		} else if (element.offsetTop < this.list.scrollTop) {
			this.list.scrollTop =
				this.list.scrollTop + (element.offsetTop - this.list.scrollTop);
		}
	}

	handleCheckedListItem(index, recordData, checked) {
		let _this = this;
		let itemsChecked = this.state.itemsChecked;
		if (checked) {
			itemsChecked.push(recordData);
		} else {
			itemsChecked = [];
			_this.state.itemsChecked.forEach((it, idx) => {
				if (_this.props.dataSource) {
                    if (it !== recordData){
                        itemsChecked.push(it);
                    }
				} else {
					if (it.id !== recordData.id && it.text !== recordData.text) {
						itemsChecked.push(it);
					}
				}
			});
		}
		this.setState({ ...this.state, itemsChecked });
		if (this.props.onCheckedItems) {
			this.props.onCheckedItems(itemsChecked);
		}
	}

	buildChildrensFromDataSource() {
		let sourceData = this.props.dataSource;
		if (
			this.props.dataSource.constructor === AnterosRemoteDatasource ||
			this.props.dataSource.constructor === AnterosLocalDatasource
		) {
			sourceData = this.props.dataSource.getData();
		}
		if (sourceData.constructor !== Array) {
			throw new AnterosError(
				"O dataSource deve ser obrigatoriamente um array de dados."
			);
		}
		let children = [];
		let index = 0;
		let _this = this;
		sourceData.map(record => {
			let active = record.active == undefined ? false : record.active;
			if (_this.state.activeIndex >= 0) {
				active = false;
				if (_this.state.activeIndex == index) {
					active = true;
				}
			} else if (record.active) {
				_this.state.activeIndex = index;
			}

			let checked = this.state.itemsChecked.indexOf(record) >= 0;

			var { component, key, id, ...rest } = this.props;
			if (component) {
				let DynamicComponent = component;
				let compProps = {};
				if (component.hasOwnProperty("component")) {
					DynamicComponent = component.component;
				}
				if (component.hasOwnProperty("props")) {
					compProps = component.props;
				}

				let id = record[_this.props.dataFieldId];
				if (!id) {
					id = Math.random();
				}

				children.push(
					createElement(DynamicComponent, {
						key: id,
						id: id,
						active: active,
						checked: checked,
						index: index,
						handleSelectItem: _this.handleSelectItem,
						handleCheckedListItem: _this.handleCheckedListItem,
						recordData: record,
						...compProps,
						...rest
					})
				);
			} else {
				let id = record[_this.props.dataFieldId];
				if (!id) {
					id = Math.random();
				}
				children.push(
					createElement(AnterosCheckboxListItem, {
						key: id,
						disabled: record.disabled,
						id: id,
						index: index,
						active: active,
						checked: checked,
						success: record.success,
						warning: record.warning,
						danger: record.danger,
						info: record.info,
						alignRight:
							record.alignRight == undefined
								? _this.props.alignRight
								: record.alignRight,
						alignLeft:
							record.alignLeft == undefined
								? _this.props.alignLeft
								: record.alignLeft,
						alignCenter:
							record.alignCenter == undefined
								? _this.props.alignCenter
								: record.alignCenter,
						justify:
							record.justify == undefined
								? _this.props.justify
								: record.justify,
						activeBackColor:
							record.activeBackColor == undefined
								? _this.props.activeBackColor
								: record.activeBackColor,
						activeColor:
							record.activeColor == undefined
								? _this.props.activeColor
								: record.activeColor,
						backgroundColor:
							record.backgroundColor == undefined
								? _this.props.backgroundColor
								: record.backgroundColor,
						color: record.color == undefined ? _this.props.color : record.color,
						imageCircle: record.imageCircle,
						imageHeight: record.imageHeight,
						imageWidth: record.imageWidth,
						icon: record.icon,
						image: record.image,
						onMouseOver: _this.props.onMouseOver,
						onMouseOut: _this.props.onMouseOut,
						caption: record[this.props.dataFieldText],
						recordData: record,
						handleSelectItem: _this.handleSelectItem,
						handleCheckedListItem: _this.handleCheckedListItem,
						onSelectListItem:
							record.onSelectListItem == undefined
								? _this.props.onSelectListItem
								: record.onSelectListItem,
						onCheckedListItem:
							record.onCheckedListItem == undefined
								? _this.props.onCheckedListItem
								: record.onCheckedListItem,
						href: record.href,
						showBorder:
							record.showBorder == undefined
								? _this.props.showBorder
								: record.showBorder,
						ownerId: _this.props.id ? _this.props.id : _this.idList
					})
				);
			}
			index++;
		});
		this.numberOfItens = index;
		return children;
	}

	getRecordDataFromChildren(index) {
		let result;
		this.rebuildedChildrens.map(item => {
			if (item.props.index === index) {
				result = item.props.recordData;
			}
		});
		return result;
	}

	rebuildChildrens() {
		let children = [];
		let index = 0;
		let _this = this;
		let arrChildren = Children.toArray(this.props.children);
		arrChildren.forEach((child) => {
			if (
				child.type &&
				(child.type.componentName !== "AnterosCheckboxListItem")
			) {
				throw new AnterosError(
					"Apenas componentes do tipo AnterosCheckboxListItem podem ser usados como filhos de AnterosCheckboxList."
				);
			}
			if (!child.props.id) {
				throw new AnterosError("Todos os itens da lista devem conter um ID.");
			}
			let active = child.props.active;
			if (_this.state.activeIndex >= 0) {
				active = false;
				if (_this.state.activeIndex == index) {
					active = true;
				}
			} else if (child.props.active) {
				_this.state.activeIndex = index;
			}

			let checked = false;
			if (_this.state.itemsChecked) {
				_this.state.itemsChecked.forEach(it => {
					if (it.id === child.props.id && it.text === child.props.caption) {
						checked = true;
					}
				});
			}
			children.push(
				createElement(
					AnterosCheckboxListItem,
					{
						key: child.props.id,
						disabled: child.props.disabled,
						id: child.props.id,
						index: index,
						active: active,
						checked: checked,
						success: child.props.success,
						warning: child.props.warning,
						danger: child.props.danger,
						info: child.props.info,
						alignRight:
							child.props.alignRight == undefined
								? _this.props.alignRight
								: child.props.alignRight,
						alignLeft:
							child.props.alignLeft == undefined
								? _this.props.alignLeft
								: child.props.alignLeft,
						alignCenter:
							child.props.alignCenter == undefined
								? _this.props.alignCenter
								: child.props.alignCenter,
						justify:
							child.props.justify == undefined
								? _this.props.justify
								: child.props.justify,
						activeBackColor:
							child.props.activeBackColor == undefined
								? _this.props.activeBackColor
								: child.props.activeBackColor,
						activeColor:
							child.props.activeColor == undefined
								? _this.props.activeColor
								: child.props.activeColor,
						backgroundColor:
							child.props.backgroundColor == undefined
								? _this.props.backgroundColor
								: child.props.backgroundColor,
						color:
							child.props.color == undefined
								? _this.props.color
								: child.props.color,
						imageCircle: child.props.imageCircle,
						imageHeight: child.props.imageHeight,
						imageWidth: child.props.imageWidth,
						icon: child.props.icon,
						image: child.props.image,
						caption: child.props.caption,
						recordData: { id: child.props.id, text: child.props.caption },
						onMouseOver: _this.props.onMouseOver,
						onMouseOut: _this.props.onMouseOut,
						handleSelectItem: _this.handleSelectItem,
						handleCheckedListItem: _this.handleCheckedListItem,
						onSelectListItem:
							child.props.onSelectListItem == undefined
								? _this.props.onSelectListItem
								: child.props.onSelectListItem,
						onCheckedListItem:
							child.props.onCheckedListItem == undefined
								? _this.props.onCheckedListItem
								: child.props.onCheckedListItem,
						href: child.props.href,
						showBorder:
							child.showBorder == undefined
								? _this.props.showBorder
								: child.showBorder,
						ownerId: _this.props.id ? _this.props.id : _this.idList
					},
					child.props ? child.props.children : undefined
				)
			);
			index++;
		});
		this.numberOfItens = index;
		return children;
	}

	index(collection,item) {
		return [].slice.call(document.querySelectorAll(collection)).indexOf(document.querySelector(item));
	}

	gotoItemById(id, scrolltop) {
		var element = document.getElementById(id);
		if (element) {
			if (scrolltop) {
				this.list.scrollTop = element.offsetTop;
			}
			this.setState({ activeIndex: this.index(this.list,element) });
		}
	}

	render() {
		this.rebuildedChildrens = [];
		if (this.props.id) {
			this.idList = this.props.id;
		}

		if (this.props.dataSource) {
			this.rebuildedChildrens = this.buildChildrensFromDataSource();
		} else if (this.props.children) {
			this.rebuildedChildrens = this.rebuildChildrens();
		}

		return (
			<div
				id={this.idList}
				ref={ref => (this.list = ref)}
				tabIndex={-1}
				className={this.props.showBorder ? "list-group-container" : ""}
				onKeyDown={this.handleKeyDown}
				style={{ width: this.props.width, height: this.props.height }}
			>
				<ul
					className="list-group"
					style={{ flexDirection: this.props.horizontal ? "row" : "column" }}
				>
					{this.rebuildedChildrens}
				</ul>
			</div>
		);
	}
}

export class AnterosCheckboxListItem extends Component {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onCheckboxChange = this.onCheckboxChange.bind(this);
		this.idItem = null;
		this.keyItem = null;
		this.state = { checked: this.props.checked };
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ ...this.state, checked: nextProps.checked });
	}

	onClick(event) {
		if (!this.props.disabled) {
			if (this.props.handleSelectItem) {
				this.props.handleSelectItem(this.props.index, this.props.recordData);
			}
			if (this.props.onSelectListItem) {
				this.props.onSelectListItem(this.props.index, this.props.recordData);
			}
			this.onCheckboxChange(undefined, !this.state.checked, this.props.recordData);
		}
	}

	static get componentName() {
		return "AnterosCheckboxListItem";
	}

	onMouseOver(event) {
		if (this.props.onMouseOver) {
			this.props.onMouseOver(this, event);
		}
	}

	onMouseOut(event) {
		if (this.props.onMouseOut) {
			this.props.onMouseOut(this, event);
		}
	}

	onCheckboxChange(value, checked, item) {
		this.setState({ ...this.state, checked: checked });
		this.props.handleCheckedListItem(
			this.props.index,
			this.props.recordData,
			checked
		);
		if (this.props.onCheckedListItem) {
			this.props.onCheckedListItem(
				this.props.index,
				this.props.recordData,
				checked
			);
		}
	}

	render() {
		if (this.props.hide) return null;

		let className = AnterosUtils.buildClassNames(
			this.props.showBorder ? "list-group-item-border" : "list-group-item",
			"list-group-item-action",
			this.props.className ? this.props.className : "",
			this.props.active ? "active" : "",
			this.props.disabled ? "disabled" : "",
			this.props.success ? "list-group-item-success" : "",
			this.props.info ? "list-group-item-info" : "",
			this.props.warning ? "list-group-item-warning" : "",
			this.props.danger ? "list-group-item-danger" : "",
			this.props.alignRight ? "justify-content-end" : "",
			this.props.alignLeft ? "justify-content-start" : "",
			this.props.alignCenter ? "justify-content-center" : "",
			this.props.justify ? "justify-content-between" : ""
		);

		let icon;
		if (this.props.icon) {
			icon = (
				<i
					style={{ marginLeft: "3px", marginRight: "3px" }}
					className={this.props.icon}
				/>
			);
		}

		let style = {
			display: "flex",
			paddingLeft: "8px",
			paddingRight: "8px",
			paddingBottom: "4px",
			paddingTop: "4px"
		};
		if (
			this.props.activeBackColor &&
			this.props.activeColor &&
			this.props.active
		) {
			style = {...style,
				backgroundColor: this.props.activeBackColor,
				color: this.props.activeColor
			};
		}

		if (this.props.backgroundColor && this.props.color && !this.props.active) {
			style = {...style,
				backgroundColor: this.props.backgroundColor,
				color: this.props.color
			};
		}

		let classNameImage;
		if (this.props.imageCircle) {
			classNameImage = " img-circle";
		}

		this.idItem = "chklstItem_" + this.props.ownerId + "_" + this.props.id;
		this.keyItem = "chklstItem_" + this.props.ownerId + "_" + this.props.id;

		if (this.props.children) {
			return (
				<li
					href={this.props.href}
					className={className}
					onMouseOver={this.onMouseOver}
					onMouseOut={this.onMouseOut}
					id={this.idItem}
					onClick={this.onClick}
					key={this.keyItem}
				>
					<AnterosCheckbox
					    ref={ref => (this.checkbox = ref)}
						valueChecked={true}
						checked={this.state.checked}
						valueUnchecked={false}
						onCheckboxChange={this.onCheckboxChange}
						value=""
					/>
					{this.props.caption}
					{this.props.children}
				</li>
			);
		}

		return (
			<li
				tabIndex={-1}
				style={style}
				href={this.props.href}
				className={className}
				onClick={this.onClick}
				onMouseOver={this.onMouseOver}
				onMouseOut={this.onMouseOut}
				id={this.idItem}
				key={this.keyItem}
			>
				<AnterosCheckbox
					valueChecked={true}
					ref={ref => (this.checkbox = ref)}
					checked={this.state.checked}
					onCheckboxChange={this.onCheckboxChange}
					valueUnchecked={false}
					value=""
				/>
				{icon}{" "}
				<img
					style={{ marginLeft: "3px", marginRight: "3px" }}
					className={classNameImage}
					src={this.props.image}
					height={this.props.imageHeight}
					width={this.props.imageWidth}
				/>{" "}
				{this.props.caption}
			</li>
		);
	}
}

AnterosCheckboxList.propTypes = {
	activeBackColor: PropTypes.string,
	activeColor: PropTypes.string,
	alignCenter: PropTypes.bool,
	alignLeft: PropTypes.bool,
	alignRight: PropTypes.bool,
	backgroundColor: PropTypes.string,
	color: PropTypes.string,
	height: PropTypes.string,
	justify: PropTypes.bool,
	onSelectListItem: PropTypes.func,
	onCheckedListItem: PropTypes.func,
	onCheckedItems: PropTypes.func,
	width: PropTypes.string,
	showBorder: PropTypes.bool,
	dataFieldText: PropTypes.string,
	dataFieldId: PropTypes.string,
	activeIndex: PropTypes.number,
	onMouseOver: PropTypes.func,
	onMouseOut: PropTypes.func,
	itemsChecked: PropTypes.array
};

AnterosCheckboxList.defaultProps = {
	showBorder: false,
	dataFieldText: "text",
	dataFieldId: "id",
	activeIndex: 0,
	itemsChecked: []
};

AnterosCheckboxListItem.propTypes = {
	active: PropTypes.bool,
	activeBackColor: PropTypes.string,
	activeColor: PropTypes.string,
	alignCenter: PropTypes.bool,
	alignLeft: PropTypes.bool,
	alignRight: PropTypes.bool,
	backgroundColor: PropTypes.string,
	caption: PropTypes.string,
	color: PropTypes.string,
	danger: PropTypes.bool,
	disabled: PropTypes.bool,
	hide: PropTypes.bool,
	href: PropTypes.string,
	icon: PropTypes.string,
	id: PropTypes.number.isRequired,
	image: PropTypes.string,
	imageCircle: PropTypes.bool,
	imageHeight: PropTypes.string,
	imageWidth: PropTypes.string,
	info: PropTypes.bool,
	justify: PropTypes.bool,
	onSelectListItem: PropTypes.func,
	onCheckedListItem: PropTypes.func,
	success: PropTypes.bool,
	warning: PropTypes.bool,
	showBorder: PropTypes.bool,
	key: PropTypes.string
};

AnterosCheckboxListItem.defaultProps = {
	active: false,
	caption: undefined,
	disabled: false,
	href: undefined,
	icon: undefined,
	image: undefined,
	showBorder: true
};
