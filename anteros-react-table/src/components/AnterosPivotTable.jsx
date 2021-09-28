import React, { Component } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { ReactSortable } from 'react-sortablejs';
import Draggable from 'react-draggable';
import { autoBind } from '@anterostecnologia/anteros-react-core';
import createPlotlyComponent from 'react-plotly.js/factory';
import { AnterosRemoteDatasource, AnterosLocalDatasource } from '@anterostecnologia/anteros-react-datasource';
const Plot = createPlotlyComponent(window.Plotly);


function addSeparators(nStr, thousandsSep, decimalSep) {
    const x = String(nStr).split('.');
    let x1 = x[0];
    const x2 = x.length > 1 ? decimalSep + x[1] : '';
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, `$1${thousandsSep}$2`);
    }
    return x1 + x2;
};

function numberFormat(opts_in) {
    const defaults = {
        digitsAfterDecimal: 2,
        scaler: 1,
        thousandsSep: ',',
        decimalSep: '.',
        prefix: '',
        suffix: '',
    };
    const opts = Object.assign({}, defaults, opts_in);
    return function (x) {
        if (isNaN(x) || !isFinite(x)) {
            return '';
        }
        const result = addSeparators(
            (opts.scaler * x).toFixed(opts.digitsAfterDecimal),
            opts.thousandsSep,
            opts.decimalSep
        );
        return `${opts.prefix}${result}${opts.suffix}`;
    };
};

const rx = /(\d+)|(\D+)/g;
const rd = /\d/;
const rz = /^0/;
const naturalSort = (as, bs) => {
    // nulls first
    if (bs !== null && as === null) {
        return -1;
    }
    if (as !== null && bs === null) {
        return 1;
    }

    // then raw NaNs
    if (typeof as === 'number' && isNaN(as)) {
        return -1;
    }
    if (typeof bs === 'number' && isNaN(bs)) {
        return 1;
    }

    // numbers and numbery strings group together
    const nas = Number(as);
    const nbs = Number(bs);
    if (nas < nbs) {
        return -1;
    }
    if (nas > nbs) {
        return 1;
    }

    // within that, true numbers before numbery strings
    if (typeof as === 'number' && typeof bs !== 'number') {
        return -1;
    }
    if (typeof bs === 'number' && typeof as !== 'number') {
        return 1;
    }
    if (typeof as === 'number' && typeof bs === 'number') {
        return 0;
    }

    // 'Infinity' is a textual number, so less than 'A'
    if (isNaN(nbs) && !isNaN(nas)) {
        return -1;
    }
    if (isNaN(nas) && !isNaN(nbs)) {
        return 1;
    }

    // finally, "smart" string sorting per http://stackoverflow.com/a/4373421/112871
    let a = String(as);
    let b = String(bs);
    if (a === b) {
        return 0;
    }
    if (!rd.test(a) || !rd.test(b)) {
        return a > b ? 1 : -1;
    }

    // special treatment for strings containing digits
    a = a.match(rx);
    b = b.match(rx);
    while (a.length && b.length) {
        const a1 = a.shift();
        const b1 = b.shift();
        if (a1 !== b1) {
            if (rd.test(a1) && rd.test(b1)) {
                return a1.replace(rz, '.0') - b1.replace(rz, '.0');
            }
            return a1 > b1 ? 1 : -1;
        }
    }
    return a.length - b.length;
};

function sortAs(order) {
    const mapping = {};

    // sort lowercased keys similarly
    const l_mapping = {};
    for (const i in order) {
        const x = order[i];
        mapping[x] = i;
        if (typeof x === 'string') {
            l_mapping[x.toLowerCase()] = i;
        }
    }
    return function (a, b) {
        if (a in mapping && b in mapping) {
            return mapping[a] - mapping[b];
        } else if (a in mapping) {
            return -1;
        } else if (b in mapping) {
            return 1;
        } else if (a in l_mapping && b in l_mapping) {
            return l_mapping[a] - l_mapping[b];
        } else if (a in l_mapping) {
            return -1;
        } else if (b in l_mapping) {
            return 1;
        }
        return naturalSort(a, b);
    };
};

function getSort(sorters, attr) {
    if (sorters) {
        if (typeof sorters === 'function') {
            const sort = sorters(attr);
            if (typeof sort === 'function') {
                return sort;
            }
        } else if (attr in sorters) {
            return sorters[attr];
        }
    }
    return naturalSort;
};

// aggregator templates default to US number formatting but this is overrideable
const usFmt = numberFormat();
const usFmtInt = numberFormat({ digitsAfterDecimal: 0 });
const usFmtPct = numberFormat({
    digitsAfterDecimal: 1,
    scaler: 100,
    suffix: '%',
});

const aggregatorTemplates = {
    count(formatter = usFmtInt) {
        return () =>
            function () {
                return {
                    count: 0,
                    push() {
                        this.count++;
                    },
                    value() {
                        return this.count;
                    },
                    format: formatter,
                };
            };
    },

    uniques(fn, formatter = usFmtInt) {
        return function ([attr]) {
            return function () {
                return {
                    uniq: [],
                    push(record) {
                        if (!Array.from(this.uniq).includes(record[attr])) {
                            this.uniq.push(record[attr]);
                        }
                    },
                    value() {
                        return fn(this.uniq);
                    },
                    format: formatter,
                    numInputs: typeof attr !== 'undefined' ? 0 : 1,
                };
            };
        };
    },

    sum(formatter = usFmt) {
        return function ([attr]) {
            return function () {
                return {
                    sum: 0,
                    push(record) {
                        if (!isNaN(parseFloat(record[attr]))) {
                            this.sum += parseFloat(record[attr]);
                        }
                    },
                    value() {
                        return this.sum;
                    },
                    format: formatter,
                    numInputs: typeof attr !== 'undefined' ? 0 : 1,
                };
            };
        };
    },

    extremes(mode, formatter = usFmt) {
        return function ([attr]) {
            return function (data) {
                return {
                    val: null,
                    sorter: getSort(
                        typeof data !== 'undefined' ? data.sorters : null,
                        attr
                    ),
                    push(record) {
                        let x = record[attr];
                        if (['min', 'max'].includes(mode)) {
                            x = parseFloat(x);
                            if (!isNaN(x)) {
                                this.val = Math[mode](x, this.val !== null ? this.val : x);
                            }
                        }
                        if (
                            mode === 'first' &&
                            this.sorter(x, this.val !== null ? this.val : x) <= 0
                        ) {
                            this.val = x;
                        }
                        if (
                            mode === 'last' &&
                            this.sorter(x, this.val !== null ? this.val : x) >= 0
                        ) {
                            this.val = x;
                        }
                    },
                    value() {
                        return this.val;
                    },
                    format(x) {
                        if (isNaN(x)) {
                            return x;
                        }
                        return formatter(x);
                    },
                    numInputs: typeof attr !== 'undefined' ? 0 : 1,
                };
            };
        };
    },

    quantile(q, formatter = usFmt) {
        return function ([attr]) {
            return function () {
                return {
                    vals: [],
                    push(record) {
                        const x = parseFloat(record[attr]);
                        if (!isNaN(x)) {
                            this.vals.push(x);
                        }
                    },
                    value() {
                        if (this.vals.length === 0) {
                            return null;
                        }
                        this.vals.sort((a, b) => a - b);
                        const i = (this.vals.length - 1) * q;
                        return (this.vals[Math.floor(i)] + this.vals[Math.ceil(i)]) / 2.0;
                    },
                    format: formatter,
                    numInputs: typeof attr !== 'undefined' ? 0 : 1,
                };
            };
        };
    },

    runningStat(mode = 'mean', ddof = 1, formatter = usFmt) {
        return function ([attr]) {
            return function () {
                return {
                    n: 0.0,
                    m: 0.0,
                    s: 0.0,
                    push(record) {
                        const x = parseFloat(record[attr]);
                        if (isNaN(x)) {
                            return;
                        }
                        this.n += 1.0;
                        if (this.n === 1.0) {
                            this.m = x;
                        }
                        const m_new = this.m + (x - this.m) / this.n;
                        this.s = this.s + (x - this.m) * (x - m_new);
                        this.m = m_new;
                    },
                    value() {
                        if (mode === 'mean') {
                            if (this.n === 0) {
                                return 0 / 0;
                            }
                            return this.m;
                        }
                        if (this.n <= ddof) {
                            return 0;
                        }
                        switch (mode) {
                            case 'var':
                                return this.s / (this.n - ddof);
                            case 'stdev':
                                return Math.sqrt(this.s / (this.n - ddof));
                            default:
                                throw new Error('unknown mode for runningStat');
                        }
                    },
                    format: formatter,
                    numInputs: typeof attr !== 'undefined' ? 0 : 1,
                };
            };
        };
    },

    sumOverSum(formatter = usFmt) {
        return function ([num, denom]) {
            return function () {
                return {
                    sumNum: 0,
                    sumDenom: 0,
                    push(record) {
                        if (!isNaN(parseFloat(record[num]))) {
                            this.sumNum += parseFloat(record[num]);
                        }
                        if (!isNaN(parseFloat(record[denom]))) {
                            this.sumDenom += parseFloat(record[denom]);
                        }
                    },
                    value() {
                        return this.sumNum / this.sumDenom;
                    },
                    format: formatter,
                    numInputs:
                        typeof num !== 'undefined' && typeof denom !== 'undefined' ? 0 : 2,
                };
            };
        };
    },

    fractionOf(wrapped, type = 'total', formatter = usFmtPct) {
        return (...x) =>
            function (data, rowKey, colKey) {
                return {
                    selector: { total: [[], []], row: [rowKey, []], col: [[], colKey] }[
                        type
                    ],
                    inner: wrapped(...Array.from(x || []))(data, rowKey, colKey),
                    push(record) {
                        this.inner.push(record);
                    },
                    format: formatter,
                    value() {
                        return (
                            this.inner.value() /
                            data
                                .getAggregator(...Array.from(this.selector || []))
                                .inner.value()
                        );
                    },
                    numInputs: wrapped(...Array.from(x || []))().numInputs,
                };
            };
    },
};

