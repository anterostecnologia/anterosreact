import React, { Component } from 'react';
import PropTypes from "prop-types";
import uniqueId from "uuid/v4";
import lodash from "lodash";

import { AnterosCheckbox, AnterosCombobox, AnterosComboboxOption, AnterosDatePicker, AnterosDatetimePicker, AnterosDateRangePicker, AnterosEdit, AnterosTimePicker } from "@anterostecnologia/anteros-react-editors";
import { AnterosButton, AnterosRadioButton, AnterosRadioButtonItem } from "@anterostecnologia/anteros-react-buttons";
import { AnterosError, AnterosObjectUtils, AnterosUtils, If, Then } from "@anterostecnologia/anteros-react-core";
import { autoBind, AnterosStringUtils } from "@anterostecnologia/anteros-react-core";
import { AnterosCol, AnterosRow } from "@anterostecnologia/anteros-react-layout";
import { AnterosLabel } from "@anterostecnologia/anteros-react-label";
import { AnterosList } from "@anterostecnologia/anteros-react-list";

class AnterosAdvancedFilter extends Component {

    constructor(props) {
        super(props);
        let _root = {};
        let _sort = [];
        if (props.activeFilter) {
            let filterValue = JSON.parse(atob(props.activeFilter.filter));
            _root = filterValue.filter;
            _sort = filterValue.sort;
        } else {
            this.createNewFilter();
        }
        this.state = {
            root: _root,
            modalOpen: "",
            filter: "",
            filterName: this.props.activeFilter
                ? this.props.activeFilter.filterName
                : "",
            recordFilter: this.props.activeFilter,
            sort: _sort,
            activeSortIndex: this.props.activeSortIndex,
            schema: {}
        };

        autoBind(this);

    }

    static get defaultOperators() {
        return [
            {
                name: "null",
                label: "Em branco",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "notNull",
                label: "Preenchido",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "contains",
                label: "Contém",
                dataTypes: ["string"]
            },
            {
                name: "startsWith",
                label: "Iniciado com",
                dataTypes: ["string"]
            },
            {
                name: "endsWith",
                label: "Terminado com",
                dataTypes: ["string"]
            },
            {
                name: "=",
                label: "Igual",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "!=",
                label: "Diferente",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "<",
                label: "Menor",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: ">",
                label: "Maior",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "<=",
                label: "Menor igual",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: ">=",
                label: "Maior igual",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "between",
                label: "Entre",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "inList",
                label: "Na lista",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            },
            {
                name: "notInList",
                label: "Fora da lista",
                dataTypes: ["string", "number", "date", "date_time", "time"]
            }
        ];
    }

    static get defaultConditions() {
        return [
            {
                name: "and",
                label: "E"
            },
            {
                name: "or",
                label: "Ou"
            }
        ];
    }

    getQuickFields() {
        let result = [];
        this.getFields(this.props).forEach(function (field) {
            if (field.quickFilter === true) {
                result.push({ name: field.name, label: field.label });
            }
        }, this);
        return result;
    }

    getQuickFilterSort() {
        let result = "";
        let appendDelimiter = false;
        this.getFields(this.props).forEach(function (field) {
            if (field.quickFilterSort === true) {
                if (appendDelimiter)
                    result += ",";
                result += field.name;
                appendDelimiter = true;
            }
        }, this);
        return result;
    }


    componentWillMount() {
        const { operators, conditions } = this.props;
        this.setState({
            root: this.getInitialQuery(),
            modalOpen: "",
            filter: "",
            filterName: this.props.activeFilter
                ? this.props.activeFilter.filterName
                : "",
            recordFilter: this.props.activeFilter,
            sort: this.mergeSortWithFields(this.props.sort),
            activeSortIndex: this.props.activeSortIndex,
            schema: {
                fields: this.getFields(this.props),
                operators,
                conditions,
                createRule: this.createRule.bind(this),
                createRuleGroup: this.createRuleGroup.bind(this),
                onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
                onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
                onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
                onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
                onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
                getLevel: this.getLevel.bind(this),
                isRuleGroup: this.isRuleGroup.bind(this),
                getOperators: (...args) => this.getOperators(...args)
            }
        });
    }

    componentWillUnmount() {

    }

    mergeSortWithFields(sort) {
        let result = [];
        let flds = this.getFields(this.props);
        if (flds) {
            flds.forEach(function (field, index) {
                let selected = false;
                let asc_desc = "asc";
                let order = index;
                if (sort) {
                    sort.forEach(function (item) {
                        if (item.name === field.name) {
                            selected = item.selected;
                            asc_desc = item.asc_desc;
                            order = item.order;
                        }
                    });
                }
                result.push({
                    name: field.name,
                    selected: selected,
                    order: order,
                    asc_desc: asc_desc,
                    label: field.label
                });
            });
            result = result.sort(function (a, b) {
                return a.order - b.order;
            });
        }
        return result;
    }

