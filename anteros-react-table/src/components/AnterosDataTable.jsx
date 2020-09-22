import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import lodash from "lodash";
import "script-loader!jszip/dist/jszip.min.js";
// import 'script-loader!pdfmake/build/pdfmake.min.js'; import
// 'script-loader!pdfmake/build/vfs_fonts.js';
import "script-loader!./AnterosDataTables.js";
import "script-loader!./AnterosDataTables.bootstrap4.js";
import "script-loader!./AnterosDataTables.keyTable.js";
import "script-loader!datatables.net-fixedcolumns/js/dataTables.fixedColumns.min.js";
import "script-loader!./AnterosDataTables.select.js";
import "script-loader!datatables.net-buttons/js/dataTables.buttons.min.js";
import "script-loader!datatables.net-buttons/js/buttons.colVis.min.js";
import "script-loader!datatables.net-buttons/js/buttons.print.min.js";
import "script-loader!datatables.net-buttons/js/buttons.html5.min.js";
import "script-loader!./AnterosDataTables.buttons.bootstrap.js";
import {
	AnterosError,
	AnterosUtils,
	AnterosDateUtils,
	Anteros,
	AnterosStringMask
} from "@anterostecnologia/anteros-react-core";
import {
	AnterosDatasource,
	AnterosRemoteDatasource,
	AnterosLocalDatasource,
	dataSourceEvents
} from "@anterostecnologia/anteros-react-datasource";
import PropTypes from "prop-types";
const uuidv4 = require('uuid/v4');

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

export default class AnterosDataTable extends Component {
	constructor(props) {
		super(props);
		this.idTable = this.props.id ? this.props.id : uuidv4();
		this.idCheckBoxSelect = uuidv4();
		this.getColumns = this.getColumns.bind(this);
		this.buildColumnsToDatatable = this.buildColumnsToDatatable.bind(this);
		this.onClick = this.onClick.bind(this);
		this.renderImage = this.renderImage.bind(this);
		this.renderNumber = this.renderNumber.bind(this);
		this.renderDate = this.renderDate.bind(this);
		this.renderDateTime = this.renderDateTime.bind(this);
		this.renderTime = this.renderTime.bind(this);
		this.renderCep = this.renderCep.bind(this);
		this.renderFone = this.renderFone.bind(this);
		this.renderPlaca = this.renderPlaca.bind(this);
		this.renderCpf = this.renderCpf.bind(this);
		this.renderCnpj = this.renderCnpj.bind(this);
		this.renderDetails = this.renderDetails.bind(this);
		this.renderMemo = this.renderMemo.bind(this);
		this.getColumnByIndex = this.getColumnByIndex.bind(this);
		this.renderBoolean = this.renderBoolean.bind(this);
		this.renderCheckBoxSelect = this.renderCheckBoxSelect.bind(this);
		this.adjustHeaderCheckbox = this.adjustHeaderCheckbox.bind(this);
		this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
		this.refreshData = this.refreshData.bind(this);
		this.refresh = this.refresh.bind(this);
		this.isBase64 = this.isBase64.bind(this);
		this.onTableClick = this.onTableClick.bind(this);
		this.getValue = this.getValue.bind(this);
		this.isBase64 = this.isBase64.bind(this);
		this.isUrl = this.isUrl.bind(this);
		this.renderAudio = this.renderAudio.bind(this);
		this.currentRow = undefined;
		this.currentCol = undefined;
		this.dataTable;
		this.domDataTable;
		this.resize = this.resize.bind(this);
		this.initializeDatatable = this.initializeDatatable.bind(this);
		this.generateColumns = this.generateColumns.bind(this);
		this.createDatatable = this.createDatatable.bind(this);
		this.columns = [];
		this.sortCustomDateAsc = this.sortCustomDateAsc.bind(this);
		this.sortCustomDateDesc = this.sortCustomDateDesc.bind(this);
		this.sortCustomDateTimeAsc = this.sortCustomDateTimeAsc.bind(this);
		this.sortCustomDateTimeDesc = this.sortCustomDateTimeDesc.bind(this);
		this.sortCustomTimeAsc = this.sortCustomTimeAsc.bind(this);
		this.sortCustomTimeDesc = this.sortCustomTimeDesc.bind(this);
		this.sortNumberAsc = this.sortNumberAsc.bind(this);
		this.sortNumberDesc = this.sortNumberDesc.bind(this);
		this.onUserSelect = this.onUserSelect.bind(this);
		this.getCheckboxSelectAll = this.getCheckboxSelectAll.bind(this);
		this.getTableBody = this.getTableBody.bind(this);
		this.onKeyFocusTable = this.onKeyFocusTable.bind(this);
		this.onPageChangeTable = this.onPageChangeTable.bind(this);
		this.onKeyDownDocument = this.onKeyDownDocument.bind(this);
		this.onKeyPressDocument = this.onKeyPressDocument.bind(this);
		this.onClickDetailsControl = this.onClickDetailsControl.bind(this);
		this.getDocument = this.getDocument.bind(this);
		this.onDoubleClickTableBody = this.onDoubleClickTableBody.bind(this);
		this.onClickTdTableBody = this.onClickTdTableBody.bind(this);
		this.getScrollBody = this.getScrollBody.bind(this);
		this.onScrollBody = this.onScrollBody.bind(this);
		this.getThead = this.getThead.bind(this);
		this.onSelectTable = this.onSelectTable.bind(this);
	}

