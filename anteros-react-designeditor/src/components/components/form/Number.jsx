import React from 'react';

const Operate = {
  Minus : 1,
  Plus : 2,
}

const _formatter = v => v;
const _parser = v => v;

class Number extends React.Component {

  onChange = (e, type) => {
    const { value, step = 1, min = 0, max = 100, onChange = () => {}, parser = _parser } = this.props;
    let val = e ? parseInt(parser(e.target.value), 10) : value;
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(val)) {
      onChange(0);
      return;
    }
    switch (type) {
      case Operate.Minus:
        val = (val - step) < min ? min : (val - step);
        break;
      case Operate.Plus:
        val = (val + step) > max ? max : (val + step);
        break;
      default:  
    }
    onChange(val);
  }

  onMinus = () => {
    this.onChange(null, Operate.Minus);
  }

  onPlus = () => {
    this.onChange(null, Operate.Plus);
  }

  render() {
    const { value, className, style = {}, formatter = _formatter } = this.props;
    return <div className={className} style={style}>
      <div className="ds-counter-control">
        <a onClick={this.onMinus} className="ds-counter-control-btn">-</a>
        <input className="ds-counter-control-value" value={formatter(value)} onChange={this.onChange} />
        <a onClick={this.onPlus} className="ds-counter-control-btn">+</a>
      </div>
    </div>;
  }
}

export default Number;