    getInitialQuery() {
        if (!AnterosObjectUtils.isEmpty(this.props.query)) return this.props.query;
        return this.createRuleGroup();
    }

    componentWillReceiveProps(nextProps) {
        let query = nextProps.query;
        if (!query) {
            query = this.getInitialQuery();
        }
        this.setState({
            ...this.state,
            recordFilter: nextProps.activeFilter,
            root: query,
            sort: this.mergeSortWithFields(nextProps.sort),
            activeSortIndex: nextProps.activeSortIndex ? nextProps.activeSortIndex : 0
        });
    }

    componentDidMount() {

    }


    createNewFilter() {
        let _root = this.createRuleGroup();
        let _sort = this.mergeSortWithFields(this.props.sort);
        const { operators, conditions } = this.props;
        this.setState({
            root: _root,
            modalOpen: "",
            filter: "",
            filterName: "",
            recordFilter: undefined,
            sort: _sort,
            activeSortIndex: this.props.activeSortIndex,
            schema: {
                fields: this.getFields(this.props),
                operators,
                conditions,
                createRule: this.createRule.bind(this),
                createRuleGroup: this.createRuleGroup.bind(this),
                onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
                onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
                onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
                onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
                onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
                getLevel: this.getLevel.bind(this),
                isRuleGroup: this.isRuleGroup.bind(this),
                getOperators: (...args) => this.getOperators(...args)
            }
        });
        if (this.props.onSelectActiveFilter) {
            this.props.onSelectActiveFilter(
                undefined,
                _root,
                _sort,
                this.props.activeSortIndex
            );
        }
    }

    getSelectedSort() {
        let result = [];
        this.state.sort.forEach(function (item) {
            if (item.selected) {
                result.push({ name: item.name, asc_desc: item.asc_desc });
            }
        });
        return result;
    }

    getSortItem(field) {
        let result;
        this.state.sort.forEach(function (item) {
            if (item.name === field) {
                result = item;
            }
        });
        return result;
    }

    getSortItemByOrder(order) {
        let result;
        this.state.sort.forEach(function (item) {
            if (item.order === order) {
                result = item;
            }
        });
        return result;
    }

    onChangeSortItem(field, selected, order, asc_desc) {
        let item = this.getSortItem(field);
        Object.assign(item, {
            selected: selected,
            order: order,
            asc_desc: asc_desc,
            label: item.label
        });
        let sort = this.state.sort;
        sort = sort.sort(function (a, b) {
            return a.order - b.order;
        });
        this.setState({
            ...this.state,
            sort: sort
        });

        const { onSortChange } = this.props;
        if (onSortChange) {
            const newSort = lodash.cloneDeep(sort);
            onSortChange(newSort, this.state.activeSortIndex);
        }
    }

    onSortDown(event) {
        if (this.state.activeSortIndex >= 0) {
            let item = this.state.sort[this.state.activeSortIndex];
            let activeIndex = this.state.activeSortIndex;
            if (item.order < this.state.sort.length - 1) {
                activeIndex = item.order + 1;
                let nextItem = this.getSortItemByOrder(item.order + 1);
                Object.assign(item, {
                    order: item.order + 1
                });
                Object.assign(nextItem, {
                    order: nextItem.order - 1
                });
            }
            let sort = this.state.sort;
            sort = sort.sort(function (a, b) {
                return a.order - b.order;
            });
            this.setState({
                ...this.state,
                sort: sort,
                activeSortIndex: activeIndex
            });

            const { onSortChange } = this.props;
            if (onSortChange) {
                const newSort = lodash.cloneDeep(sort);
                onSortChange(newSort, activeIndex);
            }
        }
    }

    onSortUp(event) {
        if (this.state.activeSortIndex >= 0) {
            let item = this.state.sort[this.state.activeSortIndex];
            let activeIndex = this.state.activeSortIndex;
            if (item.order > 0) {
                activeIndex = item.order - 1;
                let previousItem = this.getSortItemByOrder(item.order - 1);
                Object.assign(item, {
                    order: item.order - 1
                });
                Object.assign(previousItem, {
                    order: previousItem.order + 1
                });
            }
            let sort = this.state.sort;
            sort = sort.sort(function (a, b) {
                return a.order - b.order;
            });
            this.setState({
                ...this.state,
                sort: sort,
                activeSortIndex: activeIndex
            });
            const { onSortChange } = this.props;
            if (onSortChange) {
                const newSort = lodash.cloneDeep(sort);
                onSortChange(newSort, activeIndex);
            }
        }
    }