	getColumnByIndex(index) {
		let columns = this.getColumns();
		let i;		
		for (i = 0; i < columns.length; i++) {
			if (i == index) return columns[i];
		}
	}

	renderCheckBoxSelect(data, type, full, meta) {
		return (
			'<input type="checkbox" name="id[]" id=ch_' +
			this.idTable +
			"_" +
			meta.row +
			"_" +
			meta.col +
			" row=" +
			meta.row +
			" col=" +
			meta.col +
			' value="' +
			$("<div/>")
				.text(data)
				.html() +
			'">'
		);
	}

	getValue(data) {
		if (data && data !== '') {
			if (this.isBase64(data)) {
				if (this.isUrl(atob(data))) {
					return atob(data);
				} else {
					return 'data:audio;base64,' + data;
				}
			} else {
				return data;
			}
		} else {
			return null;
		}
	}

	isBase64(str) {
		try {
			return btoa(atob(str)) === str;
		} catch (err) {
			return false;
		}
	}

	isUrl(string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}

	renderAudio(data, type, full, meta) {
		let value = this.getValue(data);
		return ReactDOMServer.renderToString(<audio
			className={`react-audio-player`}
			controls={true}
			src={value}
			tabIndex={-1}
		/>);
	}

	renderDetails(data, type, full, meta) {
		return "";
	}

	renderDate(data, type, full, meta) {
		if (!data) {
			return "";
		}
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let dt = data;
		if (!(dt instanceof Date)) {
			dt = AnterosDateUtils.parseDateWithFormat(
				data,
				Anteros.dataSourceDatetimeFormat
			);
		}
		return AnterosDateUtils.formatDate(dt, this.props.dateFormat);
	}

	renderDateTime(data, type, full, meta) {
		if (!data) {
			return "";
		}
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let dt = data;
		if (!(dt instanceof Date)) {
			dt = AnterosDateUtils.parseDateWithFormat(
				data,
				Anteros.dataSourceDatetimeFormat
			);
		}
		return AnterosDateUtils.formatDate(
			dt,
			this.props.dateFormat + " " + this.props.timeFormat
		);
	}

	renderTime(data, type, full, meta) {
		if (!data) {
			return "";
		}
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let dt = data;
		if (!(dt instanceof Date)) {
			dt = AnterosDateUtils.parseDateWithFormat(
				data,
				Anteros.dataSourceDatetimeFormat
			);
		}
		return AnterosDateUtils.formatDate(dt, this.props.timeFormat);
	}

	renderBoolean(data, type, full, meta) {
		if (data === true) {
			return "Sim";
		} else {
			return "Não";
		}
	}

	renderNumber(data, type, full, meta) {
		let column = this.getColumnByIndex(meta.col);
		if (!column || !column.props.maskFormatNumber) return data;
		return AnterosUtils.formatNumber(data, column.props.maskFormatNumber);
	}

	renderCode(data, type, full, meta) {
		return data;
	}

	renderCep(data, type, full, meta) {
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let _mask = new AnterosStringMask("99999-999");
		return _mask.apply(data);
	}

	renderFone(data, type, full, meta) {
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let _mask = new AnterosStringMask("(99) 99999-9999");
		return _mask.apply(data);
	}

	renderPlaca(data, type, full, meta) {
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let _mask = new AnterosStringMask("SSS-AAAAA");
		return _mask.apply(value);
	}

	renderCpf(data, type, full, meta) {
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let _mask = new AnterosStringMask("999.999.999-99");
		return _mask.apply(data);
	}

	renderCnpj(data, type, full, meta) {
		let column = this.getColumnByIndex(meta.col);
		if (!column) return data;
		let _mask = new AnterosStringMask("99.999.999/9999-99");
		return _mask.apply(data);
	}

	isBase64(str) {
		if (!str || str === "" || str.trim() === "") {
			return false;
		}
		try {
			return btoa(atob(str)) == str;
		} catch (err) {
			return false;
		}
	}

	renderImage(data, type, full, meta) {
		let column = this.getColumnByIndex(meta.col);
		let width, height;
		let classNameImage;
		if (column) {
			if (column.props.imageCircle) {
				classNameImage = "img-circle";
			}
			width = column.props.imageWidth;
			height = column.props.imageHeight;
		}

		let img = data;
		if (!img) {
			img = column.props.placeHolder;
		}

		let imgSrc = img;
		if (this.isBase64(img)) {
			if (this.isUrl(atob(img))) {
				imgSrc = atob(img);
			} else {
				imgSrc = 'data:image;base64,' + img;
			}
		}


		return ReactDOMServer.renderToString(
			<img
				className={classNameImage}
				src={imgSrc}
				height={height}
				width={width}
			/>
		);
	}

	renderMemo(data, type, full, meta) {
		let memoSrc = data;
		if (this.isBase64(data)) {
			memoSrc = atob(data);
		}
		return memoSrc;
	}

	isUrl(string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}

	onClick(event) { }

	componentDidUpdate() { }

	sortCustomCodeAsc(a, b) {
		if (a === b) {
			return 0;
		} else if (isNaN(a) && isNaN(b)) {
			if (a < b)
				return -1;
			else if (a > b)
				return 1;
		} else if (!isNaN(a) && isNaN(b)) {
			return -1;
		} else if (isNaN(a) && !isNaN(b)) {
			return 1
		} else {
			if (Number(a) > Number(b)) {
				return 1;
			} else {
				return -1;
			}
		}
	}

