import React, {Component} from 'react';
import PropTypes from 'prop-types';

const matchers = {
    orientation: PropTypes.oneOf([
      'portrait',
      'landscape'
    ]),
  
    scan: PropTypes.oneOf([
      'progressive',
      'interlace'
    ]),
  
    aspectRatio: PropTypes.string,
    deviceAspectRatio: PropTypes.string,
  
    height: stringOrNumber,
    deviceHeight: stringOrNumber,
  
    width: stringOrNumber,
    deviceWidth: stringOrNumber,
  
    color: PropTypes.bool,
  
    colorIndex: PropTypes.bool,
  
    monochrome: PropTypes.bool,
    resolution: stringOrNumber
  }
  
  // media features
  const features = {
    minAspectRatio: PropTypes.string,
    maxAspectRatio: PropTypes.string,
    minDeviceAspectRatio: PropTypes.string,
    maxDeviceAspectRatio: PropTypes.string,
  
    minHeight: stringOrNumber,
    maxHeight: stringOrNumber,
    minDeviceHeight: stringOrNumber,
    maxDeviceHeight: stringOrNumber,
  
    minWidth: stringOrNumber,
    maxWidth: stringOrNumber,
    minDeviceWidth: stringOrNumber,
    maxDeviceWidth: stringOrNumber,
  
    minColor: PropTypes.number,
    maxColor: PropTypes.number,
  
    minColorIndex: PropTypes.number,
    maxColorIndex: PropTypes.number,
  
    minMonochrome: PropTypes.number,
    maxMonochrome: PropTypes.number,
  
    minResolution: stringOrNumber,
    maxResolution: stringOrNumber,
  
    ...matchers
  }
  
  // media types
  const types = {
    all: PropTypes.bool,
    grid: PropTypes.bool,
    aural: PropTypes.bool,
    braille: PropTypes.bool,
    handheld: PropTypes.bool,
    print: PropTypes.bool,
    projection: PropTypes.bool,
    screen: PropTypes.bool,
    tty: PropTypes.bool,
    tv: PropTypes.bool,
    embossed: PropTypes.bool
  }
  
  const all = { ...types, ...features }
  
  // add the type property
  matchers.type = Object.keys(types)

var RE_MEDIA_QUERY     = /^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^\)]+\)))(?:\s*and\s*(.*))?$/i,
    RE_MQ_EXPRESSION   = /^\(\s*([_a-z-][_a-z0-9-]*)\s*(?:\:\s*([^\)]+))?\s*\)$/,
    RE_MQ_FEATURE      = /^(?:(min|max)-)?(.+)/,
    RE_LENGTH_UNIT     = /(em|rem|px|cm|mm|in|pt|pc)?\s*$/,
    RE_RESOLUTION_UNIT = /(dpi|dpcm|dppx)?\s*$/;

function matchQuery(mediaQuery, values) {
    return parseQuery(mediaQuery).some(function (query) {
        var inverse = query.inverse;

        // Either the parsed or specified `type` is "all", or the types must be
        // equal for a match.
        var typeMatch = query.type === 'all' || values.type === query.type;

        // Quit early when `type` doesn't match, but take "not" into account.
        if ((typeMatch && inverse) || !(typeMatch || inverse)) {
            return false;
        }

        var expressionsMatch = query.expressions.every(function (expression) {
            var feature  = expression.feature,
                modifier = expression.modifier,
                expValue = expression.value,
                value    = values[feature];

            // Missing or falsy values don't match.
            if (!value) { return false; }

            switch (feature) {
                case 'orientation':
                case 'scan':
                    return value.toLowerCase() === expValue.toLowerCase();

                case 'width':
                case 'height':
                case 'device-width':
                case 'device-height':
                    expValue = toPx(expValue);
                    value    = toPx(value);
                    break;

                case 'resolution':
                    expValue = toDpi(expValue);
                    value    = toDpi(value);
                    break;

                case 'aspect-ratio':
                case 'device-aspect-ratio':
                case /* Deprecated */ 'device-pixel-ratio':
                    expValue = toDecimal(expValue);
                    value    = toDecimal(value);
                    break;

                case 'grid':
                case 'color':
                case 'color-index':
                case 'monochrome':
                    expValue = parseInt(expValue, 10) || 1;
                    value    = parseInt(value, 10) || 0;
                    break;
            }

            switch (modifier) {
                case 'min': return value >= expValue;
                case 'max': return value <= expValue;
                default   : return value === expValue;
            }
        });

        return (expressionsMatch && !inverse) || (!expressionsMatch && inverse);
    });
}

