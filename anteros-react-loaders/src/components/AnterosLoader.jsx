import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosUtils } from 'anteros-react-core';

export default class AnterosLoader extends Component {
  
  static removeType(key) {
    delete Types[key];
  }
  
  static addType(key, nDivs) {
    return (Types[key] = nDivs);
  }

  renderDiv(n) {
    const styles = this.props.styles || {};
    if (this.props.color) {
      styles.backgroundColor = this.props.color;
    }
    return <div key={n} style={styles} />;
  }

  render() {
    const nDivs = range(Types[this.props.type]);
    const classes = AnterosUtils.buildClassNames(
      {
        loader: true,
        ['loader-' + this.props.size]: this.props.size !== 'md',
        'loader-active': this.props.active,
        'loader-hidden': !this.props.active
      },
      this.props.className
    );

    const innerClasses = AnterosUtils.buildClassNames([
      'loader-inner',
      this.props.type,
      this.props.innerClassName
    ]);

    return (
      <div className={classes} style={this.props.style}>
        <div className={innerClasses}>
          {nDivs.map(this.renderDiv.bind(this))}
        </div>
      </div>
    );
  }
}

AnterosLoader.propTypes = {
  type: PropTypes.string,
  active: PropTypes.bool,
  color: PropTypes.string,
  innerClassName: PropTypes.string
};

AnterosLoader.defaultProps = {
  type: 'ball-pulse',
  active: true
};



export var Types = {
  'ball-pulse': 3,
  'ball-grid-pulse': 9,
  'ball-clip-rotate': 1,
  'ball-clip-rotate-pulse': 2,
  'square-spin': 1,
  'ball-clip-rotate-multiple': 2,
  'ball-pulse-rise': 5,
  'ball-rotate': 1,
  'cube-transition': 2,
  'ball-zig-zag': 2,
  'ball-zig-zag-deflect': 2,
  'ball-triangle-path': 3,
  'ball-scale': 1,
  'line-scale': 5,
  'line-scale-party': 4,
  'ball-scale-multiple': 3,
  'ball-pulse-sync': 3,
  'ball-beat': 3,
  'line-scale-pulse-out': 5,
  'line-scale-pulse-out-rapid': 5,
  'ball-scale-ripple': 1,
  'ball-scale-ripple-multiple': 3,
  'ball-spin-fade-loader': 8,
  'line-spin-fade-loader': 8,
  'triangle-skew-spin': 1,
  pacman: 5,
  'ball-grid-beat': 9,
  'semi-circle-spin': 1
};

function range(x) {
  let i = -1,
    arr = [];
  while (++i < x) {
    arr.push(i);
  }
  return arr;
}