	sortCustomCodeDesc(a, b) {
		if (a === b) {
			return 0;
		} else if (isNaN(a) && isNaN(b)) {
			if (a < b)
				return 1;
			else if (a > b)
				return -1;
		} else if (!isNaN(a) && isNaN(b)) {
			return 1;
		} else if (isNaN(a) && !isNaN(b)) {
			return -1
		} else {
			if (Number(a) > Number(b)) {
				return -1;
			} else {
				return 1;
			}
		}
	};

	sortCustomDateAsc(a, b) {
		let dtA = AnterosDateUtils.parseDateWithFormat(
			a,
			Anteros.dataSourceDatetimeFormat
		);
		let dtB = AnterosDateUtils.parseDateWithFormat(
			b,
			Anteros.dataSourceDatetimeFormat
		);
		if (!AnterosDateUtils.isDate(dtA) || !AnterosDateUtils.isDate(dtB))
			return 0;
		if (dtA < dtB) return -1;
		else if (dtA == dtB) return 0;
		else if (dtA > dtB) return 1;
	}

	sortCustomDateDesc(a, b) {
		let dtA = AnterosDateUtils.parseDateWithFormat(
			a,
			Anteros.dataSourceDatetimeFormat
		);
		let dtB = AnterosDateUtils.parseDateWithFormat(
			b,
			Anteros.dataSourceDatetimeFormat
		);
		if (!AnterosDateUtils.isDate(dtA) || !AnterosDateUtils.isDate(dtB))
			return 0;
		if (dtA < dtB) return 1;
		else if (dtA == dtB) return 0;
		else if (dtA > dtB) return -1;
	};

	sortCustomDateTimeAsc(a, b) {
		let dtA = AnterosDateUtils.parseDateWithFormat(
			a,
			Anteros.dataSourceDatetimeFormat
		);
		let dtB = AnterosDateUtils.parseDateWithFormat(
			b,
			Anteros.dataSourceDatetimeFormat
		);
		if (!AnterosDateUtils.isDate(dtA) || !AnterosDateUtils.isDate(dtB))
			return 0;
		return dtA.getMilliseconds() - dtB.getMilliseconds();
	};

	sortCustomDateTimeDesc(a, b) {
		let dtA = AnterosDateUtils.parseDateWithFormat(
			a,
			anteros.dataSourceDatetimeFormat
		);
		let dtB = AnterosDateUtils.parseDateWithFormat(
			b,
			anteros.dataSourceDatetimeFormat
		);
		if (!AnterosDateUtils.isDate(dtA) || !AnterosDateUtils.isDate(dtB))
			return 0;
		return dtB.getMilliseconds() - dtA.getMilliseconds();
	};

	sortCustomTimeAsc(a, b) {
		let dtA = AnterosDateUtils.parseDateWithFormat(
			a,
			Anteros.dataSourceDatetimeFormat
		);
		let dtB = AnterosDateUtils.parseDateWithFormat(
			b,
			Anteros.dataSourceDatetimeFormat
		);
		if (!AnterosDateUtils.isDate(dtA) || !AnterosDateUtils.isDate(dtB))
			return 0;
		return dtA.getMilliseconds() - dtB.getMilliseconds();
	};

	sortCustomTimeDesc(a, b) {
		let dtA = AnterosDateUtils.parseDateWithFormat(
			a,
			Anteros.dataSourceDatetimeFormat
		);
		let dtB = AnterosDateUtils.parseDateWithFormat(
			b,
			Anteros.dataSourceDatetimeFormat
		);
		if (!AnterosDateUtils.isDate(dtA) || !AnterosDateUtils.isDate(dtB))
			return 0;
		return dtB.getMilliseconds() - dtA.getMilliseconds();
	};

	sortNumberAsc(a, b) {
		return AnterosUtils.parseNumber(a) - AnterosUtils.parseNumber(b);
	};

	sortNumberDesc(a, b) {
		return AnterosUtils.parseNumber(b) - AnterosUtils.parseNumber(a);
	};

	onUserSelect(e, dt, type, cell, originalEvent) {
		if (this.props.onTableClick) {
			this.props.onTableClick(e, this);
		}
	}



	getCheckboxSelectAll() {
		return $("." + this.idCheckBoxSelect)
	}

	getTableBody() {
		return $("#" + this.idTable + " tbody");
	}



	onKeyFocusTable(e, datatable, cell, originalEvent) {
		this.currentRow = cell.index().row;
		this.currentCol = cell.index().column;
		this.adjustHeaderCheckbox();
		if (this.onFocusCell) {
			this.onFocusCell(this.currentRow, this.currentCol);
		}
	}

	onPageChangeTable() {
		this.adjustHeaderCheckbox();
		var info = this.dataTable.page.info();
		if (this.onPageChange) {
			this.onPageChange(info);
		}
	}