aggregatorTemplates.countUnique = f =>
    aggregatorTemplates.uniques(x => x.length, f);
aggregatorTemplates.listUnique = s =>
    aggregatorTemplates.uniques(x => x.join(s), x => x);
aggregatorTemplates.max = f => aggregatorTemplates.extremes('max', f);
aggregatorTemplates.min = f => aggregatorTemplates.extremes('min', f);
aggregatorTemplates.first = f => aggregatorTemplates.extremes('first', f);
aggregatorTemplates.last = f => aggregatorTemplates.extremes('last', f);
aggregatorTemplates.median = f => aggregatorTemplates.quantile(0.5, f);
aggregatorTemplates.average = f =>
    aggregatorTemplates.runningStat('mean', 1, f);
aggregatorTemplates.var = (ddof, f) =>
    aggregatorTemplates.runningStat('var', ddof, f);
aggregatorTemplates.stdev = (ddof, f) =>
    aggregatorTemplates.runningStat('stdev', ddof, f);

// default aggregators & renderers use US naming and number formatting
const aggregators = (tpl => ({
    Count: tpl.count(usFmtInt),
    'Count Unique Values': tpl.countUnique(usFmtInt),
    'List Unique Values': tpl.listUnique(', '),
    Sum: tpl.sum(usFmt),
    'Integer Sum': tpl.sum(usFmtInt),
    Average: tpl.average(usFmt),
    Median: tpl.median(usFmt),
    'Sample Variance': tpl.var(1, usFmt),
    'Sample Standard Deviation': tpl.stdev(1, usFmt),
    Minimum: tpl.min(usFmt),
    Maximum: tpl.max(usFmt),
    First: tpl.first(usFmt),
    Last: tpl.last(usFmt),
    'Sum over Sum': tpl.sumOverSum(usFmt),
    'Sum as Fraction of Total': tpl.fractionOf(tpl.sum(), 'total', usFmtPct),
    'Sum as Fraction of Rows': tpl.fractionOf(tpl.sum(), 'row', usFmtPct),
    'Sum as Fraction of Columns': tpl.fractionOf(tpl.sum(), 'col', usFmtPct),
    'Count as Fraction of Total': tpl.fractionOf(tpl.count(), 'total', usFmtPct),
    'Count as Fraction of Rows': tpl.fractionOf(tpl.count(), 'row', usFmtPct),
    'Count as Fraction of Columns': tpl.fractionOf(tpl.count(), 'col', usFmtPct),
}))(aggregatorTemplates);

const locales = {
    en: {
        aggregators,
        localeStrings: {
            renderError: 'An error occurred rendering the PivotTable results.',
            computeError: 'An error occurred computing the PivotTable results.',
            uiRenderError: 'An error occurred rendering the PivotTable UI.',
            selectAll: 'Select All',
            selectNone: 'Select None',
            tooMany: '(too many to list)',
            filterResults: 'Filter values',
            apply: 'Apply',
            cancel: 'Cancel',
            totals: 'Totals',
            vs: 'vs',
            by: 'by',
        },
    },
};

// dateFormat deriver l10n requires month and day names to be passed in directly
const mthNamesEn = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const zeroPad = number => `0${number}`.substr(-2, 2); // eslint-disable-line no-magic-numbers

const derivers = {
    bin(col, binWidth) {
        return record => record[col] - record[col] % binWidth;
    },
    dateFormat(
        col,
        formatString,
        utcOutput = false,
        mthNames = mthNamesEn,
        dayNames = dayNamesEn
    ) {
        const utc = utcOutput ? 'UTC' : '';
        return function (record) {
            const date = new Date(Date.parse(record[col]));
            if (isNaN(date)) {
                return '';
            }
            return formatString.replace(/%(.)/g, function (m, p) {
                switch (p) {
                    case 'y':
                        return date[`get${utc}FullYear`]();
                    case 'm':
                        return zeroPad(date[`get${utc}Month`]() + 1);
                    case 'n':
                        return mthNames[date[`get${utc}Month`]()];
                    case 'd':
                        return zeroPad(date[`get${utc}Date`]());
                    case 'w':
                        return dayNames[date[`get${utc}Day`]()];
                    case 'x':
                        return date[`get${utc}Day`]();
                    case 'H':
                        return zeroPad(date[`get${utc}Hours`]());
                    case 'M':
                        return zeroPad(date[`get${utc}Minutes`]());
                    case 'S':
                        return zeroPad(date[`get${utc}Seconds`]());
                    default:
                        return `%${p}`;
                }
            });
        };
    },
};

/*
Data Model class
*/

