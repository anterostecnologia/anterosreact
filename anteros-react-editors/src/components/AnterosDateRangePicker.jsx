import React, {Component} from 'react';
import 'bootstrap-daterangepicker'
import 'jquery-mask-plugin';
import lodash from "lodash";
import {buildGridClassNames, columnProps} from "anteros-react-layout";
import {Anteros, AnterosDateUtils, AnterosUtils} from "anteros-react-core";
import PropTypes from 'prop-types';

export default class AnterosDateRangePicker extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyPress = this
            .onKeyPress
            .bind(this);
        this.onKeyDown = this
            .onKeyDown
            .bind(this);
        this.open = false;
        this.idCalendar = lodash.uniqueId("drPickerCal");
        this.state = {
            value: this.props.value
        };
        this.handleChange = this
            .handleChange
            .bind(this);
        this.picker = undefined;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});
    }

    componentDidMount() {
        let _this = this;
        var start;
        var end;
        if (this.props.value) {
            let sp = this
                .props
                .value
                .split(' - ');
            if (sp && sp.length == 2) {
                start = moment(sp[0], this.props.format);
                end = moment(sp[1], this.props.format);
            }
        }

        function cb(start, end) {
            if (start && end) {
                _this.setState({
                    value: moment(start).format(_this.props.format) + ' - ' + moment(end).format(_this.props.format)
                });
            }
            _this
                .input
                .focus();
        }

        this.picker = $(this.divInput).daterangepicker({
            startDate: start,
            endDate: end,
            "ranges": {
                'Hoje': [
                    moment(), moment()
                ],
                'Ontem': [
                    moment().subtract(1, 'days'),
                    moment().subtract(1, 'days')
                ],
                'Últimos 7 dias': [
                    moment().subtract(6, 'days'),
                    moment()
                ],
                'Últimos 30 dias': [
                    moment().subtract(29, 'days'),
                    moment()
                ],
                'Este mês': [
                    moment().startOf('month'),
                    moment().endOf('month')
                ],
                'Último mês': [
                    moment()
                        .subtract(1, 'month')
                        .startOf('month'),
                    moment()
                        .subtract(1, 'month')
                        .endOf('month')
                ]
            },
            "locale": {
                "format": this.props.format,
                "separator": " - ",
                "applyLabel": "Aplicar",
                "cancelLabel": "Cancelar",
                "fromLabel": "De",
                "toLabel": "Até",
                "customRangeLabel": "Selecionar",
                "weekLabel": "S",
                "daysOfWeek": [
                    "Do",
                    "Se",
                    "Te",
                    "Qu",
                    "Qi",
                    "Se",
                    "Sa"
                ],
                "monthNames": [
                    "Janeiro",
                    "Fevereiro",
                    "Março",
                    "Abril",
                    "Maio",
                    "Junho",
                    "Julho",
                    "Agosto",
                    "Setembro",
                    "Outubro",
                    "Novembro",
                    "Dezembro"
                ],
                "firstDay": 1
            }
        }, cb);

        cb(start, end);

        $(this.divInput).on("hide.daterangepicker", function (e) {
            _this.open = false;
        });
        $(this.divInput).on("show.daterangepicker", function (e) {
            _this.open = true;
        });

        $(this.divInput).on('apply.daterangepicker', function (ev, picker) {
            let value = picker
                .startDate
                .format(_this.props.format) + ' - ' + picker
                .endDate
                .format(_this.props.format);
            _this.setState({value: value});
            if (_this.props.onChange) {
                _this
                    .props
                    .onChange(ev, value, picker.startDate.format(Anteros.dataSourceDatetimeFormat), picker.endDate.format(Anteros.dataSourceDatetimeFormat));
            }
        });

        $(this.input).mask('00/00/0000 - 00/00/0000', {placeholder: this.props.placeholder});
    }

    onKeyDown(event) {
        if (event.keyCode == 116) {
            if (!this.open) 
                $(this.divInput).data('daterangepicker').show();
            else 
                $(this.divInput)
                    .data('daterangepicker')
                    .hide();
            this
                .input
                .focus();
        }

        if (event.keyCode == 8) {
            $(this.divInput)
                .data('daterangepicker')
                .hide();
        }
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        if (this.props.onChange) {
            let values = event
                .target
                .value
                .split(' - ');
            let d1 = AnterosDateUtils.parseDateWithFormat(values[0], this.props.format);
            let d2 = AnterosDateUtils.parseDateWithFormat(values[1], this.props.format);
            if (d1 > 0 && d2 > 0) {
                this
                    .props
                    .onChange(event, event.target.value, AnterosDateUtils.formatDate(d1, Anteros.dataSourceDatetimeFormat), AnterosDateUtils.formatDate(d2, Anteros.dataSourceDatetimeFormat));
            }
        }
    }

    onKeyPress(event) {
        $(this.divInput)
            .data('daterangepicker')
            .hide();
    }

    render() {
        const colClasses = buildGridClassNames(this.props, false, []);
        let icon = "fa fa-calendar";
        if (this.icon) {
            icon = this.props.icon;
        }
        if (this.props.id) {
            this.idCalendar = this.props.id;
        }
        let className = AnterosUtils.buildClassNames("input-group date", (this.props.className
            ? this.props.className
            : ""), colClasses);

        let classNameAddOn = AnterosUtils.buildClassNames("input-group-addon", (this.props.primary || this.props.fullPrimary
            ? "btn btn-primary"
            : ""), (this.props.success || this.props.fullSucces
            ? "btn btn-success"
            : ""), (this.props.info || this.props.fullInfo
            ? "btn btn-info"
            : ""), (this.props.danger || this.props.fullDanger
            ? "btn btn-danger"
            : ""), (this.props.warning || this.props.fullWarning
            ? "btn btn-warning"
            : ""), (this.props.secondary || this.props.fullSecondary
            ? "btn btn-secondary"
            : ""), (this.props.default || this.props.fullDefault
            ? ""
            : ""));

        let classNameInput = AnterosUtils.buildClassNames("form-control", (this.props.fullPrimary
            ? "btn-primary"
            : ""), (this.props.fullSucces
            ? "btn-success"
            : ""), (this.props.fullInfo
            ? "btn-info"
            : ""), (this.props.fullDanger
            ? "btn-danger"
            : ""), (this.props.fullWarning
            ? "btn-warning"
            : ""), (this.props.fullSecondary
            ? "btn-secondary"
            : ""), (this.props.fullDefault
            ? ""
            : ""));

        return (
            <div
                className={className}
                id={this.props.id}
                style={{
                ...this.props.style,
                width: this.props.width
            }}
                ref={ref => this.divInput = ref}>
                <input
                    disabled={(this.props.disabled
                    ? true
                    : false)}
                    id={this.idCalendar}
                    ref={ref => this.input = ref}
                    type="text"
                    value={this.state.value}
                    className={classNameInput}
                    onChange={this.handleChange}
                    style={{
                    margin: 0
                }}
                    onKeyPress={this.onKeyPress}
                    onKeyDown={this.onKeyDown}/>
                <div className={classNameAddOn} style={{margin: 0, height: '38px', width:'38px'}} >
                    <span><i className={icon}/><img src={this.props.image}/></span>
                </div>
            </div>
        );
    }
}

AnterosDateRangePicker.propTypes = {
    placeHolder: PropTypes.string,
    format: PropTypes.string,
    value: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    primary: PropTypes.bool,
    success: PropTypes.bool,
    info: PropTypes.bool,
    danger: PropTypes.bool,
    warning: PropTypes.bool,
    secondary: PropTypes.bool,
    default: PropTypes.bool,
    fullPrimary: PropTypes.bool,
    fullSuccess: PropTypes.bool,
    fullInfo: PropTypes.bool,
    fullDanger: PropTypes.bool,
    fullWarning: PropTypes.bool,
    fullSecondary: PropTypes.bool,
    style: PropTypes.object
};

AnterosDateRangePicker.defaultProps = {
    placeHolder: '',
    format: 'DD/MM/YYYY',
    value: '',
    primary: true
}