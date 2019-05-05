export class AnterosStringBuilder {
	constructor(str) {
		this.s = [];
		this.append(str);
	}

	append(v) {
		if (v) {
			this.s.push(v);
		}
		return this;
	}

	appendLine(v) {
		this.s.push("\r\n");
		if (v) {
			this.s.push(v);
		}
		return this;
	}

	appendFormat() {
		var p = /({?){([^}]+)}(}?)/g;
		var a = arguments,
			v = a[0],
			o = false;
		if (a.length == 2) {
			if (typeof a[1] == "object" && a[1].constructor != String) {
				a = a[1];
				o = true;
			}
		}
		var s = v.split(p);
		var r = [];
		for (var i = 0; i < s.length; i += 4) {
			r.push(s[i]);
			if (s.length > i + 3) {
				if (s[i + 1] == "{" && s[i + 3] == "}") {
					r.push(s[i + 1], s[i + 2], s[i + 3]);
				} else {
					r.push(
						s[i + 1],
						a[o ? s[i + 2] : parseInt(s[i + 2], 10) + 1],
						s[i + 3]
					);
				}
			}
		}
		this.s.push(r.join(""));
	}

	clear() {
		this.s.length = 0;
	}

	toString() {
		return this.s.length === 0 ? "" : this.s.join("");
	}
}

class AnterosStringUtils {
	constructor() {}

	abbreviate(string, maxWidth, offset) {
		if (this.isEmpty(string)) {
			return null;
		}

		if (offset >= 4) {
			return "..." + String(string).substring(offset, maxWidth) + "...";
		}

		return String(string).substring(0, maxWidth) + "...";
	}

	abbreviateMiddle(string, middle, length) {
		if (this.isEmpty(string)) {
			return null;
		}

		string = String(string);

		if (length > 0 && length < string.length) {
			return string.substring(0, length) + middle + string.substring(length);
		}

		return string;
	}

	appendIfMissing(string, suffix, suffixes) {
		var endsWith = false;

		if (this.isEmpty(string)) {
			return string;
		}

		string = String(string);
		suffix = String(suffix);

		if (suffixes !== undefined && suffixes.length > 0) {
			endsWith = suffixes.every(
				function(s) {
					return this.endsWith(string, String(s));
				}.bind(this)
			);
		} else {
			endsWith = this.endsWith(string, suffix);
		}

		return !endsWith ? (string += suffix) : string;
	}

	capitalize(string) {
		if (this.isEmpty(string)) {
			return null;
		}

		string = String(string);

		return string.substring(0, 1).toUpperCase() + string.substring(1);
	}

	chomp(string) {
		var regexp = /[\n\r]{1}$/;

		if (this.isEmpty(string)) {
			return null;
		}

		return string.replace(regexp, "");
	}

	chop(string) {
		if (this.isEmpty(string)) {
			return null;
		}

		return string.indexOf("\r\n") === string.length - 2
			? string.substring(0, string.length - 2)
			: string.substring(0, string.length - 1);
	}

	difference(string, comparison) {
		if (this.isEmpty(string) || isEmpty(comparison)) {
			return null;
		}

		var position = 0,
			stringArray = String(string).split(""),
			comparisonArray = String(comparison).split("");

		stringArray.forEach(function(char, index) {
			if (char === comparisonArray[index]) {
				position = index + 1;
			}
		});

		return comparisonArray.join("").substring(position);
	}

	endsWith(string, suffix) {
		string = String(string);
		suffix = String(suffix);

		return string.indexOf(suffix) === string.length - suffix.length;
	}

	endsWithIgnoreCase(string, suffix) {
		return this.endsWith(
			String(string).toLowerCase(),
			String(suffix).toLowerCase()
		);
	}

	endsWithAny(string, suffixArray) {
		return suffixArray.some(
			function(suffix) {
				return this.endsWith(string, suffix);
			}.bind(this)
		);
	}

	indexOfDifference(string, comparison) {
		return String(string) === String(comparison)
			? -1
			: String(comparison).indexOf(this.difference(string, comparison));
	}

	isAllLowercase(string) {
		if (this.isEmpty(string)) {
			return false;
		}

		return /^[a-z]*$/.test(string);
	}

	isAllUppercase(string) {
		if (this.isEmpty(string)) {
			return false;
		}

		return /^[A-Z]*$/.test(string);
	}

	isAnyEmpty() {
		var stringArray = Array.prototype.slice.call(arguments);

		return stringArray.some(function(string) {
			return this.isEmpty(string);
		});
	}

	isEmpty(string) {
		return string == null || string.length == 0;
	}

	isNoneEmpty() {
		var stringArray = Array.prototype.slice.call(arguments);

		return stringArray.every(function(string) {
			return this.isNotEmpty(String(string));
		});
	}