class PivotData {
    constructor(inputProps = {}) {
        this.props = Object.assign({}, PivotData.defaultProps, inputProps);
        PropTypes.checkPropTypes(
            PivotData.propTypes,
            this.props,
            'prop',
            'PivotData'
        );

        this.aggregator = this.props.aggregators[this.props.aggregatorName](
            this.props.vals
        );
        this.tree = {};
        this.rowKeys = [];
        this.colKeys = [];
        this.rowTotals = {};
        this.colTotals = {};
        this.allTotal = this.aggregator(this, [], []);
        this.sorted = false;

        // iterate through input, accumulating data for cells
        PivotData.forEachRecord(
            this.props.data,
            this.props.derivedAttributes,
            record => {
                if (this.filter(record)) {
                    this.processRecord(record);
                }
            }
        );
    }

    filter(record) {
        for (const k in this.props.valueFilter) {
            if (record[k] in this.props.valueFilter[k]) {
                return false;
            }
        }
        return true;
    }

    forEachMatchingRecord(criteria, callback) {
        return PivotData.forEachRecord(
            this.props.data,
            this.props.derivedAttributes,
            record => {
                if (!this.filter(record)) {
                    return;
                }
                for (const k in criteria) {
                    const v = criteria[k];
                    if (v !== (k in record ? record[k] : 'null')) {
                        return;
                    }
                }
                callback(record);
            }
        );
    }

    arrSort(attrs) {
        let a;
        const sortersArr = (() => {
            const result = [];
            for (a of Array.from(attrs)) {
                result.push(getSort(this.props.sorters, a));
            }
            return result;
        })();
        return function (a, b) {
            for (const i of Object.keys(sortersArr || {})) {
                const sorter = sortersArr[i];
                const comparison = sorter(a[i], b[i]);
                if (comparison !== 0) {
                    return comparison;
                }
            }
            return 0;
        };
    }

    sortKeys() {
        if (!this.sorted) {
            this.sorted = true;
            const v = (r, c) => this.getAggregator(r, c).value();
            switch (this.props.rowOrder) {
                case 'value_a_to_z':
                    this.rowKeys.sort((a, b) => naturalSort(v(a, []), v(b, [])));
                    break;
                case 'value_z_to_a':
                    this.rowKeys.sort((a, b) => -naturalSort(v(a, []), v(b, [])));
                    break;
                default:
                    this.rowKeys.sort(this.arrSort(this.props.rows));
            }
            switch (this.props.colOrder) {
                case 'value_a_to_z':
                    this.colKeys.sort((a, b) => naturalSort(v([], a), v([], b)));
                    break;
                case 'value_z_to_a':
                    this.colKeys.sort((a, b) => -naturalSort(v([], a), v([], b)));
                    break;
                default:
                    this.colKeys.sort(this.arrSort(this.props.cols));
            }
        }
    }

    getColKeys() {
        this.sortKeys();
        return this.colKeys;
    }

    getRowKeys() {
        this.sortKeys();
        return this.rowKeys;
    }

    processRecord(record) {
        // this code is called in a tight loop
        const colKey = [];
        const rowKey = [];
        for (const x of Array.from(this.props.cols)) {
            colKey.push(x in record ? record[x] : 'null');
        }
        for (const x of Array.from(this.props.rows)) {
            rowKey.push(x in record ? record[x] : 'null');
        }
        const flatRowKey = rowKey.join(String.fromCharCode(0));
        const flatColKey = colKey.join(String.fromCharCode(0));

        this.allTotal.push(record);

        if (rowKey.length !== 0) {
            if (!this.rowTotals[flatRowKey]) {
                this.rowKeys.push(rowKey);
                this.rowTotals[flatRowKey] = this.aggregator(this, rowKey, []);
            }
            this.rowTotals[flatRowKey].push(record);
        }

        if (colKey.length !== 0) {
            if (!this.colTotals[flatColKey]) {
                this.colKeys.push(colKey);
                this.colTotals[flatColKey] = this.aggregator(this, [], colKey);
            }
            this.colTotals[flatColKey].push(record);
        }

        if (colKey.length !== 0 && rowKey.length !== 0) {
            if (!this.tree[flatRowKey]) {
                this.tree[flatRowKey] = {};
            }
            if (!this.tree[flatRowKey][flatColKey]) {
                this.tree[flatRowKey][flatColKey] = this.aggregator(
                    this,
                    rowKey,
                    colKey
                );
            }
            this.tree[flatRowKey][flatColKey].push(record);
        }
    }

    getAggregator(rowKey, colKey) {
        let agg;
        const flatRowKey = rowKey.join(String.fromCharCode(0));
        const flatColKey = colKey.join(String.fromCharCode(0));
        if (rowKey.length === 0 && colKey.length === 0) {
            agg = this.allTotal;
        } else if (rowKey.length === 0) {
            agg = this.colTotals[flatColKey];
        } else if (colKey.length === 0) {
            agg = this.rowTotals[flatRowKey];
        } else {
            agg = this.tree[flatRowKey][flatColKey];
        }
        return (
            agg || {
                value() {
                    return null;
                },
                format() {
                    return '';
                },
            }
        );
    }
}

// can handle arrays or jQuery selections of tables
PivotData.forEachRecord = function (input, derivedAttributes, f) {
    let addRecord, record;
    if (Object.getOwnPropertyNames(derivedAttributes).length === 0) {
        addRecord = f;
    } else {
        addRecord = function (record) {
            for (const k in derivedAttributes) {
                const derived = derivedAttributes[k](record);
                if (derived !== null) {
                    record[k] = derived;
                }
            }
            return f(record);
        };
    }

    // if it's a function, have it call us back
    if (typeof input === 'function') {
        return input(addRecord);
    } else if (Array.isArray(input)) {
        if (Array.isArray(input[0])) {
            // array of arrays
            return (() => {
                const result = [];
                for (const i of Object.keys(input || {})) {
                    const compactRecord = input[i];
                    if (i > 0) {
                        record = {};
                        for (const j of Object.keys(input[0] || {})) {
                            const k = input[0][j];
                            record[k] = compactRecord[j];
                        }
                        result.push(addRecord(record));
                    }
                }
                return result;
            })();
        }

        // array of objects
        return (() => {
            const result1 = [];
            for (record of Array.from(input)) {
                result1.push(addRecord(record));
            }
            return result1;
        })();
    }
    throw new Error('unknown input format');
};

PivotData.defaultProps = {
    aggregators: aggregators,
    cols: [],
    rows: [],
    vals: [],
    aggregatorName: 'Count',
    sorters: {},
    valueFilter: {},
    rowOrder: 'key_a_to_z',
    colOrder: 'key_a_to_z',
    derivedAttributes: {},
};

PivotData.propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
        .isRequired,
    aggregatorName: PropTypes.string,
    cols: PropTypes.arrayOf(PropTypes.string),
    rows: PropTypes.arrayOf(PropTypes.string),
    vals: PropTypes.arrayOf(PropTypes.string),
    valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
    sorters: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.objectOf(PropTypes.func),
    ]),
    derivedAttributes: PropTypes.objectOf(PropTypes.func),
    rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
    colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
};


// helper function for setting row/col-span in pivotTableRenderer
const spanSize = function (arr, i, j) {
    let x;
    if (i !== 0) {
        let asc, end;
        let noDraw = true;
        for (
            x = 0, end = j, asc = end >= 0;
            asc ? x <= end : x >= end;
            asc ? x++ : x--
        ) {
            if (arr[i - 1][x] !== arr[i][x]) {
                noDraw = false;
            }
        }
        if (noDraw) {
            return -1;
        }
    }
    let len = 0;
    while (i + len < arr.length) {
        let asc1, end1;
        let stop = false;
        for (
            x = 0, end1 = j, asc1 = end1 >= 0;
            asc1 ? x <= end1 : x >= end1;
            asc1 ? x++ : x--
        ) {
            if (arr[i][x] !== arr[i + len][x]) {
                stop = true;
            }
        }
        if (stop) {
            break;
        }
        len++;
    }
    return len;
};

