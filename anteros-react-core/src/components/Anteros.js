"use strict";

class AnterosDefaults {
	constructor() {
		this._enterTab = this._enterTab.bind(this);
		this._dataSourceDatetimeFormat = "YYYY-MM-DDTHH:mm:ss.SSS";
		this._displayDatetimeFormat = "DD/MM/YYYY HH:mm:ss";
		this._displayDateFormat = "DD/MM/YYYY";
		this._displayTimeFormat = "HH:mm:ss";
		this._enableEnterTab = true;
		this._enterTab();
	}

	get dataSourceDatetimeFormat() {
		return this._dataSourceDatetimeFormat;
	}

	set dataSourceDatetimeFormat(value) {
		this._dataSourceDatetimeFormat = value;
	}

	get displayDatetimeFormat() {
		return this._displayDatetimeFormat;
	}

	set displayDatetimeFormat(value) {
		this._displayDatetimeFormat = value;
	}

	get displayDateFormat() {
		return this._displayDateFormat;
	}

	set displayDateFormat(value) {
		this._displayDateFormat = value;
	}

	get displayTimeFormat() {
		return this._displayTimeFormat;
	}

	set displayTimeFormat(value) {
		this._displayTimeFormat = value;
	}

	get enableEnterTab() {
		return this._enableEnterTab;
	}

	set enableEnterTab(value) {
		this._enableEnterTab = value;
	}

	_enterTab() {
		if (window && window.$) {
			let _this = this;
			window.$(document).keydown(function (e) {
				if (_this._enableEnterTab) {
					// Set self as the current item in focus
					var self = window.$(":focus"),
						// Set the form by the current item in focus
						form = self.parents("form:eq(0)"),
						focusable;

					// Array of Indexable/Tab-able items
					focusable = form
						.find("input,select,textarea,div[contenteditable=true]")
						.filter(":visible :not([disabled])");

					function enterKey() {
						if (
							(e.which === 13 || e.keyCode == 38 || e.keyCode == 40) &&
							!self.is("textarea,div[contenteditable=true]")
						) {
							// [Enter] key

							// If not a regular hyperlink/button/textarea
							if (window.$.inArray(self, focusable) && !self.is("a,button")) {
								// Then prevent the default [Enter] key behaviour from submitting the form
								e.preventDefault();
							} // Otherwise follow the link/button as by design, or put new line in textarea

							// Focus on the next item (either previous or next depending on shift)
							focusable
								.eq(
									focusable.index(self) + (e.shiftKey || e.keyCode == 38 ? -1 : 1)
								)
								.focus();

							return false;
						}
					}
					// We need to capture the [Shift] key and check the [Enter] key either way.
					if (e.shiftKey) {
						enterKey();
					} else {
						enterKey();
					}
				}
			});
		}
	}
}

var Anteros = new AnterosDefaults();

export default Anteros;