	onKeyDownDocument(event) {
		if (event.target == this.divTable) {
			if (
				event.keyCode == 40 ||
				event.keyCode == 38 ||
				event.keyCode == 34 ||
				event.keyCode == 33
			) {
				this.dataTable.rows().deselect();
				this.dataTable.row(this.currentRow).select();
				this.adjustHeaderCheckbox();
			}
			if (event.keyCode == 32) {
				this.adjustHeaderCheckbox();
				event.preventDefault();
				let id = "ch_" + this.idTable + "_" + this.currentRow + "_0";
				let input = document.getElementById(id);
				if (input) {
					input.checked = !input.checked;
					if (input.checked) {
						if (this.props.onSelectRecord) {
							this.props.onSelectRecord(
								this.dataTable.row(this.currentRow),
								this.dataTable.row(this.currentRow).data()[0], this.props.id
							);
						}
					} else {
						if (this.props.onUnSelectRecord) {
							this.props.onUnSelectRecord(
								this.dataTable.row(this.currentRow),
								this.dataTable.row(this.currentRow).data()[0], this.props.id
							);
						}
					}
				}
			}
		}
	};

	onKeyPressDocument(event) {
	}


	onClickDetailsControl() {
		var tr = $(this).closest("tr");
		var row = this.dataTable.row(tr);

		if (row.child.isShown()) {
			row.child.hide();
			tr.removeClass("shown");
		} else {
			if (this.props.renderDetails) {
				row.child(this.props.renderDetails(row.data())).show();
			}
			tr.addClass("shown");
		}
	}

	getDocument() {
		return $(document);
	}

	onDoubleClickTableBody() {
		if (this.props.onDoubleClick) {
			let data = this.dataTable.row(this).data();
			this.props.onDoubleClick(data);
		} else if (_this.props.onCellDoubleClick) {
			let data = table.row(this).data();
			let row = table.cell(this).index().row;
			let column = table.cell(this).index().column;
			this.props.onCellDoubleClick(row, column, data);
		}
	}

	onClickTdTableBody() {
		if (this.props.onCellClick) {
			let data = this.dataTable.row(this).data();
			let row = this.dataTable.cell(this).index().row;
			let column = this.dataTable.cell(this).index().column;
			this.props.onCellClick(row, column, data);
		}
	}

	getScrollBody() {
		return this.divTable.querySelector(".dataTables_scrollBody");
	}

	onScrollBody() {
		if (this.clientWidth < this.scrollWidth) {
			this.classList.remove("shadow-left");
			this.classList.remove("shadow-right");
			this.classList.remove("shadow-left-right");
			if (
				this.scrollLeft > 0 &&
				this.scrollLeft + this.clientWidth < this.scrollWidth
			) {
				this.classList.add("shadow-left-right");
			} else if (this.scrollLeft + this.clientWidth == this.scrollWidth) {
				this.classList.add("shadow-left");
			} else if (this.scrollLeft == 0) {
				this.classList.add("shadow-right");
			}
		}
	};

	getThead() {
		return $(this.divTable)
			.find("table")
			.eq(0)
			.find("thead")
			.eq(0);
	}

	onSelectTable(e, dt, type, indexes) {
		if (this.props.dataSource && this.props.dataSource.isOpen()) {
			this.props.dataSource.gotoRecordByData(dt.data());
		}
	}