function redColorScaleGenerator(values) {
    const min = Math.min.apply(Math, values);
    const max = Math.max.apply(Math, values);
    return x => {
        // eslint-disable-next-line no-magic-numbers
        const nonRed = 255 - Math.round(255 * (x - min) / (max - min));
        return { backgroundColor: `rgb(255,${nonRed},${nonRed})` };
    };
}

function makeRenderer(opts = {}) {
    class TableRenderer extends React.PureComponent {
        render() {
            const pivotData = new PivotData(this.props);
            const colAttrs = pivotData.props.cols;
            const rowAttrs = pivotData.props.rows;
            const rowKeys = pivotData.getRowKeys();
            const colKeys = pivotData.getColKeys();
            const grandTotalAggregator = pivotData.getAggregator([], []);

            let valueCellColors = () => { };
            let rowTotalColors = () => { };
            let colTotalColors = () => { };
            if (opts.heatmapMode) {
                const colorScaleGenerator = this.props.tableColorScaleGenerator;
                const rowTotalValues = colKeys.map(x =>
                    pivotData.getAggregator([], x).value()
                );
                rowTotalColors = colorScaleGenerator(rowTotalValues);
                const colTotalValues = rowKeys.map(x =>
                    pivotData.getAggregator(x, []).value()
                );
                colTotalColors = colorScaleGenerator(colTotalValues);

                if (opts.heatmapMode === 'full') {
                    const allValues = [];
                    rowKeys.map(r =>
                        colKeys.map(c =>
                            allValues.push(pivotData.getAggregator(r, c).value())
                        )
                    );
                    const colorScale = colorScaleGenerator(allValues);
                    valueCellColors = (r, c, v) => colorScale(v);
                } else if (opts.heatmapMode === 'row') {
                    const rowColorScales = {};
                    rowKeys.map(r => {
                        const rowValues = colKeys.map(x =>
                            pivotData.getAggregator(r, x).value()
                        );
                        rowColorScales[r] = colorScaleGenerator(rowValues);
                    });
                    valueCellColors = (r, c, v) => rowColorScales[r](v);
                } else if (opts.heatmapMode === 'col') {
                    const colColorScales = {};
                    colKeys.map(c => {
                        const colValues = rowKeys.map(x =>
                            pivotData.getAggregator(x, c).value()
                        );
                        colColorScales[c] = colorScaleGenerator(colValues);
                    });
                    valueCellColors = (r, c, v) => colColorScales[c](v);
                }
            }

            const getClickHandler =
                this.props.tableOptions && this.props.tableOptions.clickCallback
                    ? (value, rowValues, colValues) => {
                        const filters = {};
                        for (const i of Object.keys(colAttrs || {})) {
                            const attr = colAttrs[i];
                            if (colValues[i] !== null) {
                                filters[attr] = colValues[i];
                            }
                        }
                        for (const i of Object.keys(rowAttrs || {})) {
                            const attr = rowAttrs[i];
                            if (rowValues[i] !== null) {
                                filters[attr] = rowValues[i];
                            }
                        }
                        return e =>
                            this.props.tableOptions.clickCallback(
                                e,
                                value,
                                filters,
                                pivotData
                            );
                    }
                    : null;

            return (
                <table className="pvtTable">
                    <thead>
                        {colAttrs.map(function (c, j) {
                            return (
                                <tr key={`colAttr${j}`}>
                                    {j === 0 &&
                                        rowAttrs.length !== 0 && (
                                            <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
                                        )}
                                    <th className="pvtAxisLabel">{c}</th>
                                    {colKeys.map(function (colKey, i) {
                                        const x = spanSize(colKeys, i, j);
                                        if (x === -1) {
                                            return null;
                                        }
                                        return (
                                            <th
                                                className="pvtColLabel"
                                                key={`colKey${i}`}
                                                colSpan={x}
                                                rowSpan={
                                                    j === colAttrs.length - 1 && rowAttrs.length !== 0
                                                        ? 2
                                                        : 1
                                                }
                                            >
                                                {colKey[j]}
                                            </th>
                                        );
                                    })}

                                    {j === 0 && (
                                        <th
                                            className="pvtTotalLabel"
                                            rowSpan={
                                                colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
                                            }
                                        >
                                            Totals
                      </th>
                                    )}
                                </tr>
                            );
                        })}

                        {rowAttrs.length !== 0 && (
                            <tr>
                                {rowAttrs.map(function (r, i) {
                                    return (
                                        <th className="pvtAxisLabel" key={`rowAttr${i}`}>
                                            {r}
                                        </th>
                                    );
                                })}
                                <th className="pvtTotalLabel">
                                    {colAttrs.length === 0 ? 'Totals' : null}
                                </th>
                            </tr>
                        )}
                    </thead>

                    <tbody>
                        {rowKeys.map(function (rowKey, i) {
                            const totalAggregator = pivotData.getAggregator(rowKey, []);
                            return (
                                <tr key={`rowKeyRow${i}`}>
                                    {rowKey.map(function (txt, j) {
                                        const x = spanSize(rowKeys, i, j);
                                        if (x === -1) {
                                            return null;
                                        }
                                        return (
                                            <th
                                                key={`rowKeyLabel${i}-${j}`}
                                                className="pvtRowLabel"
                                                rowSpan={x}
                                                colSpan={
                                                    j === rowAttrs.length - 1 && colAttrs.length !== 0
                                                        ? 2
                                                        : 1
                                                }
                                            >
                                                {txt}
                                            </th>
                                        );
                                    })}
                                    {colKeys.map(function (colKey, j) {
                                        const aggregator = pivotData.getAggregator(rowKey, colKey);
                                        return (
                                            <td
                                                className="pvtVal"
                                                key={`pvtVal${i}-${j}`}
                                                onClick={
                                                    getClickHandler &&
                                                    getClickHandler(aggregator.value(), rowKey, colKey)
                                                }
                                                style={valueCellColors(
                                                    rowKey,
                                                    colKey,
                                                    aggregator.value()
                                                )}
                                            >
                                                {aggregator.format(aggregator.value())}
                                            </td>
                                        );
                                    })}
                                    <td
                                        className="pvtTotal"
                                        onClick={
                                            getClickHandler &&
                                            getClickHandler(totalAggregator.value(), rowKey, [null])
                                        }
                                        style={colTotalColors(totalAggregator.value())}
                                    >
                                        {totalAggregator.format(totalAggregator.value())}
                                    </td>
                                </tr>
                            );
                        })}

                        <tr>
                            <th
                                className="pvtTotalLabel"
                                colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
                            >
                                Totals
                </th>

                            {colKeys.map(function (colKey, i) {
                                const totalAggregator = pivotData.getAggregator([], colKey);
                                return (
                                    <td
                                        className="pvtTotal"
                                        key={`total${i}`}
                                        onClick={
                                            getClickHandler &&
                                            getClickHandler(totalAggregator.value(), [null], colKey)
                                        }
                                        style={rowTotalColors(totalAggregator.value())}
                                    >
                                        {totalAggregator.format(totalAggregator.value())}
                                    </td>
                                );
                            })}

                            <td
                                onClick={
                                    getClickHandler &&
                                    getClickHandler(grandTotalAggregator.value(), [null], [null])
                                }
                                className="pvtGrandTotal"
                            >
                                {grandTotalAggregator.format(grandTotalAggregator.value())}
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
    }

    TableRenderer.defaultProps = PivotData.defaultProps;
    TableRenderer.propTypes = PivotData.propTypes;
    TableRenderer.defaultProps.tableColorScaleGenerator = redColorScaleGenerator;
    TableRenderer.defaultProps.tableOptions = {};
    TableRenderer.propTypes.tableColorScaleGenerator = PropTypes.func;
    TableRenderer.propTypes.tableOptions = PropTypes.object;
    return TableRenderer;
}

class TSVExportRenderer extends React.PureComponent {
    render() {
        const pivotData = new PivotData(this.props);
        const rowKeys = pivotData.getRowKeys();
        const colKeys = pivotData.getColKeys();
        if (rowKeys.length === 0) {
            rowKeys.push([]);
        }
        if (colKeys.length === 0) {
            colKeys.push([]);
        }

        const headerRow = pivotData.props.rows.map(r => r);
        if (colKeys.length === 1 && colKeys[0].length === 0) {
            headerRow.push(this.props.aggregatorName);
        } else {
            colKeys.map(c => headerRow.push(c.join('-')));
        }

        const result = rowKeys.map(r => {
            const row = r.map(x => x);
            colKeys.map(c => {
                const v = pivotData.getAggregator(r, c).value();
                row.push(v ? v : '');
            });
            return row;
        });

        result.unshift(headerRow);

        return (
            <textarea
                value={result.map(r => r.join('\t')).join('\n')}
                style={{ width: window.innerWidth / 2, height: window.innerHeight / 2 }}
                readOnly={true}
            />
        );
    }
}

TSVExportRenderer.defaultProps = PivotData.defaultProps;
TSVExportRenderer.propTypes = PivotData.propTypes;


function makeRendererChart(
    PlotlyComponent,
    traceOptions = {},
    layoutOptions = {},
    transpose = false
) {
    class Renderer extends React.PureComponent {
        render() {
            const pivotData = new PivotData(this.props);
            const rowKeys = pivotData.getRowKeys();
            const colKeys = pivotData.getColKeys();
            const traceKeys = transpose ? colKeys : rowKeys;
            if (traceKeys.length === 0) {
                traceKeys.push([]); 
            }
            const datumKeys = transpose ? rowKeys : colKeys;
            if (datumKeys.length === 0) {
                datumKeys.push([]);
            }

            let fullAggName = this.props.aggregatorName;
            const numInputs =
                this.props.aggregators[fullAggName]([])().numInputs || 0;
            if (numInputs !== 0) {
                fullAggName += ` of ${this.props.vals.slice(0, numInputs).join(', ')}`;
            }

            const data = traceKeys.map(traceKey => {
                const values = [];
                const labels = [];
                for (const datumKey of datumKeys) {
                    const val = parseFloat(
                        pivotData
                            .getAggregator(
                                transpose ? datumKey : traceKey,
                                transpose ? traceKey : datumKey
                            )
                            .value()
                    );
                    values.push(isFinite(val) ? val : null);
                    labels.push(datumKey.join('-') || ' ');
                }
                const trace = { name: traceKey.join('-') || fullAggName };
                if (traceOptions.type === 'pie') {
                    trace.values = values;
                    trace.labels = labels.length > 1 ? labels : [fullAggName];
                } else {
                    trace.x = transpose ? values : labels;
                    trace.y = transpose ? labels : values;
                }
                return Object.assign(trace, traceOptions);
            });

            let titleText = fullAggName;
            const hAxisTitle = transpose
                ? this.props.rows.join('-')
                : this.props.cols.join('-');
            const groupByTitle = transpose
                ? this.props.cols.join('-')
                : this.props.rows.join('-');
            if (hAxisTitle !== '') {
                titleText += ` vs ${hAxisTitle}`;
            }
            if (groupByTitle !== '') {
                titleText += ` by ${groupByTitle}`;
            }

            const layout = {
                title: titleText,
                hovermode: 'closest',
                /* eslint-disable no-magic-numbers */
                width: window.innerWidth / 1.5,
                height: window.innerHeight / 1.4 - 50,
                /* eslint-enable no-magic-numbers */
            };

            if (traceOptions.type === 'pie') {
                const columns = Math.ceil(Math.sqrt(data.length));
                const rows = Math.ceil(data.length / columns);
                layout.grid = { columns, rows };
                data.forEach((d, i) => {
                    d.domain = {
                        row: Math.floor(i / columns),
                        column: i - columns * Math.floor(i / columns),
                    };
                    if (data.length > 1) {
                        d.title = d.name;
                    }
                });
                if (data[0].labels.length === 1) {
                    layout.showlegend = false;
                }
            } else {
                layout.xaxis = {
                    title: transpose ? fullAggName : null,
                    automargin: true,
                };
                layout.yaxis = {
                    title: transpose ? null : fullAggName,
                    automargin: true,
                };
            }

            return (
                <PlotlyComponent
                    data={data}
                    layout={Object.assign(
                        layout,
                        layoutOptions,
                        this.props.plotlyOptions
                    )}
                    config={this.props.plotlyConfig}
                    onUpdate={this.props.onRendererUpdate}
                />
            );
        }
    }

    Renderer.defaultProps = {
        aggregators: aggregators,
        cols: [],
        rows: [],
        vals: [],
        aggregatorName: 'Count',
        sorters: {},
        valueFilter: {},
        rowOrder: 'key_a_to_z',
        colOrder: 'key_a_to_z',
        derivedAttributes: {},
        plotlyOptions: {},
        plotlyConfig: {},
    };

    Renderer.propTypes = {
        data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
            .isRequired,
        aggregatorName: PropTypes.string,
        cols: PropTypes.arrayOf(PropTypes.string),
        rows: PropTypes.arrayOf(PropTypes.string),
        vals: PropTypes.arrayOf(PropTypes.string),
        valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
        sorters: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.objectOf(PropTypes.func),
        ]),
        derivedAttributes: PropTypes.objectOf(PropTypes.func),
        rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
        colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
        plotlyOptions: PropTypes.object,
        plotlyConfig: PropTypes.object,
        onRendererUpdate: PropTypes.func,
    };

    return Renderer;
}

