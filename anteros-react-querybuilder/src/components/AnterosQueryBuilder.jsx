import React from 'react';
import moment from 'moment'
import PropTypes from "prop-types";

import { AnterosError, autoBind } from "anteros-react-core";
import { AnterosEdit, AnterosCheckbox } from 'anteros-react-editors';
import { AnterosFormGroup } from 'anteros-react-containers';
import { AnterosCalendar } from 'anteros-react-calendar';
import { AnterosButton } from 'anteros-react-buttons';
import { AnterosText } from 'anteros-react-label';
import { AnterosList } from 'anteros-react-list';
import shallowCompare from 'react-addons-shallow-compare';
import { AnterosAdvancedFilter, FilterField, FilterFieldValue, FilterFields } from './AnterosAdvancedFilter';

export class AnterosQueryBuilder extends React.Component {


    constructor(props) {
        super(props);
        let _root = {};
        let _sort = [];
        if (props.activeFilter) {
            let filterValue = JSON.parse(atob(props.activeFilter.filter));
            _root = filterValue.filter;
            _sort = filterValue.sort;
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
            schema: {},
            quickFilterText: this.props.quickFilterText,
            showAdvancedFilter: this.props.showAdvancedFilter,
            selectedFields: this.getQuickFields(),
            expandedFilter: this.props.expandedFilter,
        };
        autoBind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            ...this.state,
            filterName: nextProps.activeFilter
                ? nextProps.activeFilter.filterName
                : this.state.filterName,
            recordFilter: nextProps.activeFilter,
            activeSortIndex: nextProps.activeSortIndex,
            quickFilterText: nextProps.quickFilterText,
            showAdvancedFilter: nextProps.showAdvancedFilter,
            expandedFilter: nextProps.expandedFilter
        });
    }

    toggleExpandedFilter = () => {
        let newExpandedFilter = !this.state.expandedFilter;
        this.setState({ expandedFilter: newExpandedFilter })
        if (this.props.onToggleExpandedFilter) {
            this.props.onToggleExpandedFilter(newExpandedFilter);
        }
    }

    clearFilter = () => {
        if (this.props.onClearFilter) {
            this.props.onClearFilter(this);
        }
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

    getFields(props) {
        let result = [];
        if (props.children) {
            let arrChildren = React.Children.toArray(props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.componentName === 'QueryFields') {
                    if (child.props.children) {
                        let arrChild = React.Children.toArray(child.props.children);
                        arrChild.forEach(function (chd) {
                            if (chd.type && !(chd.type.componentName === 'QueryField')) {
                                throw new AnterosError(
                                    "Somente filhos do tipo QueryField podem ser usados com QueryFields."
                                );
                            }
                            let values = [];
                            let chld = React.Children.toArray(chd.props.children);
                            chld.forEach(function (val) {
                                if (val.type && !(val.type.componentName === 'QueryFieldValue')) {
                                    throw new AnterosError(
                                        "Somente filhos do tipo QueryFieldValue podem ser usados com QueryFields"
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

    getQuickFilterFields() {
        let result = "";
        let appendDelimiter = false;

        if (!this.state.selectedFields || this.state.selectedFields.length == 0) {
            this.getFields(this.props).forEach(function (item) {
                if (item.quickFilter === true) {
                    if (appendDelimiter) {
                        result = result + ",";
                    }
                    result = result + item.name;
                }
                appendDelimiter = true;
            }, this);
        } else {
            this.state.selectedFields.forEach(function (item) {
                if (appendDelimiter) {
                    result = result + ",";
                }
                result = result + item.name;
                appendDelimiter = true;
            }, this);
        }


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

    onSearchClick(event) {
        if (
            this.props.onQuickFilter &&
            this.state.quickFilterText &&
            this.getQuickFilterFields() !== ""
        ) {
            this.props.onQuickFilter(
                this.state.quickFilterText,
                this.getQuickFilterFields(),
                this.getQuickFilterSort()
            );

            if (this.props.onSelectActiveFilter) {
                this.props.onSelectActiveFilter(
                    this.state.filterName,
                    this.state.recordFilter,
                    this.state.sort,
                    this.state.activeSortIndex,
                    this.state.quickFilterText
                );
            }
        }
    }


    onClickOkCalendar = (event, startDate, endDate) => {
        this.setState({ ...this.state, quickFilterText: '' });
        if (this.props.onSelectDateRange) {
            this.props.onSelectDateRange(startDate, endDate);
        }
        let qf = this.state.quickFilterText;
        if (qf && qf !== '') {
            qf = qf + ',';
        } else {
            qf = '';
        }
        qf = qf + startDate.format('DD/MM/YYYY') + ":" + endDate.format('DD/MM/YYYY');
        this.setState({
            ...this.state,
            quickFilterText: qf,
        }, () => this.onSearchClick());
    }

    onChangeQuickFilter(event, value) {
        this.setState({
            ...this.state,
            quickFilterText: value
        });
    }

    handleQuickFilter(event) {
        if (event.keyCode === 13) {
            this.onSearchClick();
        }
    }

    onChangeFields = selectedFields => {
        this.setState({ selectedFields }, () => this.onSearchClick())
    }

    getQuickFilterText() {
        return this.state.quickFilterText;
    }

    render() {
        const heightFilter = this.state.expandedFilter ? "calc(100%)" : '0px'
        return (
            <div style={{
                width: '100%',
                height: heightFilter,
                backgroundColor: 'white',
                border: this.state.expandedFilter ? '1px solid #cfd8dc' : '1px solid transparent',
                position: 'relative',
                display: 'flex',
                flexFlow: 'column nowrap',
                WebkitTransition: this.state.expandedFilter ? 'height .5s' : 'none',
                MozTransition: this.state.expandedFilter ? 'height .5s' : 'none',
                msTransition: this.state.expandedFilter ? 'height .5s' : 'none',
                OTransition: this.state.expandedFilter ? 'height .5s' : 'none',
                transition: this.state.expandedFilter ? 'height .5s' : 'none',
                zIndex: this.props.zIndex,
                overflow: this.state.expandedFilter ? 'hidden auto' : 'unset'
            }}>
                <div style={{
                    padding: 3, width: '100%', height: 51,
                    display: "flex", flexFlow: 'row nowrap', alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: 'white',
                    position: this.state.expandedFilter ? 'absolute' : 'relative'
                }}>
                    <AnterosEdit
                        onChange={this.onChangeQuickFilter}
                        width={"100%"}
                        onKeyDown={this.handleQuickFilter}
                        value={this.state.quickFilterText}
                        placeHolder={this.props.placeHolder}
                        style={{
                            height: "36px",
                            padding: "3px"
                        }}
                    />
                    <AnterosButton
                        primary
                        icon="fal fa-search"
                        hint="Filtrar"
                        hintPosition="down"
                        onClick={this.onSearchClick}
                    />
                    <AnterosButton
                        primary
                        icon="fal fa-filter"
                        visible={this.props.showToggleButton}
                        onClick={this.toggleExpandedFilter}
                    />
                    <AnterosButton
                        primary
                        icon="far fa-times"
                        hint="Limpar filtro"
                        hintPosition="down"
                        visible={this.props.showClearButton}
                        onClick={this.clearFilter}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    pointerEvents: this.state.expandedFilter ? 'all' : 'none',
                    opacity: this.state.expandedFilter ? 1 : 0,
                    flexFlow: 'column nowrap',
                    marginTop: '51px',
                    WebkitTransition: this.state.expandedFilter ? 'opacity .75s' : 'none',
                    MozTransition: this.state.expandedFilter ? 'opacity .75s' : 'none',
                    msTransition: this.state.expandedFilter ? 'opacity .75s' : 'none',
                    OTransition: this.state.expandedFilter ? 'opacity .75s' : 'none',
                    transition: this.state.expandedFilter ? 'opacity .75s' : 'none'
                }}>
                    <AnterosDetailFilter
                        onChangeCalendar={this.onClickOkCalendar}
                        selectedOptions={this.getQuickFields()}
                        selectedFields={this.state.selectedFields}
                        onChangeFields={this.onChangeFields}
                        onApplyFilter={this.onApplyFilter}
                        onSaveFilter={this.onSaveFilter}
                    >
                        {this.props.children}
                    </AnterosDetailFilter>
                </div>
            </div >
        )
    }
}

AnterosQueryBuilder.propTypes = {
    showClearButton: PropTypes.bool.isRequired,
    showToggleButton: PropTypes.bool.isRequired,
    onClearFilter: PropTypes.func
}

AnterosQueryBuilder.defaultProps = {
    showClearButton: false,
    showToggleButton: true
}


class AnterosDetailFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = { checked: false };
        autoBind(this);
    }

    convertQueryFields(children) {
        let result = [];
        let arrChildren = React.Children.toArray(children);
        arrChildren.forEach(function (child) {
            if (child.type && child.type.componentName === 'QueryFields') {
                if (child.props.children) {
                    let arrChild = React.Children.toArray(child.props.children);
                    arrChild.forEach(function (chd) {
                        let childs = [];
                        let arrChildren2 = React.Children.toArray(chd.children);
                        arrChildren2.forEach(function (child2) {
                            childs.push(<FilterFieldValue {...child2.props} />);
                        });

                        result.push(<FilterField {...chd.props}>
                            {childs}
                        </FilterField>);
                    });
                }
            }
        });
        return result;
    }

    onChange(value, checked) {
        this.setState({ checked });
    }

    onQueryChange(query){
        
    }
    onSortChange(sort, activeIndex){
        
    }



    render() {
        let fieldsFilter = this.convertQueryFields(this.props.children);
        return <div style={{ padding: "10px" }}>
            <AnterosText fontWeight="bold" text="Filtros salvos" />
            <AnterosList height="105px" />
            <div className="filter-apply">
                <AnterosButton id="btnApply" hint="Aplicar filtro" success icon="far fa-filter" caption="Aplicar" />
                <AnterosButton id="btnSave" hint="Salvar filtro" primary icon="far fa-save" caption="Salvar" />
            </div>
            <AnterosCheckbox style={{ color: 'crimson' }}
                value="Avançado"
                checked={this.state.checked}
                valueChecked={true}
                valueUnchecked={false}
                onCheckboxChange={this.onChange} />
            {this.state.checked ?
                <AnterosAdvancedFilter
                    onQueryChange= {this.onQueryChange}
                    onSortChange = {this.onSortChange}
                    width={'100%'}
                    horizontal={false}
                    border={"none"}>
                    <FilterFields>
                        {fieldsFilter}
                    </FilterFields>
                </AnterosAdvancedFilter>
                :
                <AnterosFastFilter {...this.props} />}
        </div>
    }
}


class AnterosFastFilter extends React.Component {

    renderCheckboxFields = () => {
        const selectedOptions = this.props.selectedOptions

        if (selectedOptions) {
            return selectedOptions.map(sl => {
                let checked = false;

                this.props.selectedFields.map(sf => {
                    if (sf.name === sl.name) {
                        checked = true;
                    }
                })
                return (
                    <AnterosCheckbox
                        value={sl.label}
                        checked={checked}
                        valueChecked={true}
                        valueUnchecked={false}
                        onCheckboxChange={(value, checked) => {
                            let selectedFields = [...this.props.selectedFields]
                            if (checked) {
                                selectedFields.push(sl)
                            } else {
                                selectedFields = this.props.selectedFields.filter(item => item.name !== sl.name)
                            }
                            if (this.props.onChangeFields) {
                                this.props.onChangeFields(selectedFields)
                            }
                        }}
                    />
                )
            })
        }
    }

    render() {
        const { calendarClassName, ...calendarProps } = this.props;
        return (
            <div style={{ paddingBottom: '10px', overflowY: 'auto', overflowX: 'hidden' }}>
                <div style={{
                    height: '128px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    <AnterosFormGroup row={false}>
                        {this.renderCheckboxFields()}
                    </AnterosFormGroup>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <AnterosCalendar
                        className={calendarClassName}
                        selectRange
                        onChange={(value) => {
                            this.props.onChangeCalendar(null, moment(value[0]), moment(value[1]))
                        }}
                        value={null}
                        {...calendarProps}
                    />
                </div>
            </div>
        )
    }
}

export class QueryFields extends React.Component {
    static get componentName() {
        return 'QueryFields';
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}

export class QueryField extends React.Component {
    static get componentName() {
        return 'QueryField';
    }
    render() {
        return null;
    }
}

QueryField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    dataType: PropTypes.oneOf(["string", "number", "date", "date_time", "time"])
        .isRequired,
    sortable: PropTypes.bool.isRequired,
    quickFilter: PropTypes.bool.isRequired,
    quickFilterSort: PropTypes.bool.isRequired
};

QueryField.defaultProps = {
    sortable: true,
    quickFilter: true,
    quickFilterSort: false
};

export class QueryFieldValue extends React.Component {
    static get componentName() {
        return 'QueryFieldValue';
    }
    render() {
        return null;
    }
}

QueryFieldValue.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
};