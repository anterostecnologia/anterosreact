import React, { Component } from 'react';
import lodash from 'lodash';
import { AnterosError, AnterosUtils, AnterosDateUtils, AnterosStringMask } from "anteros-react-core";
import PropTypes from 'prop-types';

export default class AnterosTable extends Component {
    constructor(props) {
        super(props);
        this.validateColumns = this
            .validateColumns
            .bind(this);
        this.renderImage = this
            .renderImage
            .bind(this);
        this.renderNumber = this
            .renderNumber
            .bind(this);
        this.renderBoolean = this
            .renderBoolean
            .bind(this);
        this.renderDate = this
            .renderDate
            .bind(this);
        this.renderDateTime = this
            .renderDateTime
            .bind(this);
        this.renderTime = this
            .renderTime
            .bind(this);
        this.renderFone = this
            .renderFone
            .bind(this);
        this.renderPlaca = this
            .renderPlaca
            .bind(this);
        this.renderCpf = this
            .renderCpf
            .bind(this);
        this.renderCnpj = this
            .renderCnpj
            .bind(this);
        this.renderCep = this
            .renderCep
            .bind(this);
        this.renderBoolean = this.renderBoolean.bind(this);
        this.validateColumns();
    }

    validateColumns() {
        let arrChildren = React
            .Children
            .toArray(this.props.children);
        if (arrChildren.length == 0) {
            throw new AnterosError("Informe ao menos uma coluna para tabela " + this.props.id + ".");
        }

        arrChildren
            .forEach(function (child) {
                if (child.type && !(child.type.componentName === 'AnterosTableColumn')) {
                    throw new AnterosError("Somente AnterosTableColumn podem ser informados como filhos de AnterosTable.");
                }
            });
    }

    renderDate(column, value, record) {
        if (!column)
            return value;
        return AnterosDateUtils.formatDate(value, this.props.dateFormat);
    }

    renderDateTime(column, value, record) {
        if (!column)
            return value;
        return AnterosDateUtils.formatDate(value, this.props.dateFormat + " " + this.props.timeFormat);
    }

    renderTime(column, value, record) {
        if (!column)
            return value;
        return AnterosDateUtils.formatDate(value, this.props.timeFormat);
    }

    renderBoolean(column, value, record) {
        if (!column)
            return value;
        let newData = value;
        if (value === true) {
            newData = 'Sim';
        } else if (value === false) {
            newData = 'Não';
        }
        return newData;
    }

    renderNumber(column, value, record) {
        if (!column || !column.props.maskFormatNumber)
            return value;
        return AnterosUtils.formatNumber(value, column.props.maskFormatNumber);
    }

    renderFone(column, value, record) {
        if (!column)
            return value;
        if (!value)
            return value;
        let _mask = new AnterosStringMask("(99) 99999-9999");
        return _mask.apply(value);
    }

    renderPlaca(column, value, record) {
        if (!column)
            return value;
        if (!value)
            return value;
        let _mask = new AnterosStringMask('SSS-AAAAA');
        return _mask.apply(value);
    }

    renderCpf(column, value, record) {
        if (!column)
            return value;
        if (!value)
            return value;
        let _mask = new AnterosStringMask('999.999.999-99');
        return _mask.apply(value);
    }

    renderCnpj(column, value, record) {
        if (!column)
            return value;
        if (!value)
            return value;
        let _mask = new AnterosStringMask('99.999.999/9999-99');
        return _mask.apply(value);
    }

    renderCep(column, value, record) {
        if (!column)
            return value;
        if (!value)
            return value;
        let _mask = new AnterosStringMask('99999-999');
        return _mask.apply(value);
    }

