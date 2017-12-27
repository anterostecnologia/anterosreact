'use strict';

var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

class AnterosObjectUtils {
    constructor() {

    }

    /**
    * Get the property of an object nested in one or more objects
    * given an object such as a.b.c.d = 5, getNestedProperty(a, "b.c.d") will return 5.
    * @param {Object} object the object to get the property from
    * @param {String} property the path to the property as a string
    * @returns the object or the the property value if found
    */
    getNestedProperty(object, property) {
        if (object && typeof object == "object") {
            if (typeof property == "string" && property !== "") {
                var split = property.split(".");
                return split.reduce(function (obj, prop) {
                    return obj && obj[prop];
                }, object);
            } else if (typeof property == "number") {
                return object[property];
            } else {
                return object;
            }
        } else {
            return object;
        }
    }

    /**
     * Tell if a nested object has a given property (or array a given index)
     * given an object such as a.b.c.d = 5, hasNestedProperty(a, "b.c.d") will return true.
     * It also returns true if the property is in the prototype chain.
     * @param {Object} object the object to get the property from
     * @param {String} property the path to the property as a string
     * @param {Object} options:
     *  - own: set to reject properties from the prototype
     * @returns true if has (property in object), false otherwise
     */
    hasNestedProperty(object, property, options) {
        options = options || {};

        if (object && typeof object == "object") {
            if (typeof property == "string" && property !== "") {
                var split = property.split(".");
                return split.reduce(function (obj, prop, idx, array) {
                    if (idx == array.length - 1) {
                        if (options.own) {
                            return !!(obj && obj.hasOwnProperty(prop));
                        } else {
                            return !!(obj !== null && typeof obj == "object" && prop in obj);
                        }
                    }
                    return obj && obj[prop];
                }, object);
            } else if (typeof property == "number") {
                return property in object;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Set the property of an object nested in one or more objects
     * If the property doesn't exist, it gets created.
     * @param {Object} object
     * @param {String} property
     * @param value the value to set
     * @returns object if no assignment was made or the value if the assignment was made
     */
    setNestedProperty(object, property, value) {
        if (object && typeof object == "object") {
            if (typeof property == "string" && property !== "") {
                var split = property.split(".");
                return split.reduce(function (obj, prop, idx) {
                    obj[prop] = obj[prop] || {};
                    if (split.length == (idx + 1)) {
                        obj[prop] = value;
                    }
                    return obj[prop];
                }, object);
            } else if (typeof property == "number") {
                object[property] = value;
                return object[property];
            } else {
                return object;
            }
        } else {
            return object;
        }
    }

    /**
     * Tell if an object is on the path to a nested property
     * If the object is on the path, and the path exists, it returns true, and false otherwise.
     * @param {Object} object to get the nested property from
     * @param {String} property name of the nested property
     * @param {Object} objectInPath the object to check
     * @param {Object} options:
     *  - validPath: return false if the path is invalid, even if the object is in the path
     * @returns {boolean} true if the object is on the path
     */
    isInNestedProperty(object, property, objectInPath, options) {
        options = options || {};

        if (object && typeof object == "object") {
            if (typeof property == "string" && property !== "") {
                var split = property.split("."),
                    isIn = false,
                    pathExists;

                pathExists = !!split.reduce(function (obj, prop) {
                    isIn = isIn || obj === objectInPath || (!!obj && obj[prop] === objectInPath);
                    return obj && obj[prop];
                }, object);

                if (options.validPath) {
                    return isIn && pathExists;
                } else {
                    return isIn;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }

    encodeBase64(str){
        return Base64.encode(str);
    }

    decodeBase64(str){
        return Base64.decode(str);
    }



}





const instance = new AnterosObjectUtils();
export { instance as AnterosObjectUtils };