    getFields(props) {
        let result = [];
        if (props.children) {
            let arrChildren = React.Children.toArray(props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.componentName === 'FilterFields') {
                    if (child.props.children) {
                        let arrChild = React.Children.toArray(child.props.children);
                        arrChild.forEach(function (chd) {
                            if (chd.type && !(chd.type.componentName === 'FilterField')) {
                                throw new AnterosError(
                                    "Somente filhos do tipo FilterField podem ser usados com FilterFields."
                                );
                            }
                            let values = [];
                            let chld = React.Children.toArray(chd.props.children);
                            chld.forEach(function (val) {
                                if (val.type && !(val.type.componentName === 'FilterFieldValue')) {
                                    throw new AnterosError(
                                        "Somente filhos do tipo FilterFieldValue podem ser usados com FilterFields"
                                    );
                                }
                                values.push({ label: val.props.label, value: val.props.value });
                            });
                            result.push({
                                name: chd.props.name,
                                label: chd.props.label,
                                dataType: chd.props.dataType,
                                quickFilter: chd.props.quickFilter,
                                quickFilterSort: chd.props.quickFilterSort,
                                sortable: chd.props.sortable,
                                listValues: values
                            });
                        });
                    }
                }
            });
        }
        return result;
    }

    isRuleGroup(rule) {
        return !!(rule.condition && rule.rules);
    }

    createRule() {
        const { operators } = this.state.schema;
        const fields = this.getFields(this.props);

        return {
            id: `r-${uniqueId()}`,
            field: fields[0].name,
            fieldSql: fields[0].nameSql,
            dataType: fields[0].dataType,
            value: "",
            value2: "",
            disabled: false,
            operator: operators[0].name
        };
    }

    createRuleGroup() {
        return {
            id: `g-${uniqueId()}`,
            rules: [],
            condition: this.props.conditions[0].name
        };
    }

    getField(name) {
        let result;
        this.getFields(this.props).forEach(function (field) {
            if (field.name === name) {
                result = field;
            }
        }, this);
        return result;
    }

    getOperators(field) {
        let fld = this.getField(field);
        let oprs = [];
        this.props.operators.forEach(function (op) {
            if (op.dataTypes.indexOf(fld.dataType) >= 0) {
                oprs.push(op);
            }
        }, this);

        return oprs;
    }

    onRuleAdd(rule, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(rule);
        this.setState({ root: this.state.root });
    }

    onGroupAdd(group, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(group);
        this.setState({ root: this.state.root });
    }

    onPropChange(prop, value, ruleId) {
        const rule = this._findRule(ruleId, this.state.root);
        if (prop === "not") {
            prop = "condition";
            if (rule.condition.indexOf("and") >= 0) {
                value = AnterosStringUtils.ltrim(value + " and");
            } else {
                value = AnterosStringUtils.ltrim(value + " or");
            }
        } else if (prop === "condition") {
            if (rule.condition.indexOf("not") >= 0) {
                value = "not " + value;
            }
        }
        Object.assign(rule, { [prop]: value });
        this.setState({ root: this.state.root });
    }

    onRuleRemove(ruleId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x => x.id === ruleId);
        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    }

    onGroupRemove(groupId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x => x.id === groupId);

        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    }

    getLevel(id) {
        return this._getLevel(id, 0, this.state.root);
    }

    _getLevel(id, index, root) {
        const { isRuleGroup } = this.state.schema;

        var foundAtIndex = -1;
        if (root.id === id) {
            foundAtIndex = index;
        } else if (isRuleGroup(root)) {
            root.rules.forEach(rule => {
                if (foundAtIndex === -1) {
                    var indexForRule = index;
                    if (isRuleGroup(rule)) indexForRule++;
                    foundAtIndex = this._getLevel(id, indexForRule, rule);
                }
            });
        }
        return foundAtIndex;
    }

    _findRule(id, parent) {
        const { isRuleGroup } = this.state.schema;

        if (parent.id === id) {
            return parent;
        }

        for (const rule of parent.rules) {
            if (rule.id === id) {
                return rule;
            } else if (isRuleGroup(rule)) {
                const subRule = this._findRule(id, rule);
                if (subRule) {
                    return subRule;
                }
            }
        }
    }

    _notifyQueryChange(fn, ...args) {
        if (fn) {
            fn.call(this, ...args);
        }

        const { onQueryChange } = this.props;
        if (onQueryChange) {
            const query = lodash.cloneDeep(this.state.root);
            onQueryChange(query);
        }
    }



    render() {
        let children = [];
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            if (!(child.type && child.type.componentName === 'CustomFilter')) {
                children.push(child);
            }
        });

        const {
            root: { id, rules, condition },
            schema
        } = this.state;

        let displayMode = this.props.horizontal ? 'flex' : 'block';

        return (
            <div style={{
                height: this.props.height,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                <div style={{ width: this.props.width, overflow: 'scroll' }}>
                    <AnterosRow style={{
                        border: this.props.border,
                        margin: 0,
                        display: displayMode
                    }}>
                        <AnterosCol>
                            <RuleGroup
                                rules={rules}
                                condition={condition}
                                schema={schema}
                                id={id}
                                // height={this.props.height}
                                onSearchButtonClick={this.props.onSearchButtonClick}
                                parentId={null}
                            />
                        </AnterosCol>
                    </AnterosRow>
                </div>

                <If condition={this.props.allowSort === true}>
                    <Then>
                        <AnterosRow>
                            <AnterosCol style={{ padding: 13 }}>
                                <div
                                    className="sort-group-container"
                                    style={{
                                        height: 'auto'
                                    }}
                                >
                                    <div className="sort-header">
                                        <div>
                                            <AnterosButton
                                                id="btnFilterSortDown"
                                                circle
                                                small
                                                link
                                                hint="Para baixo"
                                                icon="fa fa-arrow-down"
                                                onClick={this.onSortDown}
                                            />
                                            <AnterosButton
                                                id="btnFilterSortUp"
                                                circle
                                                small
                                                link
                                                hint="Para cima"                                                
                                                icon="fa fa-arrow-up"
                                                onClick={this.onSortUp}
                                            />
                                        </div>
                                        <AnterosLabel caption="Ordenação" />
                                    </div>
                                    <div className="sort-body">
                                        <AnterosList
                                            height="100%"
                                            width="100%"
                                            dataSource={this.state.sort}
                                            dataFieldId="name"
                                            dataFieldText="name"
                                            activeIndex={this.state.activeSortIndex}
                                            sortFocused={this.state.sortFocused}
                                            onChangeSortItem={this.onChangeSortItem}
                                            onSelectListItem={this.onSelectListItem}
                                            component={CustomSortItem}
                                        />
                                    </div>
                                </div>
                            </AnterosCol>
                        </AnterosRow>
                    </Then>
                </If>
            </div>);
    }
}