function makeScatterRenderer(PlotlyComponent) {
    class Renderer extends React.PureComponent {
        render() {
            const pivotData = new PivotData(this.props);
            const rowKeys = pivotData.getRowKeys();
            const colKeys = pivotData.getColKeys();
            if (rowKeys.length === 0) {
                rowKeys.push([]);
            }
            if (colKeys.length === 0) {
                colKeys.push([]);
            }

            const data = { x: [], y: [], text: [], type: 'scatter', mode: 'markers' };

            rowKeys.map(rowKey => {
                colKeys.map(colKey => {
                    const v = pivotData.getAggregator(rowKey, colKey).value();
                    if (v !== null) {
                        data.x.push(colKey.join('-'));
                        data.y.push(rowKey.join('-'));
                        data.text.push(v);
                    }
                });
            });

            const layout = {
                title: this.props.rows.join('-') + ' vs ' + this.props.cols.join('-'),
                hovermode: 'closest',
                /* eslint-disable no-magic-numbers */
                xaxis: { title: this.props.cols.join('-'), automargin: true },
                yaxis: { title: this.props.rows.join('-'), automargin: true },
                width: window.innerWidth / 1.5,
                height: window.innerHeight / 1.4 - 50,
                /* eslint-enable no-magic-numbers */
            };

            return (
                <PlotlyComponent
                    data={[data]}
                    layout={Object.assign(layout, this.props.plotlyOptions)}
                    config={this.props.plotlyConfig}
                    onUpdate={this.props.onRendererUpdate}
                />
            );
        }
    }

    Renderer.defaultProps = {
        aggregators: aggregators,
        cols: [],
        rows: [],
        vals: [],
        aggregatorName: 'Count',
        sorters: {},
        valueFilter: {},
        rowOrder: 'key_a_to_z',
        colOrder: 'key_a_to_z',
        derivedAttributes: {},
        plotlyOptions: {},
        plotlyConfig: {},
    };
    Renderer.propTypes = {
        data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
            .isRequired,
        aggregatorName: PropTypes.string,
        cols: PropTypes.arrayOf(PropTypes.string),
        rows: PropTypes.arrayOf(PropTypes.string),
        vals: PropTypes.arrayOf(PropTypes.string),
        valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
        sorters: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.objectOf(PropTypes.func),
        ]),
        derivedAttributes: PropTypes.objectOf(PropTypes.func),
        rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
        colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
        plotlyOptions: PropTypes.object,
        plotlyConfig: PropTypes.object,
        onRendererUpdate: PropTypes.func,
    };

    return Renderer;
}