function parseQuery(mediaQuery) {
    return mediaQuery.split(',').map(function (query) {
        query = query.trim();

        var captures = query.match(RE_MEDIA_QUERY);

        // Media Query must be valid.
        if (!captures) {
            throw new SyntaxError('Invalid CSS media query: "' + query + '"');
        }

        var modifier    = captures[1],
            type        = captures[2],
            expressions = ((captures[3] || '') + (captures[4] || '')).trim(),
            parsed      = {};

        parsed.inverse = !!modifier && modifier.toLowerCase() === 'not';
        parsed.type    = type ? type.toLowerCase() : 'all';

        // Check for media query expressions.
        if (!expressions) {
            parsed.expressions = [];
            return parsed;
        }

        // Split expressions into a list.
        expressions = expressions.match(/\([^\)]+\)/g);

        // Media Query must be valid.
        if (!expressions) {
            throw new SyntaxError('Invalid CSS media query: "' + query + '"');
        }

        parsed.expressions = expressions.map(function (expression) {
            var captures = expression.match(RE_MQ_EXPRESSION);

            // Media Query must be valid.
            if (!captures) {
                throw new SyntaxError('Invalid CSS media query: "' + query + '"');
            }

            var feature = captures[1].toLowerCase().match(RE_MQ_FEATURE);

            return {
                modifier: feature[1],
                feature : feature[2],
                value   : captures[2]
            };
        });

        return parsed;
    });
}

function toDecimal(ratio) {
    var decimal = Number(ratio),
        numbers;

    if (!decimal) {
        numbers = ratio.match(/^(\d+)\s*\/\s*(\d+)$/);
        decimal = numbers[1] / numbers[2];
    }

    return decimal;
}

function toDpi(resolution) {
    var value = parseFloat(resolution),
        units = String(resolution).match(RE_RESOLUTION_UNIT)[1];

    switch (units) {
        case 'dpcm': return value / 2.54;
        case 'dppx': return value * 96;
        default    : return value;
    }
}

function toPx(length) {
    var value = parseFloat(length),
        units = String(length).match(RE_LENGTH_UNIT)[1];

    switch (units) {
        case 'em' : return value * 16;
        case 'rem': return value * 16;
        case 'cm' : return value * 96 / 2.54;
        case 'mm' : return value * 96 / 2.54 / 10;
        case 'in' : return value * 96;
        case 'pt' : return value * 72;
        case 'pc' : return value * 72 / 12;
        default   : return value;
    }
}


var dynamicMatch = typeof window !== 'undefined' ? window.matchMedia : null;


function Mql(query, values, forceStatic){
  var self = this;
  if(dynamicMatch && !forceStatic){
    var mql = dynamicMatch.call(window, query);
    this.matches = mql.matches;
    this.media = mql.media;
    mql.addListener(update);
  } else {
    this.matches = matchQuery(query, values);
    this.media = query;
  }

  this.addListener = addListener;
  this.removeListener = removeListener;
  this.dispose = dispose;

  function addListener(listener){
    if(mql){
      mql.addListener(listener);
    }
  }

  function removeListener(listener){
    if(mql){
      mql.removeListener(listener);
    }
  }

  function update(evt){
    self.matches = evt.matches;
    self.media = evt.media;
  }

  function dispose(){
    if(mql){
      mql.removeListener(update);
    }
  }
}

function matchMedia(query, values, forceStatic){
  return new Mql(query, values, forceStatic);
}

var uppercasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
var cache = {};

function hyphenateStyleName(string) {
    return string in cache
    ? cache[string]
    : cache[string] = string
      .replace(uppercasePattern, '-$&')
      .toLowerCase()
      .replace(msPattern, '-ms-');
}

const defaultTypes = {
  component: PropTypes.node,
  query: PropTypes.string,
  values: PropTypes.shape(matchers),
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.func ]),
  onChange: PropTypes.func,
  onBeforeChange: PropTypes.func
}
const mediaKeys = Object.keys(all)
const excludedQueryKeys = Object.keys(defaultTypes)
const excludedPropKeys = excludedQueryKeys.concat(mediaKeys)

function omit(object, keys) {
  const newObject = { ...object }
  keys.forEach(key => delete newObject[key])
  return newObject
}

const stringOrNumber = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
  
  


  const negate = cond => `not ${cond}`

  function keyVal(k, v) {
    const realKey = hyphenateStyleName(k)
  
    // px shorthand
    if (typeof v === 'number') {
      v = `${v}px`
    }
    if (v === true) {
      return k
    }
    if (v === false) {
      return negate(k)
    }
    return `(${realKey}: ${v})`
  }
  
  function join(conds) {
    return conds.join(' and ')
  }
  
 function toQuery(obj) {
    const rules = []
    Object.keys(all).forEach(function (k) {
      const v = obj[k]
      if (v != null) {
        rules.push(keyVal(k, v))
      }
    })
    return join(rules)
  }

export default class AnterosMediaQuery extends Component {
  
  constructor(props){
      super(props);
      this.removeMql = this.removeMql.bind(this);
      this.updateMatches = this.updateMatches.bind(this);

      this.state = { matches: false };
  }  

  componentWillMount() {
    this.updateQuery(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.updateQuery(nextProps)
  }

  updateQuery(props) {
    let values
    if (props.query) {
      this.query = props.query
    } else {
      this.query = toQuery(omit(props, excludedQueryKeys))
    }

    if (!this.query) {
      throw new Error('Invalid or missing MediaQuery!')
    }

    if (props.values) {
      values = Object.keys(props.values)
        .reduce(function (result, key) {
          result[hyphenateStyleName(key)] = props.values[key]
          return result
        }, {})
    }

    this.removeMql()

    this._mql = matchMedia(this.query, values)
    this._mql.addListener(this.updateMatches)
    this.updateMatches()
  }

  componentWillUpdate(_, nextState) {
    if(this.props.onBeforeChange && this.state.matches !== nextState.matches) {
      this.props.onBeforeChange(this.state.matches)
    }
  }

  componentDidUpdate(_, prevState) {
    if(this.props.onChange && prevState.matches !== this.state.matches) {
      this.props.onChange(this.state.matches)
    }
  }

  componentWillUnmount() {
    this.removeMql();
  }

  updateMatches() {
    if (this._mql.matches === this.state.matches) {
      return
    }
    this.setState({
      matches: this._mql.matches
    })
  }

  removeMql(){
    if (this._mql) {
      this._mql.removeListener(this.updateMatches)
      this._mql.dispose()
    }
  }

  render() {
    if(typeof this.props.children === 'function') {
      return this.props.children(this.state.matches)
    }

    if (this.state.matches === false) {
      return null
    }
    const props = omit(this.props, excludedPropKeys)
    const hasMergeProps = Object.keys(props).length > 0
    const childrenCount = React.Children.count(this.props.children)
    const wrapChildren = this.props.component || this.props.children == null || (hasMergeProps && childrenCount > 1)
    if (wrapChildren) {
      return React.createElement(
        this.props.component || 'div',
        props,
        this.props.children
      )
    } else if (hasMergeProps) {
      return React.cloneElement(
        this.props.children,
        props
      )
    } else if (childrenCount) {
      return this.props.children
    }
    else {
      return null
    }
  }
}

AnterosMediaQuery.defaultProps = {
    values: {}
}

