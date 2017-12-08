var invariant = require('invariant');
import classNames from "classnames";

const tetherAttachements = [
  'top',
  'bottom',
  'left',
  'right',
  'top left',
  'top center',
  'top right',
  'right top',
  'right middle',
  'right bottom',
  'bottom right',
  'bottom center',
  'bottom left',
  'left top',
  'left middle',
  'left bottom'
];

class AnterosUtils {

  constructor() {

  }
  isArray(input) {
    return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
  }

  isObject(input) {
    // IE8 will treat undefined and null as object if it wasn't for
    // input != null
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
  }

  isNumber(input) {
    return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
  }

  isUndefined(input) {
    return input === void 0;
  }

  zeroFill(number, targetLength, forceSign) {
    var absNumber = '' + Math.abs(number),
      zerosToFill = targetLength - absNumber.length,
      sign = number >= 0;
    return (sign ? (forceSign ? '+' : '') : '-') +
      Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
  }

  parseNumber(value) {
    if (value instanceof Number)
      return value;
    if (this.isUndefined(value))
      return 0;
    var value = new String(value) || "";
    var decimal = '.';
    value = value.replace(/[^0-9$.,]/g, '');
    if (value.indexOf(',') > value.indexOf('.')) decimal = ',';
    if ((value.match(new RegExp("\\" + decimal, "g")) || []).length > 1) decimal = "";
    if (decimal != "" && (value.length - value.indexOf(decimal) - 1 == 3)) decimal = "";
    value = value.replace(new RegExp("[^0-9$" + decimal + "]", "g"), "");
    value = value.replace(',', '.');
    return parseFloat(value);
  }