	initializeDatatable() {
		let _this = this;
		// Adiciona novas extensões de ordenação
		let sortExtension = jQuery.fn.dataTableExt.oSort;
		sortExtension["number-asc"] = this.sortNumberAsc;
		sortExtension["number-desc"] = this.sortNumberDesc;
		sortExtension["customdate-asc"] = this.sortCustomDateAsc;
		sortExtension["customdate-desc"] = this.sortCustomDateDesc;
		sortExtension["customdatetime-asc"] = this.sortCustomDateTimeAsc;
		sortExtension["customdatetime-desc"] = this.sortCustomDateTimeDesc;
		sortExtension["customtime-asc"] = this.sortCustomTimeAsc;
		sortExtension["customtime-desc"] = this.sortCustomTimeDesc;
		sortExtension["customcode-asc"] = this.sortCustomCodeAsc;
		sortExtension["customcode-desc"] = this.sortCustomCodeDesc;

		let classNameExportButtons = "btn-info";
		if (this.props.exportButtonsPrimary) {
			classNameExportButtons = "btn-primary";
		} else if (this.props.exportButtonsInfo) {
			classNameExportButtons = "btn-info";
		} else if (this.props.exportButtonsSuccess) {
			classNameExportButtons = "btn-success";
		} else if (this.props.exportButtonsDanger) {
			classNameExportButtons = "btn-danger";
		} else if (this.props.exportButtonsWarning) {
			classNameExportButtons = "btn-warning";
		}
		let dataSource = [];
		if (
			this.props.dataSource instanceof AnterosRemoteDatasource ||
			this.props.dataSource instanceof AnterosLocalDatasource
		) {
			dataSource = this.props.dataSource.getData();
		} else {
			dataSource = this.props.dataSource;
		}
		let customOptions = {};
		if (this.showExportButtons) {
			customOptions = {
				dom:
					"<'row'<'col-md-4'B><'col-md-4'l><'col-md-4'f>r>t<'row'<'col-md-6'i><'col-md-6'p>" +
					">"
			};
		}
		this.dataTable = this.createDatatable(this.idTable, customOptions, dataSource, classNameExportButtons);
		if (this.props.showExportButtons == false) {
			this.dataTable.buttons().remove();
		}
		this.dataTable.on('user-select', this.onUserSelect);
		if (this.props.enableCheckboxSelect) {
			this.getCheckboxSelectAll().on("click", function () {
				var rows = _this.dataTable.rows({ search: "applied" }).nodes();
				$('input[type="checkbox"][name="id[]"]', rows).prop("checked", this.checked);
				if (this.checked) {
					if (_this.props.onSelectAllRecords) {
						let result = [_this.dataTable.rows()[0].length];
						for (let i = 0; i < _this.dataTable.rows()[0].length; i++) {
							result[i] = _this.dataTable.rows(i).data()[0];
						}
						_this.props.onSelectAllRecords(result, _this.props.id);
					}
				} else {
					if (_this.props.onUnSelectAllRecords) {
						_this.props.onUnSelectAllRecords(_this.props.id);
					}
				}
			});
			this.adjustHeaderCheckbox();
			this.getTableBody().on("change", 'input[type="checkbox"][name="id[]"]', function (event) {
				_this.currentRow = event.target.parentElement._DT_CellIndex.row;
				_this.currentCol = event.target.parentElement._DT_CellIndex.column;
				_this.dataTable.rows().deselect();
				_this.dataTable.row(_this.currentRow).select();

				if (this.checked) {
					if (_this.props.onSelectRecord) {
						_this.props.onSelectRecord(
							_this.dataTable.rows(this.getAttribute("row")),
							_this.dataTable.rows(this.getAttribute("row")).data()[0], _this.props.id
						);
					}
				} else {
					if (_this.props.onUnSelectRecord) {
						_this.props.onUnSelectRecord(
							_this.dataTable.rows(this.getAttribute("row")),
							_this.dataTable.rows(this.getAttribute("row")).data()[0], _this.props.id
						);
					}
				}
				if (!this.checked) {
					var el = $("#" + _this.idCheckBoxSelect).get(0);
					if (el && el.checked && "indeterminate" in el) {
						el.indeterminate = true;
					}
				}
			}
			);
		}
		this.dataTable.on("key-focus", this.onKeyFocusTable);
		this.dataTable.on("page.dt", this.onPageChangeTable);
		this.getDocument().on("keydown.keyTable", this.onKeyDownDocument);
		this.getDocument().on("keypress.keyTable", this.onKeyPressDocument);
		this.getTableBody().on("click", "td.details-control", this.onClickDetailsControl);
		this.getTableBody().on("dblclick", "td", this.onDoubleClickTableBody);
		this.getTableBody().on("click", "td", this.onClickTdTableBody);
		this.getScrollBody().onscroll = this.onScrollBody;

		let thead = this.getThead();
		if (this.props.success) {
			thead.addClass("datatable-success");
		} else if (this.props.primary) {
			thead.addClass("datatable-primary");
		} else if (this.props.warning) {
			thead.addClass("datatable-warning");
		} else if (this.props.info) {
			thead.addClass("datatable-info");
		} else if (this.props.danger) {
			thead.addClass("datatable-danger");
		}
		this.dataTable.on("select", this.onSelectTable);
	}

	createDatatable(id, custom, data, classNameExportButtons) {
		return $("#" + id).DataTable(this.buildOptions(custom, data, classNameExportButtons));
	}

	buildOptions(custom, data, classNameExportButtons) {
		return {
			...custom,
			columns: this.buildColumnsToDatatable(),
			keys: true,
			scrollY: this.props.height,
			scrollX: true,
			paging: this.props.enablePaging,
			destroy: true,
			data: data,
			autoFill: true,
			displayStart: this.props.pageStart,
			lengthMenu: this.props.pageLengthOptions,
			pageLength: this.props.pageLength,
			pageType: this.props.pageType,
			scrollCollapse: true,
			ordering: this.props.enableOrderByColumn,
			orderMulti: this.props.enableOrderByMultipleColumns,
			searching: this.props.enableSearching,
			searchDelay: 600,
			stateSave: this.props.stateSave,
			stateLoaded: this.props.onStateLoaded,
			stateLoadCallback: this.props.onStateLoad,
			stateSaveCallback: this.props.onStateSave,
			select: true,
			responsive: true,
			order: this.props.initialOrder,
			orderFixed: this.props.fixedOrder,
			fixedColumns: {
				leftColumns: this.props.fixedColumnsLeft,
				rightColumns: this.props.fixedColumnsRight
			},
			search: {
				search: this.props.initialSearchCondition,
				smart: true
			},
			scroller: {
				loadingIndicator: this.props.showLoadingIndicator
			},
			buttons: [
				{
					extend: "copy",
					className: classNameExportButtons,
					text: "Copiar"
				},
				{
					extend: "excel",
					className: classNameExportButtons,
					text: "Excel"
				},
				{
					extend: "pdf",
					className: classNameExportButtons,
					text: "PDF"
				},
				{
					extend: "print",
					className: classNameExportButtons,
					text: "Imprimir"
				},
				{
					extend: "csv",
					className: classNameExportButtons,
					text: "CSV"
				}
			],
			language: {
				sEmptyTable: "Nenhum registro encontrado",
				sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
				sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
				sInfoFiltered: "(Filtrados de _MAX_ registros)",
				sInfoPostFix: "",
				sInfoThousands: ".",
				sLengthMenu: "_MENU_ resultados por página",
				sLoadingRecords: "Carregando...",
				sProcessing: "Processando...",
				sZeroRecords: "Nenhum registro encontrado",
				sSearch: "Pesquisar",
				oPaginate: {
					sNext: "Próximo",
					sPrevious: "Anterior",
					sFirst: "Primeiro",
					sLast: "Último"
				},
				oAria: {
					sSortAscending: ": Ordenar colunas de forma ascendente",
					sSortDescending: ": Ordenar colunas de forma descendente"
				},
				decimal: this.props.decimalSeparator,
				thousands: this.props.thousandsSeparator
			}
		};
	}