    renderImage(column, value, record) {
        let width,
            height;
        let classNameImage;
        if (column) {
            if (column.props.imageCircle) {
                classNameImage = "img-circle";
            }
            width = column.props.imageWidth;
            height = column.props.imageHeight;
        }
        if (!value)
            return value;

        let imgSrc = value;
        if (this.isBase64(value)) {
            if (this.isUrl(atob(value))) {
                imgSrc = atob(value);
            } else {
                imgSrc = 'data:image;base64,' + value;
            }
        }
        return <img className={classNameImage} src={imgSrc} height={height} width={width} />;
    }

    isUrl(string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}

    render() {
        let idTable = this.idTable;
        if (this.props.id) {
            idTable = this.props.id;
        }
        let className = "table display nowrap";
        if (this.props.className) {
            className = this.props.className;
        } else {
            if (this.props.showBorder) {
                className += " table-bordered";
            }
            if (this.props.showStripedRows) {
                className += " table-striped";
            }
            if (this.props.showHover) {
                className += " table-hover";
            }
        }

        className += " table-primary";
        let classNameHeader;
        if (this.props.showBorder) {
            if (this.props.success) {
                className += " color-bordered-table success-bordered-table";
            } else if (this.props.warning) {
                className += " color-bordered-table warning-bordered-table";
            } else if (this.props.info) {
                className += " color-bordered-table info-bordered-table";
            } else if (this.props.primary) {
                className += " color-bordered-table primary-bordered-table";
            } else if (this.props.danger) {
                className += " color-bordered-table danger-bordered-table";
            } else if (this.props.inverse) {
                className += " color-bordered-table inverse-bordered-table";
            }
        } else {
            if (this.props.success) {
                classNameHeader = " table-success";
            } else if (this.props.warning) {
                classNameHeader = " table-warning";
            } else if (this.props.info) {
                classNameHeader = " table-info";
            } else if (this.props.primary) {
                classNameHeader = " table-primary";
            } else if (this.props.danger) {
                classNameHeader = " table-danger";
            } else if (this.props.inverse) {
                classNameHeader = " table-inverse";
            }
        }

        let _this = this;

        return (
            <div
                className="table-responsive"
                tabIndex={this.props.tabIndex}
                ref={ref => this.divTable = ref}
                style={{
                    borderColor: "silver",
                    border: "1px",
                    width: "100%",
                    height: "100%"
                }}>
                <table
                    ref={ref => this.table = ref}
                    id={idTable}
                    className={className}
                    cellSpacing="0">
                    <thead>
                        <tr className={classNameHeader}>
                            {this
                                .props
                                .children
                                .map((column, i) => {
                                    let align = column.props.headerAlign;
                                    if (column.props.headerAlignCenter) {
                                        align = "center";
                                    } else if (column.props.headerAlignRight) {
                                        align = "right";
                                    }
                                    return (
                                        <th
                                            key={i}
                                            onClick={(column.onClickHeaderColumn)}
                                            data-column={column}
                                            style={{
                                                textAlign: align
                                            }}>{column.props.title}</th>
                                    );
                                })}
                        </tr>
                    </thead>
                    <tbody>
                        {_this
                            .props
                            .dataSource
                            .map((record, i) => {
                                return (
                                    <tr key={i}>{_this
                                        .props
                                        .children
                                        .map((column, j) => {
                                            let align = column.props.textAlign;
                                            if (column.props.textAlignCenter) {
                                                align = "center";
                                            } else if (column.props.textAlignRight) {
                                                align = "right";
                                            }
                                            let render = column.props.render;
                                            if (render == undefined) {
                                                if (column.props.dataType == "number") {
                                                    render = _this.renderNumber;
                                                } else if (column.props.dataType == "date") {
                                                    render = _this.renderDate;
                                                } else if (column.props.dataType == "date_time") {
                                                    render = _this.renderDateTime;
                                                } else if (column.props.dataType == "time") {
                                                    render = _this.renderTime;
                                                } else if (column.props.dataType == "image") {
                                                    render = _this.renderImage;
                                                } else if (column.props.dataType == "fone") {
                                                    render = _this.renderFone;
                                                } else if (column.props.dataType == "placa") {
                                                    render = _this.renderPlaca;
                                                } else if (column.props.dataType == "cpf") {
                                                    render = _this.renderCpf;
                                                } else if (column.props.dataType == "cnpj") {
                                                    render = _this.renderCnpj;
                                                } else if (column.props.dataType == "cep") {
                                                    render = _this.renderCep;
                                                } else if (column.props.dataType == "boolean") {
                                                    render = _this.renderBoolean;
                                                }
                                            }
                                            let classNameCell;
                                            if (column.props.success) {
                                                classNameCell = "bg-success";
                                            } else if (column.props.warning) {
                                                classNameCell = "bg-warning";
                                            } else if (column.props.info) {
                                                classNameCell = "bg-info";
                                            } else if (column.props.primary) {
                                                classNameCell = "bg-primary";
                                            } else if (column.props.danger) {
                                                classNameCell = "bg-danger";
                                            } else if (column.props.inverse) {
                                                classNameCell = "bg-inverse";
                                            }
                                            return (
                                                <td
                                                    key={j}
                                                    className={classNameCell}
                                                    onClick={(column.onClickCellRow)}
                                                    data-column={column}
                                                    style={{
                                                        textAlign: align
                                                    }}>{render
                                                        ? render(column, record[column.props.dataField], record)
                                                        : record[column.props.dataField]}</td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

        )
    }
}
AnterosTable.propTypes = {
    id: PropTypes.string,
    dataSource: PropTypes.array.isRequired,
    decimalSeparator: PropTypes.string.isRequired,
    thousandsSeparator: PropTypes.string.isRequired,
    height: PropTypes.string,
    width: PropTypes.string,
    showBorder: PropTypes.bool.isRequired,
    showStripedRows: PropTypes.bool.isRequired,
    showHover: PropTypes.bool.isRequired,
    dateFormat: PropTypes
        .oneOf([
            'DD/MM/YYYY',
            'DD-MM-YYYY',
            'MM/DD/YYYY',
            'MM-DD-YYYY',
            'YYYY/MM/DD',
            'YYYY-MM-DD'
        ])
        .isRequired,
    timeFormat: PropTypes
        .oneOf(['HH:mm:ss', 'HH:mm', 'hh:mm:ss', 'hh:mm'])
        .isRequired,
    tabIndex: PropTypes.number.isRequired,
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    danger: PropTypes.bool,
    primary: PropTypes.bool,
    inverse: PropTypes.bool
}

AnterosTable.defaultProps = {
    showBorder: false,
    showHover: false,
    showStripedRows: false,
    height: "100%",
    width: "100%",
    tabIndex: -1,
    decimalSeparator: ".",
    thousandsSeparator: ",",
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss'
}

export class AnterosTableColumn extends Component {
    constructor(props) {
        super(props);
        this.idTableColumn = lodash.uniqueId("column");
    }

    render() {
        return (null);
    }
}

AnterosTableColumn.propTypes = {
    title: PropTypes.string.isRequired,
    headerAlign: PropTypes.oneOf(['left', 'center', 'right']),
    headerAlignRight: PropTypes.bool,
    headerAlignCenter: PropTypes.bool,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    textAlignRight: PropTypes.bool,
    textAlignCenter: PropTypes.bool,
    render: PropTypes.func,
    dataField: PropTypes.string.isRequired,
    dataType: PropTypes
        .oneOf([
            'number',
            'date',
            'date_time',
            'time',
            'boolean',
            'string',
            'image',
            'cep',
            'fone',
            'placa',
            'cpf',
            'cnpj'
        ])
        .isRequired,
    maskFormatNumber: PropTypes.string,
    onClickHeaderColumn: PropTypes.func,
    onClickCellRow: PropTypes.func,
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    danger: PropTypes.bool,
    primary: PropTypes.bool,
    inverse: PropTypes.bool
}

AnterosTableColumn.defaultProps = {
    dataType: 'string'
}