  formatNumber(value, mask) {
    if (this.isUndefined(value))
      value = 0;

    if (!mask || isNaN(+value)) {
      return value; // return as it is.
    }

    var isNegative, result, decimal, group, posLeadZero, posTrailZero, posSeparator,
      part, szSep, integer,

      // find prefix/suffix
      len = mask.length,
      start = mask.search(/[0-9\-\+#]/),
      prefix = start > 0 ? mask.substring(0, start) : '',
      // reverse string: not an ideal method if there are surrogate pairs
      str = mask.split('').reverse().join(''),
      end = str.search(/[0-9\-\+#]/),
      offset = len - end,
      substr = mask.substring(offset, offset + 1),
      indx = offset + ((substr === '.' || (substr === ',')) ? 1 : 0),
      suffix = end > 0 ? mask.substring(indx, len) : '';

    // mask with prefix & suffix removed
    mask = mask.substring(start, indx);

    // convert any string to number according to formation sign.
    value = mask.charAt(0) === '-' ? -value : +value;
    isNegative = value < 0 ? value = -value : 0; // process only abs(), and turn on flag.

    // search for separator for grp & decimal, anything not digit, not +/- sign, not #.
    result = mask.match(/[^\d\-\+#]/g);
    decimal = (result && result[result.length - 1]) || '.'; // treat the right most symbol as decimal
    group = (result && result[1] && result[0]) || ',';  // treat the left most symbol as group separator

    // split the decimal for the format string if any.
    mask = mask.split(decimal);
    // Fix the decimal first, toFixed will auto fill trailing zero.
    value = value.toFixed(mask[1] && mask[1].length);
    value = +(value) + ''; // convert number to string to trim off *all* trailing decimal zero(es)

    // fill back any trailing zero according to format
    posTrailZero = mask[1] && mask[1].lastIndexOf('0'); // look for last zero in format
    part = value.split('.');
    // integer will get !part[1]
    if (!part[1] || (part[1] && part[1].length <= posTrailZero)) {
      value = (+value).toFixed(posTrailZero + 1);
    }
    szSep = mask[0].split(group); // look for separator
    mask[0] = szSep.join(''); // join back without separator for counting the pos of any leading 0.

    posLeadZero = mask[0] && mask[0].indexOf('0');
    if (posLeadZero > -1) {
      while (part[0].length < (mask[0].length - posLeadZero)) {
        part[0] = '0' + part[0];
      }
    } else if (+part[0] === 0) {
      part[0] = '';
    }

    value = value.split('.');
    value[0] = part[0];

    // process the first group separator from decimal (.) only, the rest ignore.
    // get the length of the last slice of split result.
    posSeparator = (szSep[1] && szSep[szSep.length - 1].length);
    if (posSeparator) {
      integer = value[0];
      str = '';
      offset = integer.length % posSeparator;
      len = integer.length;
      for (indx = 0; indx < len; indx++) {
        str += integer.charAt(indx); // ie6 only support charAt for sz.
        // -posSeparator so that won't trail separator on full length
        /*jshint -W018 */
        if (!((indx - offset + 1) % posSeparator) && indx < len - posSeparator) {
          str += group;
        }
      }
      value[0] = str;
    }
    value[1] = (mask[1] && value[1]) ? decimal + value[1] : '';

    // remove negative sign if result is zero
    result = value.join('');
    if (result === '0' || result === '') {
      // remove negative sign if result is zero
      isNegative = false;
    }

    // put back any negation, combine integer and fraction, and add back prefix & suffix
    return prefix + ((isNegative ? '-' : '') + result) + suffix;
  }


  round(number, decimalPlaces) {
    if (number[1] && decimalPlaces >= 0 && number[1].length > decimalPlaces) {
      //truncate to correct number of decimal places
      var decim = number[1].slice(0, decimalPlaces);
      //if next digit was >= 5 we need to round up
      if (+(number[1].substr(decimalPlaces, 1)) >= 5) {
        //But first count leading zeros as converting to a number will loose them
        var leadingzeros = "";
        while (decim.charAt(0) === "0") {
          leadingzeros = leadingzeros + "0";
          decim = decim.substr(1);
        }
        //Then we can change decim to a number and add 1 before replacing leading zeros
        decim = (+decim + 1) + '';
        decim = leadingzeros + decim;
        if (decim.length > decimalPlaces) {
          //adding one has made it longer
          number[0] = (+number[0] + +decim.charAt(0)) + ''; //add value of firstchar to the integer part
          decim = decim.substring(1);   //ignore the 1st char at the beginning which is the carry to the integer part
        }
      }
      number[1] = decim;
    }
    return number;
  }


  buildClassNames() {
    var classes = [];

    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (!arg) continue;

      var argType = typeof arg;

      if (argType === 'string' || argType === 'number') {
        classes.push(arg);
      } else if (Array.isArray(arg)) {
        classes.push(classNames.apply(null, arg));
      } else if (argType === 'object') {
        for (var key in arg) {
          if (hasOwn.call(arg, key) && arg[key]) {
            classes.push(key);
          }
        }
      }
    }

    return classes.join(' ');
  }

  getTetherAttachments(placement) {
    let attachments = {};
    switch (placement) {
      case 'top':
      case 'top center':
        attachments = {
          attachment: 'bottom center',
          targetAttachment: 'top center'
        };
        break;
      case 'bottom':
      case 'bottom center':
        attachments = {
          attachment: 'top center',
          targetAttachment: 'bottom center'
        };
        break;
      case 'left':
      case 'left center':
        attachments = {
          attachment: 'middle right',
          targetAttachment: 'middle left'
        };
        break;
      case 'right':
      case 'right center':
        attachments = {
          attachment: 'middle left',
          targetAttachment: 'middle right'
        };
        break;
      case 'top left':
        attachments = {
          attachment: 'bottom left',
          targetAttachment: 'top left'
        };
        break;
      case 'top right':
        attachments = {
          attachment: 'bottom right',
          targetAttachment: 'top right'
        };
        break;
      case 'bottom left':
        attachments = {
          attachment: 'top left',
          targetAttachment: 'bottom left'
        };
        break;
      case 'bottom right':
        attachments = {
          attachment: 'top right',
          targetAttachment: 'bottom right'
        };
        break;
      case 'right top':
        attachments = {
          attachment: 'top left',
          targetAttachment: 'top right'
        };
        break;
      case 'right bottom':
        attachments = {
          attachment: 'bottom left',
          targetAttachment: 'bottom right'
        };
        break;
      case 'left top':
        attachments = {
          attachment: 'top right',
          targetAttachment: 'top left'
        };
        break;
      case 'left bottom':
        attachments = {
          attachment: 'bottom right',
          targetAttachment: 'bottom left'
        };
        break;
      default:
        attachments = {
          attachment: 'top center',
          targetAttachment: 'bottom center'
        };
    }

    return attachments;
  }



  // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/js/src/modal.js#L436-L443
  getScrollbarWidth() {
    let scrollDiv = document.createElement('div');
    // .modal-scrollbar-measure styles // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/scss/_modal.scss#L106-L113
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px';
    scrollDiv.style.width = '50px';
    scrollDiv.style.height = '50px';
    scrollDiv.style.overflow = 'scroll';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  setScrollbarWidth(padding) {
    document.body.style.paddingRight = padding > 0 ? `${padding}px` : null;
  }

  isBodyOverflowing() {
    return document.body.clientWidth < window.innerWidth;
  }

  getOriginalBodyPadding() {
    return parseInt(
      window.getComputedStyle(document.body, null).getPropertyValue('padding-right') || 0,
      10
    );
  }

  conditionallyUpdateScrollbar() {
    const scrollbarWidth = this.getScrollbarWidth();
    // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/js/src/modal.js#L420
    const fixedContent = document.querySelectorAll('.navbar-fixed-top, .navbar-fixed-bottom, .is-fixed')[0];
    const bodyPadding = fixedContent ? parseInt(
      fixedContent.style.paddingRight || 0,
      10
    ) : 0;

    if (this.isBodyOverflowing()) {
      this.setScrollbarWidth(bodyPadding + scrollbarWidth);
    }
  }

  mapToCssModules(className, cssModule) {
    if (!cssModule) return className;
    return className.split(' ').map(c => cssModule[c] || c).join(' ');
  }




  /**
  *  createRequest
  *
  *  Creates necessary XHR to use with AJAX apps if possible.
  *  Supports all browsers.
  *
  *  @return XMLHTTPRequest || null
  */
  createRequest() {
    try {
      request = new XMLHttpRequest();
    } catch (tryMS) {
      try {
        request = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (otherMS) {
        try {
          request = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (failed) {
          request = null;
        }
      }
    }

    return request;
  }


  /**
  *  addEventHandler
  *
  *  Attach event handlers the way your browser likes.
  *  NOTE: IE 9 supports DOM Level 2.
  *
  *  @param obj          object to attach to
  *  @param eventName    name of the event
  *  @param handler      handler to run
  *  @return void
  */
  addEventHandler(obj, eventName, handler) {
    if (document.attachEvent) {
      /* For browsers that don't support DOM Level 2. */
      obj.attachEvent("on" + eventName, handler);
    } else if (document.addEventListener) {
      /* For modern browsers. */
      obj.addEventListener(eventName, handler, false);
    }
  }

  objectType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  };
  isDefined(param) {
    return typeof param != "undefined";
  };
  isUndefined(param) {
    return typeof param == "undefined";
  };
  isFunction(param) {
    return typeof param == "function";
  };
  isNumber(param) {
    return typeof param == "number" && !isNaN(param);
  };
  isString(str) {
    return this.objectType(str) === "String";
  };

  closest(target, selector) {
    // closest(e.target, '.field')
    while (target) {
      if (target.matches && target.matches(selector)) return target;
      target = target.parentNode;
    }
    return null;
  };

  getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docElem = document.documentElement;

    // (2)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    // (3)
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    // (4)
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
  };

  getTransformProps(x, y) {
    return {
      transform: 'translate(' + x + 'px, ' + y + 'px)'
    };
  };

  listWithChildren(list, childrenProp) {
    return list.map(item => {
      return {
        ...item,
        [childrenProp]: item[childrenProp]
          ? this.listWithChildren(item[childrenProp], childrenProp)
          : []
      };
    });
  };

  getAllNonEmptyNodesIds(items, childrenProp) {
    let childrenIds = [];
    let ids = items
      .filter(item => item[childrenProp].length)
      .map(item => {
        childrenIds = childrenIds.concat(this.getAllNonEmptyNodesIds(item[childrenProp], childrenProp));
        return item.id;
      });

    return ids.concat(childrenIds);
  };
}

const instance = new AnterosUtils();
export { instance as AnterosUtils };