	isNotEmpty(string) {
		return string !== null && string.length > 0;
	}

	leftPad(string, length, char) {
		var padString = "";

		char = char !== undefined ? String(char) : "";

		for (var i = 0; i < length; i++) {
			if (char.length > 0) {
				padString += String(char);
			} else {
				padString += " ";
			}
		}

		return padString + String(string);
	}

	trim(string) {
		var trimmed = string.replace(/^\s+|\s+$/g, "");
		return trimmed;
	}

	ltrim(string) {
		var trimmed = string.replace(/^\s+/g, "");
		return trimmed;
	}

	rtrim(string) {
		var trimmed = string.replace(/\s+$/g, "");
		return trimmed;
	}

	normalizeSpace(string) {
		return String(string)
			.replace(/\s\s+/g, " ")
			.trim();
	}

	prependIfMissing(string, prefix, prefixes) {
		var startsWith = false;

		if (this.isEmpty(string)) {
			return string;
		}

		string = String(string);
		prefix = String(prefix);

		if (prefixes !== undefined && prefixes.length > 0) {
			startsWith = prefixes.every(
				function(s) {
					return this.startsWith(string, String(s));
				}.bind(this)
			);
		} else {
			startsWith = this.startsWith(string, prefix);
		}

		return !startsWith ? prefix + string : string;
	}

	removeEnd(string, remove) {
		var position;

		if (this.isEmpty(string)) {
			return null;
		}

		string = String(string);
		remove = String(remove);
		position = string.indexOf(remove);

		if (position === string.length - remove.length) {
			return string.substring(0, position);
		} else {
			return string;
		}
	}

	removeEndIgnoreCase(string, remove) {
		var position, tempString;

		if (this.isEmpty(string)) {
			return null;
		}

		string = String(string);
		tempString = string;
		remove = String(remove).toLowerCase();
		string = string.toLowerCase();
		position = string.indexOf(remove);

		if (position === string.length - remove.length) {
			return tempString.substring(0, position);
		} else {
			return tempString;
		}
	}

	removeStart(string, remove) {
		if (this.isEmpty(string)) {
			return null;
		}

		string = String(string);
		remove = String(remove);

		if (string.indexOf(remove) === 0) {
			return string.substring(remove.length);
		} else {
			return string;
		}
	}

	removeStartIgnoreCase(string, remove) {
		var tempString;

		if (this.isEmpty(string)) {
			return null;
		}

		string = String(string);
		tempString = string;
		remove = String(remove).toLowerCase();
		string = string.toLowerCase();

		if (string.indexOf(remove) === 0) {
			return tempString.substring(remove.length);
		} else {
			return tempString;
		}
	}

	repeat(string, times, separator) {
		var returnString = "";

		if (string === null || string === undefined) {
			return null;
		}

		if (separator !== undefined) {
			for (var i = 0; i < times - 1; i++) {
				returnString += String(string) + separator;
			}

			returnString += String(string);
		} else {
			for (var i = 0; i < times; i++) {
				returnString += String(string);
			}
		}

		return returnString;
	}

	rightPad(string, length, char) {
		var padString = "";

		char = char !== undefined ? String(char) : "";

		for (var i = 0; i < length; i++) {
			if (char.length > 0) {
				padString += String(char);
			} else {
				padString += " ";
			}
		}

		return String(string) + padString;
	}

	startsWith(string, prefix) {
		return String(string).indexOf(String(prefix)) === 0;
	}

	startsWithIgnoreCase(string, prefix) {
		return this.startsWith(
			String(string).toLowerCase(),
			String(prefix).toLowerCase()
		);
	}

	startsWithAny(string, prefixArray) {
		return prefixArray.some(
			function(prefix) {
				return this.startsWith(string, prefix);
			}.bind(this)
		);
	}

	swapCase(string) {
		var returnString = "";

		if (this.isEmpty(string)) {
			return null;
		}

		string.split("").forEach(function(character) {
			if (character === character.toUpperCase()) {
				returnString += character.toLowerCase();
			} else {
				returnString += character.toUpperCase();
			}
		});

		return returnString;
	}

	uncapitalize(string) {
		if (this.isEmpty(string)) {
			return null;
		}

		string = String(string);

		return string.substring(0, 1).toLowerCase() + string.substring(1);
	}

	wrap(string, char) {
		return String(char) + String(string) + String(char);
	}

	format() {
		var formatted = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			var regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi");
			formatted = formatted.replace(regexp, arguments[i]);
		}
		return formatted;
	}

	createStringBuilder() {
		return new AnterosStringBuilder();
	}
}

const instance = new AnterosStringUtils();
export { instance as AnterosStringUtils };