export default function createPlotlyRenderers(PlotlyComponent) {
    return {
        'Grouped Column Chart': makeRendererChart(
            PlotlyComponent,
            { type: 'bar' },
            { barmode: 'group' }
        ),
        'Stacked Column Chart': makeRendererChart(
            PlotlyComponent,
            { type: 'bar' },
            { barmode: 'relative' }
        ),
        'Grouped Bar Chart': makeRendererChart(
            PlotlyComponent,
            { type: 'bar', orientation: 'h' },
            { barmode: 'group' },
            true
        ),
        'Stacked Bar Chart': makeRendererChart(
            PlotlyComponent,
            { type: 'bar', orientation: 'h' },
            { barmode: 'relative' },
            true
        ),
        'Line Chart': makeRendererChart(PlotlyComponent),
        'Dot Chart': makeRendererChart(PlotlyComponent, { mode: 'markers' }, {}, true),
        'Area Chart': makeRendererChart(PlotlyComponent, { stackgroup: 1 }),
        'Scatter Chart': makeScatterRenderer(PlotlyComponent),
        'Multiple Pie Chart': makeRendererChart(
            PlotlyComponent,
            { type: 'pie', scalegroup: 1, hoverinfo: 'label+value', textinfo: 'none' },
            {},
            true
        ),
    };
}