AnterosAdvancedFilter.propTypes = {
    query: PropTypes.object,
    sort: PropTypes.arrayOf(PropTypes.object),
    activeSortIndex: PropTypes.number,
    activeFilter: PropTypes.object,
    operators: PropTypes.array,
    conditions: PropTypes.array,
    getOperators: PropTypes.func,
    onQueryChange: PropTypes.func,
    onSortChange: PropTypes.func,
    onError: PropTypes.func,
    height: PropTypes.string,
    allowSort: PropTypes.bool.isRequired,
    onApplyFilterClick: PropTypes.func,
    disabled: PropTypes.bool.isRequired,
    id: PropTypes.string,
    horizontal: PropTypes.bool.isRequired,
    width: PropTypes.string.isRequired
};

AnterosAdvancedFilter.defaultProps = {
    query: null,
    operators: AnterosAdvancedFilter.defaultOperators,
    conditions: AnterosAdvancedFilter.defaultConditions,
    getOperators: null,
    onQueryChange: null,
    allowSort: true,
    disabled: false,
    horizontal: true,
    width: '100%',
    border: '1px solid silver'
};



export class FilterFields extends React.Component {
    static get componentName() {
        return 'FilterFields';
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}

export class FilterField extends React.Component {
    static get componentName() {
        return 'FilterField';
    }
    render() {
        return null;
    }
}

FilterField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    dataType: PropTypes.oneOf(["string", "number", "date", "date_time", "time"])
        .isRequired,
    sortable: PropTypes.bool.isRequired,
    quickFilter: PropTypes.bool.isRequired,
    quickFilterSort: PropTypes.bool.isRequired
};

FilterField.defaultProps = {
    sortable: true,
    quickFilter: true,
    quickFilterSort: false
};

export class FilterFieldValue extends React.Component {
    static get componentName() {
        return 'FilterFieldValue';
    }
    render() {
        return null;
    }
}

FilterFieldValue.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
};

class CustomSortItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onCheckboxChange = this.onCheckboxChange.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
    }

    static get componentName() {
        return 'CustomSortItem';
    }

    onClick(event) {
        event.preventDefault();
        if (!this.props.disabled) {
            if (this.props.handleSelectItem) {
                this.props.handleSelectItem(this.props.index, this);
            }
            if (this.props.onSelectListItem) {
                this.props.onSelectListItem(this.props.index, this);
            }
        }
    }

    getChecked() {
        let field = this.props.recordData[this.props.dataFieldId];
        let checked = false;
        this.props.dataSource.forEach(function (item) {
            if (item.name === field) {
                checked = item.selected;
            }
        });
        return checked;
    }

    onCheckboxChange(value, checked) {
        let field = this.props.recordData[this.props.dataFieldId];
        this.props.onChangeSortItem(
            field,
            checked,
            this.props.recordData.order,
            this.isAsc() ? "asc" : "desc"
        );
    }

    onDoubleClick(event) {
        let field = this.props.recordData[this.props.dataFieldId];
        this.props.onChangeSortItem(
            field,
            this.getChecked(),
            this.props.recordData.order,
            this.isAsc() ? "desc" : "asc"
        );
    }

    isAsc() {
        let field = this.props.recordData[this.props.dataFieldId];
        let asc = true;
        this.props.dataSource.forEach(function (item) {
            if (item.name === field) {
                asc = item.asc_desc === "asc";
            }
        });
        return asc;
    }

    render() {
        let key = this.props.id;
        let className = AnterosUtils.buildClassNames(
            "list-group-item justify-content-between",
            this.props.active ||
                this.props.sortFocused === this.props.recordData[this.props.dataFieldId]
                ? "active"
                : "",
            this.props.disabled ? "disabled" : ""
        );
        return (
            <li
                style={{
                    height: "30px",
                    padding: "0px 15px",
                    display: 'flex',
                    backgroundColor: this.props.active ? "" : "inherit"
                }}
                className={className}
                onClick={this.onClick}
                key={key}
            >
                <AnterosCheckbox
                    value={this.props.recordData.label}
                    info
                    checked={this.getChecked()}
                    onCheckboxChange={this.onCheckboxChange}
                />
                <div>
                    <i
                        className={
                            this.isAsc() ? "fa fa-sort-alpha-down" : "fa fa-arrow-right"
                        }
                        onDoubleClick={this.onDoubleClick}
                    >
                        {" "}
                    </i>
                    <i
                        className={
                            this.isAsc() ? "fa fa-arrow-left" : "fa fa-sort-alpha-up"
                        }
                        onDoubleClick={this.onDoubleClick}
                    />
                </div>
            </li>
        );
    }
}

class RuleGroup extends React.Component {
    constructor(props) {
        super(props);
        this.hasParentGroup = this.hasParentGroup.bind(this);
        this.onConditionChange = this.onConditionChange.bind(this);
        this.onNotConditionChange = this.onNotConditionChange.bind(this);
        this.addRule = this.addRule.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.removeGroup = this.removeGroup.bind(this);
    }

    static get componentName() {
        return 'RuleGroup';
    }

    render() {
        const {
            height,
            condition,
            rules,
            onSearchButtonClick,
            schema: { onRuleRemove, isRuleGroup, getLevel }
        } = this.props;
        const level = getLevel(this.props.id);
        return (
            <dl
                className={"rules-group-container"}
                style={{
                    height: height,
                    overflowX: height !== undefined ? "auto" : ""
                }}
            >
                <dt className="rules-group-header">
                    <div
                        style={{
                            display: "inline-flex"
                        }}
                    >
                        <AnterosCheckbox
                            value="Não"
                            checked={condition.indexOf("not") >= 0}
                            onCheckboxChange={this.onNotConditionChange}
                        />
                        <AnterosRadioButton
                            small
                            primary
                            onRadioChange={this.onConditionChange}
                        >
                            <AnterosRadioButtonItem
                                caption="E"
                                style={{ height: "24px", padding: "2px 4px 4px 2px" }}
                                checked={condition === "and"}
                            />
                            <AnterosRadioButtonItem
                                caption="Ou"
                                style={{ height: "24px", padding: "2px 4px 4px 2px" }}
                                checked={condition === "or"}
                            />
                        </AnterosRadioButton>
                    </div>
                    <div className="btn-group pull-right group-actions">
                        <ActionElement
                            label="Condição"
                            className="ruleGroup-addRule btn btn-xs btn-success"
                            handleOnClick={this.addRule}
                            rules={rules}
                            level={level}
                        />
                        <ActionElement
                            label="Grupo"
                            className="ruleGroup-addGroup btn btn-xs btn-success"
                            handleOnClick={this.addGroup}
                            rules={rules}
                            level={level}
                        />{" "}
                        {this.hasParentGroup() ? (
                            <ActionElement
                                label="Remover"
                                className="ruleGroup-remove btn btn-xs btn-danger"
                                handleOnClick={this.removeGroup}
                                rules={rules}
                                level={level}
                            />
                        ) : null}
                    </div>
                </dt>
                <dd className="rules-group-body">
                    <ul className="rules-list">
                        {rules.map(r => {
                            return isRuleGroup(r) ? (
                                <RuleGroup
                                    key={r.id}
                                    id={r.id}
                                    schema={this.props.schema}
                                    parentId={this.props.id}
                                    condition={r.condition}
                                    onSearchButtonClick={onSearchButtonClick}
                                    rules={r.rules}
                                />
                            ) : (
                                    <Rule
                                        key={r.id}
                                        id={r.id}
                                        field={r.field}
                                        value={r.value}
                                        value2={r.value2}
                                        operator={r.operator}
                                        disabled={r.disabled}
                                        schema={this.props.schema}
                                        onSearchButtonClick={onSearchButtonClick}
                                        parentId={this.props.id}
                                        onRuleRemove={onRuleRemove}
                                    />
                                );
                        })}
                    </ul>
                </dd>
            </dl>
        );
    }

