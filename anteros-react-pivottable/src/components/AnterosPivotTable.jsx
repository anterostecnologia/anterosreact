import React, { Component } from 'react';
import lodash from "lodash";
import PropTypes from 'prop-types';
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "@anterostecnologia/anteros-react-datasource";
import 'script-loader!./AnterosPivot';
import 'script-loader!./AnterosPivotGChart';

export default class AnterosPivotTable extends Component {

    constructor(props) {
        super(props);
        this.idCubo = lodash.uniqueId('cube');
        this.idTable = lodash.uniqueId('cubeTable');
        this.buildFieldLabels = this.buildFieldLabels.bind(this);
        this.buildRows = this.buildRows.bind(this);
        this.buildCols = this.buildCols.bind(this);
        this.buildVals = this.buildVals.bind(this);
        this.buildSorters = this.buildSorters.bind(this);
        this.buildHiddenAttributes = this.buildHiddenAttributes.bind(this);
        this.buildAggregators = this.buildAggregators.bind(this);
        this.buildDerivers = this.buildDerivers.bind(this);
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.exportToExcel = this.exportToExcel.bind(this);
        this.loadCube = this.loadCube.bind(this);
        this.resize = this.resize.bind(this);

        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_OPEN, this.onDatasourceEvent);
        }
    }

    onDatasourceEvent(event) {
        if (event == dataSourceEvents.AFTER_OPEN) {
            this.loadCube(true);
        }
    }

    buildFieldLabels() {
        let labels = [];
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            labels.push({ [name]: label });
        });
        return labels;
    }

    buildRows() {
        let rows = [];
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            if (child.props.showInRow && child.props.visible) {
                rows.push(name);
            }
        });
        return rows;
    }

    buildCols() {
        let cols = [];
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            if (child.props.showInColumn && child.props.visible) {
                cols.push(name);
            }
        });
        return cols;
    }

    buildVals() {
        let vals = [];
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            if (child.props.showInValues && child.props.visible) {
                vals.push(name);
            }
        });
        return vals;
    }

    buildAggregators() {
        let vals = [];
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            if (child.props.showInAggregators && child.props.visible) {
                vals.push(name);
            }
        });
        return vals;
    }

    buildSorters() {
        let sorters = {};
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            if (child.props.sorter) {
                sorters = { ...sorters, [name]: child.props.sorter };
            }
        });
        return sorters;
    }

    buildHiddenAttributes() {
        let hidden = [];
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            if (!child.props.visible) {
                hidden.push(name);
            }
        });
        return hidden;
    }

    buildDerivers() {
        let derivers = {};
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            let name = child.props.name;
            let label = child.props.label;
            if (child.props.deriver) {
                derivers = { ...derivers, [name]: child.props.deriver };
            }
        });
        return derivers;
    }


    componentDidMount() {
        let _this = this;
        this.resize();
        $(window).resize(function () {
            _this.resize();
        });
    }

    resize() {
        let width = $(this.cube).width() - $('.pvtRows').width() - 50;
        $('.pvtRendererArea').css({ width: width + "px" });
    }

    loadCube(overwrite) {
        let _this = this;
        let renderers = $.extend(
            $.pivotUtilities.renderers);
        if (this.props.showCharts) {
            renderers = $.extend(
                $.pivotUtilities.renderers,
                $.pivotUtilities.gchart_renderers)
        }
        let rendererOptions = this.props.rendererOptions;
        if (this.props.onClickValue) {
            rendererOptions = { ...rendererOptions, table: { clickCallback: this.props.onClickValue } }
        }
        let rowOrder = "key_a_to_z";
        if (this.props.rowOrder == 'desc') {
            rowOrder = "key_z_to_a";
        }
        let colOrder = "key_a_to_z";
        if (this.props.colOrder == 'desc') {
            colOrder = "key_z_to_a";
        }

        let data = [];
        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            data = this.props.dataSource.getData();
        } else {
            data = this.props.dataSource;
        }

        let options = {
            tableId: _this.idTable,
            labels: _this.buildFieldLabels(),
            aggregatorsValues: _this.buildAggregators(),
            rows: _this.buildRows(),
            cols: _this.buildCols(),
            vals: _this.buildVals(),
            menuLimit: _this.props.menuLimit,
            rowOrder: rowOrder,
            colOrder: colOrder,
            aggregatorName: _this.props.aggregatorName,
            rendererName: _this.props.rendererName,
            renderers: renderers,
            sorters: _this.buildSorters(),
            derivedAttributes: _this.buildDerivers(),
            aggregators: _this.props.aggregators,
            rendererOptions: rendererOptions,
            hiddenAttributes: _this.buildHiddenAttributes()
        };

        $(this.cube).pivotUI(
            this.props.dataSource.getData(), options, overwrite, _this.props.locale);
        this.resize();
    }

    exportToExcel(filename) {
        var a = document.createElement('a');
        var data_type = 'data:application/vnd.ms-excel';
        var table_html = document.getElementById(this.idTable).getElementsByTagName('table')[0].outerHTML;
        var table_html = table_html.replace(/ /g, '%20');
        a.href = data_type + ', ' + table_html;
        a.download = filename;
        a.click();
    }

    render() {
        if (this.props.id) {
            this.idCubo = this.props.id;
        }
        return (<div id={this.idCubo} ref={ref => this.cube = ref} />);
    }
}

AnterosPivotTable.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    id: PropTypes.string,
    locale: PropTypes.string.isRequired,
    showCharts: PropTypes.bool.isRequired,
    aggregatorName: PropTypes.string.isRequired,
    rendererName: PropTypes.string.isRequired,
    rowOrder: PropTypes.oneOf(['asc', 'desc']),
    colOrder: PropTypes.oneOf(['asc', 'desc']),
    filter: PropTypes.func,
    inclusions: PropTypes.object,
    exclusions: PropTypes.object,
    rendererOptions: PropTypes.object,
    aggregators: PropTypes.object,
    rendererOptions: PropTypes.object,
    onRefresh: PropTypes.func,
    menuLimit: PropTypes.number.isRequired,
    onClickValue: PropTypes.func
}

AnterosPivotTable.defaultProps = {
    locale: 'pt',
    showCharts: true,
    aggregatorName: 'Soma',
    rendererName: 'Tabela',
    rowOrder: 'asc',
    colOrder: 'asc',
    menuLimit: 1000
}


export class AnterosPivotTableField extends Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.stopPropagation();
    }

    render() {
        return null;
    }
}

AnterosPivotTableField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    showInRow: PropTypes.bool.isRequired,
    showInColumn: PropTypes.bool.isRequired,
    showInValues: PropTypes.bool.isRequired,
    showInAggregators: PropTypes.bool.isRequired,
    sorter: PropTypes.func,
    deriver: PropTypes.func,
    visible: PropTypes.bool
}

AnterosPivotTableField.defaultProps = {
    showInRow: false,
    showInColumn: false,
    showInValues: false,
    showInAggregators: false,
    visible: true
}