class DraggableAttribute extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false, filterText: '' };
    }

    toggleValue(value) {
        if (value in this.props.valueFilter) {
            this.props.removeValuesFromFilter(this.props.name, [value]);
        } else {
            this.props.addValuesToFilter(this.props.name, [value]);
        }
    }

    matchesFilter(x) {
        return x
            .toLowerCase()
            .trim()
            .includes(this.state.filterText.toLowerCase().trim());
    }

    selectOnly(e, value) {
        e.stopPropagation();
        this.props.setValuesInFilter(
            this.props.name,
            Object.keys(this.props.attrValues).filter(y => y !== value)
        );
    }

    getFilterBox() {
        const showMenu =
            Object.keys(this.props.attrValues).length < this.props.menuLimit;

        const values = Object.keys(this.props.attrValues);
        const shown = values
            .filter(this.matchesFilter.bind(this))
            .sort(this.props.sorter);

        return (
            <Draggable handle=".pvtDragHandle">
                <div
                    className="pvtFilterBox"
                    style={{
                        display: 'block',
                        cursor: 'initial',
                        zIndex: this.props.zIndex
                    }}
                    onClick={() => this.props.moveFilterBoxToTop(this.props.name)}
                >
                    <a onClick={() => this.setState({ open: false })} className="pvtCloseX">
                        ×
            </a>
                    <span className="pvtDragHandle">☰</span>
                    <h4>{this.props.name}</h4>

                    {showMenu || <p>(too many values to show)</p>}

                    {showMenu && (
                        <p>
                            <input
                                type="text"
                                placeholder="Filter values"
                                className="pvtSearch"
                                value={this.state.filterText}
                                onChange={e =>
                                    this.setState({
                                        filterText: e.target.value,
                                    })
                                }
                            />
                            <br />
                            <a
                                role="button"
                                className="pvtButton"
                                onClick={() =>
                                    this.props.removeValuesFromFilter(
                                        this.props.name,
                                        Object.keys(this.props.attrValues).filter(
                                            this.matchesFilter.bind(this)
                                        )
                                    )
                                }
                            >
                                Select {values.length === shown.length ? 'All' : shown.length}
                            </a>{' '}
                            <a
                                role="button"
                                className="pvtButton"
                                onClick={() =>
                                    this.props.addValuesToFilter(
                                        this.props.name,
                                        Object.keys(this.props.attrValues).filter(
                                            this.matchesFilter.bind(this)
                                        )
                                    )
                                }
                            >
                                Deselect {values.length === shown.length ? 'All' : shown.length}
                            </a>
                        </p>
                    )}

                    {showMenu && (
                        <div className="pvtCheckContainer">
                            {shown.map(x => (
                                <p
                                    key={x}
                                    onClick={() => this.toggleValue(x)}
                                    className={x in this.props.valueFilter ? '' : 'selected'}
                                >
                                    <a className="pvtOnly" onClick={e => this.selectOnly(e, x)}>
                                        only
                    </a>
                                    <a className="pvtOnlySpacer">&nbsp;</a>

                                    {x === '' ? <em>null</em> : x}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </Draggable>
        );
    }

    toggleFilterBox() {
        this.setState({ open: !this.state.open });
        this.props.moveFilterBoxToTop(this.props.name);
    }

    render() {
        const filtered =
            Object.keys(this.props.valueFilter).length !== 0
                ? 'pvtFilteredAttribute'
                : '';
        return (
            <li data-id={this.props.name}>
                <span className={'pvtAttr ' + filtered}>
                    {this.props.name}
                    <span
                        className="pvtTriangle"
                        onClick={this.toggleFilterBox.bind(this)}
                    >
                        {' '}
                        ▾
            </span>
                </span>

                {this.state.open ? this.getFilterBox() : null}
            </li>
        );
    }
}

DraggableAttribute.defaultProps = {
    valueFilter: {},
};

DraggableAttribute.propTypes = {
    name: PropTypes.string.isRequired,
    addValuesToFilter: PropTypes.func.isRequired,
    removeValuesFromFilter: PropTypes.func.isRequired,
    attrValues: PropTypes.objectOf(PropTypes.number).isRequired,
    valueFilter: PropTypes.objectOf(PropTypes.bool),
    moveFilterBoxToTop: PropTypes.func.isRequired,
    sorter: PropTypes.func.isRequired,
    menuLimit: PropTypes.number,
    zIndex: PropTypes.number,
};

export class Dropdown extends React.PureComponent {
    render() {
        return (
            <div className="pvtDropdown" style={{ zIndex: this.props.zIndex }}>
                <div
                    onClick={e => {
                        e.stopPropagation();
                        this.props.toggle();
                    }}
                    className={
                        'pvtDropdownValue pvtDropdownCurrent ' +
                        (this.props.open ? 'pvtDropdownCurrentOpen' : '')
                    }
                    role="button"
                >
                    <div className="pvtDropdownIcon">{this.props.open ? '×' : '▾'}</div>
                    {this.props.current || <span>&nbsp;</span>}
                </div>

                {this.props.open && (
                    <div className="pvtDropdownMenu">
                        {this.props.values.map(r => (
                            <div
                                key={r}
                                role="button"
                                onClick={e => {
                                    e.stopPropagation();
                                    if (this.props.current === r) {
                                        this.props.toggle();
                                    } else {
                                        this.props.setValue(r);
                                    }
                                }}
                                className={
                                    'pvtDropdownValue ' +
                                    (r === this.props.current ? 'pvtDropdownActiveValue' : '')
                                }
                            >
                                {r}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

class PivotTable extends React.PureComponent {
    render() {
        const Renderer = this.props.renderers[
            this.props.rendererName in this.props.renderers
                ? this.props.rendererName
                : Object.keys(this.props.renderers)[0]
        ];
        return <Renderer {...this.props} />;
    }
}

PivotTable.propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
        .isRequired,
    aggregatorName: PropTypes.string,
    cols: PropTypes.arrayOf(PropTypes.string),
    rows: PropTypes.arrayOf(PropTypes.string),
    vals: PropTypes.arrayOf(PropTypes.string),
    valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
    sorters: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.objectOf(PropTypes.func),
    ]),
    derivedAttributes: PropTypes.objectOf(PropTypes.func),
    rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
    colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
    rendererName: PropTypes.string,
    renderers: PropTypes.objectOf(PropTypes.func),
};

PivotTable.defaultProps = {
    aggregators: aggregators,
    cols: [],
    rows: [],
    vals: [],
    aggregatorName: 'Count',
    sorters: {},
    valueFilter: {},
    rowOrder: 'key_a_to_z',
    colOrder: 'key_a_to_z',
    derivedAttributes: {},
    rendererName: 'Table',
    renderers: {
        Table: makeRenderer(),
        'Table Heatmap': makeRenderer({ heatmapMode: 'full' }),
        'Table Col Heatmap': makeRenderer({ heatmapMode: 'col' }),
        'Table Row Heatmap': makeRenderer({ heatmapMode: 'row' }),
        'Exportable TSV': TSVExportRenderer,
    }
};


class AnterosPivotTable extends React.PureComponent {
    constructor(props) {
        super(props);
        this.attrValues = undefined;
        this.state = {
            unusedOrder: [],
            zIndices: {},
            maxZIndex: 1000,
            openDropdown: false,
        };
        autoBind(this);
    }

    componentWillMount() {

        let data = [];
        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            data = this.props.dataSource.getData();
        } else {
            data = this.props.dataSource;
        }
        this.materializeInput(data);
    }

    componentWillUpdate(nextProps) {
        let data = [];
        if ((nextProps.dataSource instanceof AnterosRemoteDatasource) || (nextProps.dataSource instanceof AnterosLocalDatasource)) {
            data = nextProps.dataSource.getData();
        } else {
            data = nextProps.dataSource;
        }
        this.materializeInput(data);
    }

    materializeInput(nextData) {
        if (this.data === nextData || !nextData || nextData.length===0) {
            return;
        }
        this.data = nextData;
        const attrValues = {};
        const materializedInput = [];
        let recordsProcessed = 0;
        PivotData.forEachRecord(this.data, this.props.derivedAttributes, function (
            record
        ) {
            materializedInput.push(record);
            for (const attr of Object.keys(record)) {
                if (!(attr in attrValues)) {
                    attrValues[attr] = {};
                    if (recordsProcessed > 0) {
                        attrValues[attr].null = recordsProcessed;
                    }
                }
            }
            for (const attr in attrValues) {
                const value = attr in record ? record[attr] : 'null';
                if (!(value in attrValues[attr])) {
                    attrValues[attr][value] = 0;
                }
                attrValues[attr][value]++;
            }
            recordsProcessed++;
        });

        this.materializedInput = materializedInput;
        this.attrValues = attrValues;
    }

    sendPropUpdate(command) {
        this.props.onChange(update(this.props, command));
    }

    propUpdater(key) {
        return value => this.sendPropUpdate({ [key]: { $set: value } });
    }

    setValuesInFilter(attribute, values) {
        this.sendPropUpdate({
            valueFilter: {
                [attribute]: {
                    $set: values.reduce((r, v) => {
                        r[v] = true;
                        return r;
                    }, {}),
                },
            },
        });
    }

    addValuesToFilter(attribute, values) {
        if (attribute in this.props.valueFilter) {
            this.sendPropUpdate({
                valueFilter: {
                    [attribute]: values.reduce((r, v) => {
                        r[v] = { $set: true };
                        return r;
                    }, {}),
                },
            });
        } else {
            this.setValuesInFilter(attribute, values);
        }
    }

    removeValuesFromFilter(attribute, values) {
        this.sendPropUpdate({
            valueFilter: { [attribute]: { $unset: values } },
        });
    }

    moveFilterBoxToTop(attribute) {
        this.setState(
            update(this.state, {
                maxZIndex: { $set: this.state.maxZIndex + 1 },
                zIndices: { [attribute]: { $set: this.state.maxZIndex + 1 } },
            })
        );
    }

    isOpen(dropdown) {
        return this.state.openDropdown === dropdown;
    }

    makeDnDCell(items, onChange, classes) {
        if (items && items.length===0)
            return;

        return (
            <ReactSortable
                options={{
                    group: 'shared',
                    ghostClass: 'pvtPlaceholder',
                    filter: '.pvtFilterBox',
                    preventOnFilter: false,
                }}
                tag="td"
                className={classes}
                onChange={onChange}
            >
                {items.map(x => (
                    <DraggableAttribute
                        name={x}
                        key={x}
                        attrValues={this.attrValues[x]}
                        valueFilter={this.props.valueFilter[x] || {}}
                        sorter={getSort(this.props.sorters, x)}
                        menuLimit={this.props.menuLimit}
                        setValuesInFilter={this.setValuesInFilter.bind(this)}
                        addValuesToFilter={this.addValuesToFilter.bind(this)}
                        moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
                        removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
                        zIndex={this.state.zIndices[x] || this.state.maxZIndex}
                    />
                ))}
            </ReactSortable>
        );
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

    render() {
        if (!this.attrValues){
            return (<div></div>);
        }

        let rendererOptions = this.props.rendererOptions;
        if (this.props.onClickValue) {
            rendererOptions = { ...rendererOptions, table: { clickCallback: this.props.onClickValue } }
        }
        let rowOrder = "key_a_to_z";
        if (this.props.rowOrder === 'desc') {
            rowOrder = "key_z_to_a";
        }
        let colOrder = "key_a_to_z";
        if (this.props.colOrder === 'desc') {
            colOrder = "key_z_to_a";
        }

        let data = [];
        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            data = this.props.dataSource.getData();
        } else {
            data = this.props.dataSource;
        }

        let newProps = {...this.props,
            data,
            labels: this.buildFieldLabels(),
            aggregatorsValues: this.buildAggregators(),
            rows: this.buildRows(),
            cols: this.buildCols(),
            vals: this.buildVals(),
            sorters: this.buildSorters(),
            derivedAttributes: this.buildDerivers(),
            hiddenAttributes: this.buildHiddenAttributes()};


        const numValsAllowed =
        newProps.aggregators[newProps.aggregatorName]([])().numInputs || 0;

        const rendererName =
        newProps.rendererName in newProps.renderers
                ? newProps.rendererName
                : Object.keys(newProps.renderers)[0];

        const rendererCell = (
            <td className="pvtRenderers">
                <Dropdown
                    current={rendererName}
                    values={Object.keys(newProps.renderers)}
                    open={this.isOpen('renderer')}
                    zIndex={this.isOpen('renderer') ? this.state.maxZIndex + 1 : 1}
                    toggle={() =>
                        this.setState({
                            openDropdown: this.isOpen('renderer') ? false : 'renderer',
                        })
                    }
                    setValue={this.propUpdater('rendererName')}
                />
            </td>
        );

        const sortIcons = {
            key_a_to_z: {
                rowSymbol: '↕',
                colSymbol: '↔',
                next: 'value_a_to_z',
            },
            value_a_to_z: {
                rowSymbol: '↓',
                colSymbol: '→',
                next: 'value_z_to_a',
            },
            value_z_to_a: { rowSymbol: '↑', colSymbol: '←', next: 'key_a_to_z' },
        };

        const aggregatorCell = (
            <td className="pvtVals">
                <Dropdown
                    current={newProps.aggregatorName}
                    values={Object.keys(newProps.aggregators)}
                    open={this.isOpen('aggregators')}
                    zIndex={this.isOpen('aggregators') ? this.state.maxZIndex + 1 : 1}
                    toggle={() =>
                        this.setState({
                            openDropdown: this.isOpen('aggregators') ? false : 'aggregators',
                        })
                    }
                    setValue={this.propUpdater('aggregatorName')}
                />
                <a
                    role="button"
                    className="pvtRowOrder"
                    onClick={() =>
                        this.propUpdater('rowOrder')(sortIcons[newProps.rowOrder].next)
                    }
                >
                    {sortIcons[newProps.rowOrder].rowSymbol}
                </a>
                <a
                    role="button"
                    className="pvtColOrder"
                    onClick={() =>
                        this.propUpdater('colOrder')(sortIcons[newProps.colOrder].next)
                    }
                >
                    {sortIcons[newProps.colOrder].colSymbol}
                </a>
                {numValsAllowed > 0 && <br />}
                {new Array(numValsAllowed).fill().map((n, i) => [
                    <Dropdown
                        key={i}
                        current={newProps.vals[i]}
                        values={Object.keys(this.attrValues).filter(
                            e =>
                                !newProps.hiddenAttributes.includes(e) &&
                                !newProps.hiddenFromAggregators.includes(e)
                        )}
                        open={this.isOpen(`val${i}`)}
                        zIndex={this.isOpen(`val${i}`) ? this.state.maxZIndex + 1 : 1}
                        toggle={() =>
                            this.setState({
                                openDropdown: this.isOpen(`val${i}`) ? false : `val${i}`,
                            })
                        }
                        setValue={value =>
                            this.sendPropUpdate({
                                vals: { $splice: [[i, 1, value]] },
                            })
                        }
                    />,
                    i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
                ])}
            </td>
        );

        const unusedAttrs = Object.keys(this.attrValues)
            .filter(
                e =>
                    !newProps.rows.includes(e) &&
                    !newProps.cols.includes(e) &&
                    !newProps.hiddenAttributes.includes(e) &&
                    !newProps.hiddenFromDragDrop.includes(e)
            )
            .sort(sortAs(this.state.unusedOrder));

        const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
        const horizUnused = unusedLength < newProps.unusedOrientationCutoff;

        const unusedAttrsCell = this.makeDnDCell(
            unusedAttrs,
            order => this.setState({ unusedOrder: order }),
            `pvtAxisContainer pvtUnused ${
            horizUnused ? 'pvtHorizList' : 'pvtVertList'
            }`
        );

        const colAttrs = newProps.cols.filter(
            e =>
                !newProps.hiddenAttributes.includes(e) &&
                !newProps.hiddenFromDragDrop.includes(e)
        );

        const colAttrsCell = this.makeDnDCell(
            colAttrs,
            this.propUpdater('cols'),
            'pvtAxisContainer pvtHorizList pvtCols'
        );

        const rowAttrs = newProps.rows.filter(
            e =>
                !newProps.hiddenAttributes.includes(e) &&
                !newProps.hiddenFromDragDrop.includes(e)
        );
        const rowAttrsCell = this.makeDnDCell(
            rowAttrs,
            this.propUpdater('rows'),
            'pvtAxisContainer pvtVertList pvtRows'
        );
        const outputCell = (
            <td className="pvtOutput">
                <PivotTable
                    {...update(newProps, {
                        data: { $set: this.materializedInput },
                    })}
                />
            </td>
        );

        if (horizUnused) {
            return (
                <table className="pvtUi">
                    <tbody onClick={() => this.setState({ openDropdown: false })}>
                        <tr>
                            {rendererCell}
                            {unusedAttrsCell}
                        </tr>
                        <tr>
                            {aggregatorCell}
                            {colAttrsCell}
                        </tr>
                        <tr>
                            {rowAttrsCell}
                            {outputCell}
                        </tr>
                    </tbody>
                </table>
            );
        }

        return (
            <table className="pvtUi">
                <tbody onClick={() => this.setState({ openDropdown: false })}>
                    <tr>
                        {rendererCell}
                        {aggregatorCell}
                        {colAttrsCell}
                    </tr>
                    <tr>
                        {unusedAttrsCell}
                        {rowAttrsCell}
                        {outputCell}
                    </tr>
                </tbody>
            </table>
        );
    }
}

AnterosPivotTable.propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
        .isRequired,
    aggregatorName: PropTypes.string,
    cols: PropTypes.arrayOf(PropTypes.string),
    rows: PropTypes.arrayOf(PropTypes.string),
    vals: PropTypes.arrayOf(PropTypes.string),
    valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
    sorters: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.objectOf(PropTypes.func),
    ]),
    derivedAttributes: PropTypes.objectOf(PropTypes.func),
    rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
    colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
    rendererName: PropTypes.string,
    renderers: PropTypes.objectOf(PropTypes.func),
    onChange: PropTypes.func.isRequired,
    hiddenAttributes: PropTypes.arrayOf(PropTypes.string),
    hiddenFromAggregators: PropTypes.arrayOf(PropTypes.string),
    hiddenFromDragDrop: PropTypes.arrayOf(PropTypes.string),
    unusedOrientationCutoff: PropTypes.number,
    menuLimit: PropTypes.number
};

AnterosPivotTable.defaultProps = {
    aggregators: aggregators,
    cols: [],
    rows: [],
    vals: [],
    aggregatorName: 'Count',
    sorters: {},
    valueFilter: {},
    rowOrder: 'key_a_to_z',
    colOrder: 'key_a_to_z',
    derivedAttributes: {},
    rendererName: 'Table',
    renderers: {
        Table: makeRenderer(),
        'Table Heatmap': makeRenderer({ heatmapMode: 'full' }),
        'Table Col Heatmap': makeRenderer({ heatmapMode: 'col' }),
        'Table Row Heatmap': makeRenderer({ heatmapMode: 'row' }),
        'Exportable TSV': TSVExportRenderer,
    },
    hiddenAttributes: [],
    hiddenFromAggregators: [],
    hiddenFromDragDrop: [],
    unusedOrientationCutoff: 85,
    menuLimit: 500,
};


class AnterosPivotTableField extends Component {

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

export {AnterosPivotTable, AnterosPivotTableField};