	componentDidMount() {
		this.initializeDatatable();
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

	componentWillUnmount() {
		if (this.divTable) {
			var datatable = $("#" + this.idTable)
				.dataTable()
				.api();
			datatable.clear();
			datatable.destroy();
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
	}

	componentWillReceiveProps(nextProps) {
		this.columns = this.generateColumns();
		if (nextProps.dataSource) {
			this.refreshData();
		}
	}

	onDatasourceEvent(event, error) {
		if (event == dataSourceEvents.AFTER_SCROLL) {
			if (this.props.dataSource && !this.props.dataSource.isEmpty()) {
				var dataTable = $("#" + this.idTable)
					.dataTable()
					.api();
				dataTable.rows().deselect();
				dataTable.row(this.props.dataSource.getRecno()).select();
				var tr = $(this.divTable)
					.find("table")
					.find("tr.selected")[0];
				if (tr) {
					// tr.scrollIntoView(true);
				}
			}
		} else {
			this.refreshData();
		}
		if (this.divTable) {
			this.divTable.style.pointerEvents =
				this.props.dataSource.getState() !== "dsBrowse" ? "none" : "auto";
		}
	}
	refresh() {
		var datatable = $("#" + this.idTable).dataTable();
		datatable.fnAdjustColumnSizing();
	}

	refreshData() {
		if (this.divTable && this.props.dataSource) {
			if (
				this.props.dataSource &&
				(this.props.dataSource instanceof AnterosLocalDatasource ||
					this.props.dataSource instanceof AnterosRemoteDatasource)
			) {
				if (
					!this.props.dataSource.isOpen() ||
					this.props.dataSource.getState() != "dsBrowse"
				) {
					return;
				}
			}
			var datatable = $("#" + this.idTable)
				.dataTable()
				.api();
			datatable.clear();

			if (
				this.props.dataSource instanceof AnterosRemoteDatasource ||
				this.props.dataSource instanceof AnterosLocalDatasource
			) {
				datatable.rows.add(this.props.dataSource.getData());
			} else {
				datatable.rows.add(this.props.dataSource);
			}

			datatable.rows().invalidate("data");
			datatable.draw(false);
			datatable.rows().deselect();
			datatable.row(this.props.dataSource.getRecno()).select();
			this.adjustHeaderCheckbox();
		}
	}

	adjustHeaderCheckbox() {
		let th1 = $(this.divTable)
			.find("table")
			.eq(0)
			.find("th")
			.eq(0);
		let th2 = $(this.divTable)
			.find("table")
			.eq(1)
			.find("th")
			.eq(0);
		th1.removeClass();
		th1.addClass("dataTable_title_align_center");
		th2.removeClass();
		th2.addClass("dataTable_title_align_center");
	}

	buildColumnsToDatatable() {
		let result = [];
		let columns = this.getColumns();
		let arrChildren = React.Children.toArray(columns);
		let _this = this;
		arrChildren.forEach(function (column) {
			if (column.props.visible) {
				let className = "";

				if (column.props.align == "right" || column.props.alignRight) {
					className += " dataTable_cell_align_right";
				} else if (column.props.align == "center" || column.props.alignCenter) {
					className += " dataTable_cell_align_center";
				}
				className +=
					" " +
					(column.props.cellRowClassName ? column.props.cellRowClassName : "");

				if (column.props.titleAlign == "right" || column.props.titleAlignRight) {
					className += " dataTable_title_align_right";
				} else if (
					column.props.titleAlign == "center" ||
					column.props.titleAlignCenter
				) {
					className += " dataTable_title_align_center";
				}
				className +=
					" " +
					(column.props.cellHeaderClassName
						? column.props.cellHeaderClassName
						: "");

				let customRender = null;
				let type = "string";
				if (column.props.dataType == "image") {
					customRender = _this.renderImage;
				} else if (column.props.dataType == "number") {
					if (column.props.maskFormatNumber) customRender = _this.renderNumber;
					type = "number";
					className += " dataTable_value_align_right";
				} else if (column.props.dataType == "date") {
					customRender = _this.renderDate;
					type = "customdate";
				} else if (column.props.dataType == "date_time") {
					customRender = _this.renderDateTime;
					type = "customdate_time";
				} else if (column.props.dataType == "time") {
					customRender = _this.renderTime;
					type = "customtime";
				} else if (column.props.dataType == "code") {
					customRender = _this.renderCode;
					type = "customcode";
				} else if (column.props.dataType == "cep") {
					customRender = _this.renderCep;
				} else if (column.props.dataType == "fone") {
					customRender = _this.renderFone;
				} else if (column.props.dataType == "placa") {
					customRender = _this.renderPlaca;
				} else if (column.props.dataType == "cpf") {
					customRender = _this.renderCpf;
				} else if (column.props.dataType == "cnpj") {
					customRender = _this.renderCnpj;
				} else if (column.props.dataType == "boolean") {
					customRender = _this.renderBoolean;
				} else if (column.props.dataType == "audio") {
					customRender = _this.renderAudio;
				} else if (column.props.dataType == "memo") {
					customRender = _this.renderMemo;
				}

				if (column.props.render) {
					customRender = column.props.render;
				}

				result.push({
					title: column.props.title,
					data: column.props.dataField,
					width: column.props.width,
					className: className,
					orderable: column.props.orderable,
					searchable: column.props.searchable,
					render: customRender,
					type: type,
					defaultContent: column.props.defaultContent
				});
			}
		});
		return result;
	}

	getColumns() {
		if (this.columns.length === 0) {
			this.columns = this.generateColumns();
		}
		return this.columns;
	}

	generateColumns() {
		let arrChildren = React.Children.toArray(this.props.children);
		let result = [];
		let _this = this;

		let detailsColumn;
		if (this.props.showDetails) {
			detailsColumn = React.createElement(AnterosDataTableColumn, {
				title: "",
				alignCenter: true,
				dataField: "",
				titleAlignCenter: true,
				render: _this.renderDetails,
				cellHeaderClassName: "details-control",
				orderable: false,
				searchable: false,
				visible: true,
				width: "30px"
			});
			arrChildren = [detailsColumn, ...arrChildren];
		}

		let checkBoxColumn;
		if (this.props.enableCheckboxSelect) {
			checkBoxColumn = React.createElement(AnterosDataTableColumn, {
				title:
					'<input type="checkbox" class="' + this.idCheckBoxSelect + '" value="1">',
				alignCenter: true,
				dataField: "",
				titleAlignCenter: true,
				render: _this.renderCheckBoxSelect,
				orderable: false,
				searchable: false,
				cellHeaderClassName: "dt-body-center",
				width: "30px",
				visible: true
			});
			arrChildren = [checkBoxColumn, ...arrChildren];
		}

		arrChildren.forEach(function (child) {
			if (child && child.type.componentName === "Columns") {
				let arrColumns = React.Children.toArray(child.props.children);
				arrColumns.forEach(function (childColumn) {
					if (
						childColumn.type &&
						childColumn.props.visible &&
						childColumn.type.componentName === "AnterosDataTableColumn"
					) {
						result.push(childColumn);
					}
				});
			} else if (
				child.type &&
				child.props.visible &&
				child.type.componentName === "AnterosDataTableColumn"
			) {
				result.push(child);
			}
		});
		return result;
	}

	getDatatable(width, height) {
		var datatable = $("#" + this.idTable).dataTable();
		return datatable;
	}
	resize(width, height) {
		let elementBody = this.divTable.querySelector(".dataTables_scrollBody");
		let elementScroll = this.divTable.querySelector(".DTFC_ScrollWrapper");
		window.$(elementBody).css("max-height", height);
		window.$(elementScroll).css("height", height + 50);
		window.$(elementBody).css("width", width);
		window.$(elementScroll).css("width", width);
		this.refresh();
	}

	onTableClick(event) {
		if (this.props.onTableClick) {
			this.props.onTableClick(event, this);
		}
	}

	render() {
		let className = "display nowrap";
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

		let disabled = this.props.disabled;
		if (this.props.dataSource && !disabled) {
			if (
				this.props.dataSource instanceof AnterosRemoteDatasource ||
				this.props.dataSource instanceof AnterosLocalDatasource
			) {
				disabled =
					this.props.dataSource.getState() !== "dsBrowse" ? "none" : "auto";
			}
		}

		return (
			<div
				tabIndex={this.props.tabIndex}
				ref={ref => (this.divTable = ref)}
				style={{
					pointerEvents: this.props.disabled ? "none" : "auto",
					borderColor: "silver",
					border: "1px",
					width: "100%",
					height: "100%"
				}}
			>
				<div id={this.idTable + "_header"} className="row" />
				<table
					ref={ref => (this.domDataTable = ref)}
					id={this.idTable}
					className={className}
					cellSpacing="0"
				>
					<thead />
					<tbody />
				</table>
			</div>
		);
	}
}

AnterosDataTable.propTypes = {
	id: PropTypes.string,
	dataSource: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.instanceOf(AnterosLocalDatasource),
		PropTypes.instanceOf(AnterosRemoteDatasource)
	]),
	decimalSeparator: PropTypes.string.isRequired,
	thousandsSeparator: PropTypes.string.isRequired,
	height: PropTypes.string,
	width: PropTypes.string,
	pageStart: PropTypes.number,
	pageLength: PropTypes.number,
	pageLengthOptions: PropTypes.arrayOf(PropTypes.number),
	pageType: PropTypes.oneOf([
		"numbers",
		"simple",
		"simple_numbers",
		"full",
		"full_numbers",
		"first_last_numbers"
	]).isRequired,
	dateFormat: PropTypes.oneOf([
		"DD/MM/YYYY",
		"DD-MM-YYYY",
		"MM/DD/YYYY",
		"MM-DD-YYYY",
		"YYYY/MM/DD",
		"YYYY-MM-DD"
	]).isRequired,
	timeFormat: PropTypes.oneOf(["HH:mm:ss", "HH:mm", "hh:mm:ss", "hh:mm"])
		.isRequired,
	initialOrder: PropTypes.array,
	fixedOrder: PropTypes.array,
	initialSearchCondition: PropTypes.string,
	fixedColumnsLeft: PropTypes.number.isRequired,
	fixedColumnsRight: PropTypes.number.isRequired,
	enableOrderByColumn: PropTypes.bool.isRequired,
	enableOrderByMultipleColumns: PropTypes.bool.isRequired,
	enablePaging: PropTypes.bool.isRequired,
	enableSearching: PropTypes.bool.isRequired,
	enableCheckboxSelect: PropTypes.bool.isRequired,
	showLoadingIndicator: PropTypes.bool.isRequired,
	showBorder: PropTypes.bool.isRequired,
	showExportButtons: PropTypes.bool.isRequired,
	showStripedRows: PropTypes.bool.isRequired,
	showHover: PropTypes.bool.isRequired,
	showDetails: PropTypes.bool.isRequired,
	stateSave: PropTypes.bool.isRequired,
	tabIndex: PropTypes.number.isRequired,
	onStateLoaded: PropTypes.func,
	onStateSave: PropTypes.func,
	onStateLoad: PropTypes.func,
	onSelectRecord: PropTypes.func,
	onUnSelectRecord: PropTypes.func,
	onSelectAllRecords: PropTypes.func,
	onUnSelectAllRecords: PropTypes.func,
	onCellClick: PropTypes.func,
	onCellDoubleClick: PropTypes.func,
	onPageChange: PropTypes.func,
	onDoubleClick: PropTypes.func,
	onTableClick: PropTypes.func,
	renderDetails: PropTypes.func,
	primary: PropTypes.bool,
	success: PropTypes.bool,
	info: PropTypes.bool,
	warning: PropTypes.bool,
	danger: PropTypes.bool,
	exportButtonsPrimary: PropTypes.bool,
	exportButtonsSuccess: PropTypes.bool,
	exportButtonsInfo: PropTypes.bool,
	exportButtonsWarning: PropTypes.bool,
	exportButtonsDanger: PropTypes.bool,
	disabled: PropTypes.bool.isRequired
};