    hasParentGroup() {
        return this.props.parentId;
    }

    onConditionChange(index) {
        const { onPropChange } = this.props.schema;
        onPropChange("condition", index === 0 ? "and" : "or", this.props.id);
    }

    onNotConditionChange(value, checked) {
        const { onPropChange } = this.props.schema;
        onPropChange("not", checked === true ? "not" : "", this.props.id);
    }

    addRule(event) {
        event.preventDefault();
        event.stopPropagation();
        const { createRule, onRuleAdd } = this.props.schema;
        const newRule = createRule();
        onRuleAdd(newRule, this.props.id);
    }

    addGroup(event) {
        event.preventDefault();
        event.stopPropagation();
        const { createRuleGroup, onGroupAdd } = this.props.schema;
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, this.props.id);
    }

    removeGroup(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.schema.onGroupRemove(this.props.id, this.props.parentId);
    }
}



RuleGroup.defaultProps = {
    id: null,
    parentId: null,
    rules: [],
    condition: "and",
    schema: {}
};

class Rule extends React.Component {
    constructor(props) {
        super(props);
        this.onFieldChanged = this.onFieldChanged.bind(this);
        this.onOperatorChanged = this.onOperatorChanged.bind(this);
        this.onValueChanged = this.onValueChanged.bind(this);
        this.onValue2Changed = this.onValue2Changed.bind(this);
        this.onElementChanged = this.onElementChanged.bind(this);
        this.onDisabledChanged = this.onDisabledChanged.bind(this);
        this.removeRule = this.removeRule.bind(this);
        this.getDataType = this.getDataType.bind(this);
        this.getFieldSql = this.getFieldSql.bind(this);
        this.getFieldValues = this.getFieldValues.bind(this);
    }

    static get componentName() {
        return 'Rule';
    }

