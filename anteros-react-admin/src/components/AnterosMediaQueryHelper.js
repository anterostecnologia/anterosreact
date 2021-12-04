import PropTypes from 'prop-types'

const stringOrNumber = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
])

// properties that match media queries
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

  height: PropTypes.any,
  deviceHeight: PropTypes.any,

  width: PropTypes.any,
  deviceWidth: PropTypes.any,

  color: PropTypes.bool,

  colorIndex: PropTypes.bool,

  monochrome: PropTypes.bool,
  resolution: PropTypes.any,
}

// media features
const features = {
  minAspectRatio: PropTypes.string,
  maxAspectRatio: PropTypes.string,
  minDeviceAspectRatio: PropTypes.string,
  maxDeviceAspectRatio: PropTypes.string,

  minHeight: PropTypes.any,
  maxHeight: PropTypes.any,
  minDeviceHeight: PropTypes.any,
  maxDeviceHeight: PropTypes.any,

  minWidth: PropTypes.any,
  maxWidth: PropTypes.any,
  minDeviceWidth: PropTypes.any,
  maxDeviceWidth: PropTypes.any,

  minColor: PropTypes.number,
  maxColor: PropTypes.number,

  minColorIndex: PropTypes.number,
  maxColorIndex: PropTypes.number,

  minMonochrome: PropTypes.number,
  maxMonochrome: PropTypes.number,

  minResolution: PropTypes.any,
  maxResolution: PropTypes.any,

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

export default {
  all: all,
  types: types,
  matchers: matchers,
  features: features
}