AnterosDataTable.defaultProps = {
	height: "100%",
	width: "100%",
	pageLengthChange: true,
	enableOrderByColumn: true,
	enableOrderByMultipleColumns: false,
	enablePaging: true,
	enableSearching: true,
	enableCheckboxSelect: true,
	pageType: "simple_numbers",
	showLoadingIndicator: true,
	fixedColumnsLeft: 0,
	fixedColumnsRight: 0,
	stateSave: false,
	showBorder: true,
	showHover: true,
	showStripedRows: true,
	showDetails: false,
	tabIndex: -1,
	decimalSeparator: ".",
	thousandsSeparator: ",",
	pageLengthOptions: [10, 20, 30, 50, 100],
	dateFormat: "DD/MM/YYYY",
	timeFormat: "HH:mm:ss",
	autoWidth: false,
	showExportButtons: true,
	disabled: false,
	initialOrder: []
};

export class Columns extends Component {
	constructor(props) {
		super(props);
		this.validateChildrens = this.validateChildrens.bind(this);
		this.validateChildrens();
	}

	validateChildrens() {
		let arrChildren = React.Children.toArray(this.props.children);
		arrChildren.forEach(function (child) {
			if (
				child.type &&
				!(child.type.componentName === "AnterosDataTableColumn")
			) {
				throw new AnterosError(
					"Columns de AnterosTable aceita apenas filhos do tipo AnterosTableColumn."
				);
			}
		});
	}