    getDataType(field, fields) {
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].name === field) {
                return fields[i].dataType;
            }
        }
    }

    getFieldSql(field, fields) {
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].name === field) {
                return fields[i].nameSql;
            }
        }
    }

    getFieldValues(field, fields) {
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].name === field) {
                return fields[i].listValues;
            }
        }
    }

    render() {
        const {
            field,
            disabled,
            operator,
            value,
            value2,
            onSearchButtonClick,
            schema: { fields, getOperators, getLevel }
        } = this.props;
        var level = getLevel(this.props.id);
        let dt = this.getDataType(field, fields);
        let listValues = this.getFieldValues(field, fields);
        return (
            <li className={"rule-container"}>
                <AnterosCheckbox
                    value=""
                    width="24px"
                    height="32px"
                    checked={!disabled}
                    onCheckboxChange={this.onDisabledChanged}
                />
                <ValueSelector
                    options={fields}
                    value={field}
                    className="custom-select-field"
                    disabled={disabled}
                    handleOnChange={this.onFieldChanged}
                    level={level}
                />
                <ValueSelector
                    field={field}
                    options={getOperators(field)}
                    value={operator}
                    className="custom-select-operator"
                    disabled={disabled}
                    handleOnChange={this.onOperatorChanged}
                    level={level}
                />
                <ValueEditor
                    field={field}
                    dataType={dt}
                    operator={operator}
                    value={value}
                    value2={value2}
                    listValues={listValues}
                    disabled={disabled}
                    className="rule-value"
                    handleOnChange={this.onValueChanged}
                    onSearchButtonClick={onSearchButtonClick}
                    level={level}
                />{" "}
                {operator === "between" &&
                    (dt !== "date" && dt !== "date_time" && dt !== "time") ? (
                        <ValueEditor
                            field={field}
                            dataType={dt}
                            operator={operator}
                            value={value2}
                            listValues={listValues}
                            disabled={disabled}
                            className="rule-value"
                            handleOnChange={this.onValue2Changed}
                            onSearchButtonClick={onSearchButtonClick}
                            level={level}
                        />
                    ) : (
                        ""
                    )}
                <ActionElement
                    label=""
                    className="rule-remove fa fa-times"
                    handleOnClick={this.removeRule}
                    level={level}
                />
            </li>
        );
    }

    onDisabledChanged(value, checked) {
        this.onElementChanged("disabled", !checked);
    }

    onFieldChanged(value) {
        this.onElementChanged("field", value);
        this.onElementChanged(
            "fieldSql",
            this.getFieldSql(value, this.props.schema.fields)
        );
        this.onElementChanged(
            "dataType",
            this.getDataType(value, this.props.schema.fields)
        );
        this.onElementChanged("value", "");
        this.onElementChanged("value2", "");
    }

    onOperatorChanged(value) {
        this.onElementChanged("operator", value);
        this.onElementChanged("value", "");
        this.onElementChanged("value2", "");
    }

    onValueChanged(value) {
        const {
            field,
            operator,
            schema: { fields }
        } = this.props;
        let dt = this.getDataType(field, fields);
        if (
            operator === "between" &&
            (dt === "date" || dt === "date_time" || dt === "time")
        ) {
            let values = value.split(" - ");
            if (values.length > 0) {
                this.onElementChanged("value", values[0]);
            }

            if (values.length > 1) this.onElementChanged("value2", values[1]);
        } else if (operator === "inList" || operator === "notInList") {
            let values = value.split(",");
            if (values.length > 0) {
                let appendDelimiter = false;
                let result = "";
                values.forEach(function (v) {
                    if (appendDelimiter) {
                        result += ",";
                    }
                    if (dt === "number" || dt === "integer") {
                        result += v;
                    } else {
                        result += "'" + v + "'";
                    }
                    appendDelimiter = true;
                });
                this.onElementChanged("value", result);
            }
        } else {
            this.onElementChanged("value", value);
        }
    }

    onValue2Changed(value) {
        this.onElementChanged("value2", value);
    }

    onElementChanged(property, value) {
        const {
            id,
            schema: { onPropChange }
        } = this.props;
        onPropChange(property, value, id);
    }

    removeRule(event) {
        event.preventDefault();
        event.stopPropagation();

        this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
    }
}

Rule.defaultProps = {
    id: null,
    parentId: null,
    field: null,
    operator: null,
    value: null,
    schema: null
};

class ActionElement extends React.Component {
    static get componentName() {
        return 'ActionElement';
    }


    render() {
        const { label, className, handleOnClick } = this.props;

        return (
            <div className={className} onClick={e => handleOnClick(e)}>
                {label}
            </div>
        );
    }
}

ActionElement.propTypes = {
    label: PropTypes.string,
    className: PropTypes.string,
    handleOnClick: PropTypes.func
};

