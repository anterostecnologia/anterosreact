import React, { Component } from 'react';
import lodash from 'lodash';
import { AnterosError, formatNumber, parseNumber, formatDate, parseDateWithFormat, isDate } from "anteros-react-core";


export default class AnterosTable extends Component {
    constructor(props) {
        super(props);
        this.validateColumns = this.validateColumns.bind(this);
        this.renderImage = this.renderImage.bind(this);
        this.renderNumber = this.renderNumber.bind(this);
        this.renderDate = this.renderDate.bind(this);
        this.renderDateTime = this.renderDateTime.bind(this);
        this.renderTime = this.renderTime.bind(this);
        this.validateColumns();
    }

    validateColumns() {
        let arrChildren = React.Children.toArray(this.props.children);
        if (arrChildren.length == 0) {
            throw new AnterosError("Informe ao menos uma coluna para tabela " + this.props.id + ".");
        }

        arrChildren.forEach(function (child) {
            if (child.type && child.type.name != "AnterosTableColumn") {
                throw new AnterosError("Somente AnterosTableColumn podem ser informados como filhos de AnterosTable.");
            }
        });
    }

    renderDate(column, value, record) {
        if (!column)
            return value;
        return formatDate(value, this.props.dateFormat);
    }

    renderDateTime(column, value, record) {
        if (!column)
            return value;
        return formatDate(value, this.props.dateFormat + " " + this.props.timeFormat);
    }

    renderTime(column, value, record) {
        if (!column)
            return value;
        return formatDate(value, this.props.timeFormat);
    }

    renderNumber(column, value, record) {
        if (!column || !column.props.maskFormatNumber)
            return value;
        return formatNumber(value, column.props.maskFormatNumber);
    }

    renderImage(column, value, record) {
        let width, height;
        let classNameImage;
        if (column) {
            if (column.props.imageCircle) {
                classNameImage = "img-circle";
            }
            width = column.props.imageWidth;
            height = column.props.imageHeight;
        }

        return <img className={classNameImage} src={value} height={height} width={width} />;
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
            <div className="table-responsive" tabIndex={this.props.tabIndex} ref={ref => this.divTable = ref} style={{ borderColor: "silver", border: "1px", width: "100%", height: "100%" }}>
                <table ref={ref => this.table = ref} id={idTable} className={className} cellSpacing="0">
                    <thead>
                        <tr className={classNameHeader} >
                            {this.props.children.map((column, i) => {
                                let align = column.props.headerAlign;
                                if (column.props.headerAlignCenter) {
                                    align = "center";
                                } else if (column.props.headerAlignRight) {
                                    align = "right";
                                }
                                return (<th key={i} onClick={(column.onClickHeaderColumn)} data-column={column} style={{ textAlign: align }}>{column.props.title}</th>);
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {_this.props.dataSource.map((record, i) => {
                            return (<tr key={i}>{
                                _this.props.children.map((column, j) => {
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
                                    return (<td key={j} className={classNameCell} onClick={(column.onClickCellRow)} data-column={column} style={{ textAlign: align }} >{render ? render(column, record[column.props.dataField], record) : record[column.props.dataField]}</td>);
                                })}
                            </tr>);
                        })}
                    </tbody>
                </table>
            </div>

        )
    }
}
AnterosTable.propTypes = {
    id: React.PropTypes.string,
    dataSource: React.PropTypes.array.isRequired,
    decimalSeparator: React.PropTypes.string.isRequired,
    thousandsSeparator: React.PropTypes.string.isRequired,
    height: React.PropTypes.string,
    width: React.PropTypes.string,
    showBorder: React.PropTypes.bool.isRequired,
    showStripedRows: React.PropTypes.bool.isRequired,
    showHover: React.PropTypes.bool.isRequired,
    dateFormat: React.PropTypes.oneOf(['DD/MM/YYYY', 'DD-MM-YYYY', 'MM/DD/YYYY', 'MM-DD-YYYY', 'YYYY/MM/DD', 'YYYY-MM-DD']).isRequired,
    timeFormat: React.PropTypes.oneOf(['HH:mm:ss', 'HH:mm', 'hh:mm:ss', 'hh:mm']).isRequired,
    tabIndex: React.PropTypes.number.isRequired,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    inverse: React.PropTypes.bool
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
    title: React.PropTypes.string.isRequired,
    headerAlign: React.PropTypes.oneOf(['left', 'center', 'right']),
    headerAlignRight: React.PropTypes.bool,
    headerAlignCenter: React.PropTypes.bool,
    textAlign: React.PropTypes.oneOf(['left', 'center', 'right']),
    textAlignRight: React.PropTypes.bool,
    textAlignCenter: React.PropTypes.bool,
    render: React.PropTypes.func,
    dataField: React.PropTypes.string.isRequired,
    dataType: React.PropTypes.oneOf(['number', 'date', 'date_time', 'time', 'string', 'image']).isRequired,
    maskFormatNumber: React.PropTypes.string,
    onClickHeaderColumn: React.PropTypes.func,
    onClickCellRow: React.PropTypes.func,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    inverse: React.PropTypes.bool
}


AnterosTableColumn.defaultProps = {
    dataType: 'string'
}