	static get componentName() {
		return "Columns";
	}

	render() {
		return <div />;
	}
}

export class AnterosDataTableColumn extends Component {
	constructor(props) {
		super(props);
		this.idTableColumn = lodash.uniqueId("tableColumn");
	}

	static get componentName() {
		return "AnterosDataTableColumn";
	}

	render() {
		return null;
	}
}

AnterosDataTableColumn.propTypes = {
	align: PropTypes.oneOf(["left", "right", "center"]).isRequired,
	alignCenter: PropTypes.bool.isRequired,
	alignLeft: PropTypes.bool.isRequired,
	alignRight: PropTypes.bool.isRequired,
	titleAlign: PropTypes.oneOf(["left", "right", "center"]).isRequired,
	titleAlignCenter: PropTypes.bool.isRequired,
	titleAlignLeft: PropTypes.bool.isRequired,
	titleAlignRight: PropTypes.bool.isRequired,
	dataField: PropTypes.string.isRequired,
	dataType: PropTypes.oneOf([
		"number",
		"date",
		"date_time",
		"time",
		"boolean",
		"string",
		"image",
		"cep",
		"fone",
		"placa",
		"cpf",
		"cnpj",
		"audio",
		"memo"
	]).isRequired,
	maskFormatNumber: PropTypes.string,
	title: PropTypes.string.isRequired,
	width: PropTypes.string,
	cellTitleClassName: PropTypes.string,
	cellRowClassName: PropTypes.string,
	defaultContent: PropTypes.string,
	render: PropTypes.func,
	orderable: PropTypes.bool.isRequired,
	searchable: PropTypes.bool.isRequired,
	visible: PropTypes.bool.isRequired,
	orderByColumns: PropTypes.arrayOf(PropTypes.string),
	onCreatedCell: PropTypes.func,
	imageWidth: PropTypes.string,
	imageHeight: PropTypes.string,
	imageCircle: PropTypes.bool
};

AnterosDataTableColumn.defaultProps = {
	align: "left",
	alignLeft: true,
	alignCenter: false,
	alignRight: false,
	titleAlign: "left",
	titleAlignLeft: true,
	titleAlignCenter: false,
	titleAlignRight: false,
	width: "50px",
	orderable: true,
	searchable: true,
	visible: true,
	dataType: "string",
	defaultContent: ""
};