class ValueEditor extends React.Component {
    constructor(props) {
        super(props);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    static get componentName() {
        return 'ValueEditor';
    }

    onButtonClick(event) {
        if (this.props.onSearchButtonClick) {
            this.props.onSearchButtonClick(
                this.props.field,
                event,
                this.props.handleOnChange
            );
        }
    }

    render() {
        const {
            disabled,
            dataType,
            operator,
            value,
            value2,
            listValues,
            handleOnChange
        } = this.props;
        let newValue = value === null || value === undefined ? "" : value;
        let newValue2 = value2 === null || value === undefined ? "" : value2;

        if (operator === "null" || operator === "notNull") {
            return null;
        }

        if (dataType) {
            if (dataType === "date") {
                if (operator === "between") {
                    if (newValue === "" && newValue2 === "") newValue = "";
                    else newValue = newValue + " - " + newValue2;
                    return (
                        <AnterosDateRangePicker
                            disabled={disabled}
                            style={{
                                minWidth: "150px"
                            }}
                            value={newValue}
                            onChange={(e, value) => handleOnChange(value)}
                        />
                    );
                } else {
                    return (
                        <AnterosDatePicker
                            disabled={disabled}
                            style={{
                                minWidth: "150px"
                            }}
                            value={newValue}
                            onChange={(e, value) => handleOnChange(value)}
                        />
                    );
                }
            } else if (dataType === "date_time") {
                if (operator === "between") {
                    if (newValue === "" && newValue2 === "") newValue = "";
                    else newValue = newValue + " - " + newValue2;
                    return (
                        <AnterosDateRangePicker
                            disabled={disabled}
                            style={{
                                minWidth: "150px"
                            }}
                            value={newValue}
                            onChange={(e, value) => handleOnChange(value)}
                        />
                    );
                } else {
                    return (
                        <AnterosDatetimePicker
                            disabled={disabled}
                            style={{
                                minWidth: "150px"
                            }}
                            value={newValue}
                            onChange={(e, value) => handleOnChange(value)}
                        />
                    );
                }
            } else if (dataType === "time") {
                if (newValue === "" && newValue2 === "") newValue = "";
                else newValue = newValue + " - " + newValue2;
                return (
                    <AnterosTimePicker
                        disabled={disabled}
                        style={{
                            minWidth: "150px"
                        }}
                        value={newValue}
                        onChange={e => handleOnChange(e.target.value)}
                    />
                );
            } else {
                if (
                    listValues.length > 0 &&
                    (operator === "notInList" || operator === "inList")
                ) {
                    return (
                        <AnterosCombobox
                            disabled={disabled}
                            width="150px"
                            onChangeSelect={value => handleOnChange(value)}
                            multiple={true}
                        >
                            {listValues.map(v => {
                                return (
                                    <AnterosComboboxOption
                                        label={v.label}
                                        value={v.value}
                                        key={v.value}
                                    />
                                );
                            })}
                        </AnterosCombobox>
                    );
                } else if (listValues.length > 0) {
                    return (
                        <AnterosCombobox
                            disabled={disabled}
                            width="150px"
                            onChangeSelect={value => handleOnChange(value)}
                        >
                            {listValues.map(v => {
                                return (
                                    <AnterosComboboxOption
                                        label={v.label}
                                        value={v.value}
                                        key={v.value}
                                    />
                                );
                            })}
                        </AnterosCombobox>
                    );
                } else {
                    return (
                        <AnterosEdit
                            disabled={disabled}
                            width="150px"
                            icon="fa fa-search"
                            classNameInput="value-editor-edit"
                            styleButton={{ height: "28px", width: "28px", margin: "0" }}
                            onButtonClick={this.onButtonClick}
                            primary
                            value={newValue}
                            onChange={e => handleOnChange(e.target.value)}
                        />
                    );
                }
            }
        } else {
            return (
                <input
                    type="text"
                    value={newValue}
                    style={{
                        minWidth: "150px"
                    }}
                    onChange={e => handleOnChange(e.target.value)}
                />
            );
        }
    }
}

ValueEditor.propTypes = {
    field: PropTypes.string,
    operator: PropTypes.string,
    value: PropTypes.string,
    handleOnChange: PropTypes.func
};

class ValueSelector extends React.Component {
    static get componentName() {
        return 'ValueSelector';
    }

    constructor(props) {
        super(props);
        this.uuid = uniqueId();
        let wdt = this.getTextWidth(props.options[0].name)
        this.state = { width: wdt, value: undefined };
        this.getTextWidth = this.getTextWidth.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    getLabelByName = (name) => {
        let label;
        this.props.options.map(opt => {
            if (opt.name === name) {
                label = opt.label
            }
        })
        return label
    }

    getTextWidth(txt) {

        let text = document.createElement("span");
        document.body.appendChild(text);

        text.className = this.props.className
        text.innerHTML = this.getLabelByName(txt);

        let width = Math.ceil(text.offsetWidth) + 4;
        let formattedWidth = width + "px";

        document.body.removeChild(text);

        return formattedWidth;
    }

    handleOnChange(event) {
        if (this.props.handleOnChange) {
            this.props.handleOnChange(event.target.value);
        }
        let width = this.getTextWidth(event.target.value)
        this.setState({ ...this.state, value: event.target.value, width });
    }

    render() {
        const {
            value,
            options,
            className,
            disabled,
        } = this.props;

        return (
            <select
                className={className}
                disabled={disabled}
                value={value}
                tabIndex={-1}
                style={{ width: this.state.width }}
                onBlur={this.onBlur}
                onChange={this.handleOnChange}
            >
                {options.map(option => {
                    return (
                        <option key={option.name} value={option.name}>
                            {option.label}
                        </option>
                    );
                })}
            </select>
        );
    }
}

ValueSelector.propTypes = {
    value: PropTypes.string,
    options: PropTypes.array.isRequired,
    className: PropTypes.string,
    handleOnChange: PropTypes.func,
    width: PropTypes.string
};


export { AnterosAdvancedFilter };