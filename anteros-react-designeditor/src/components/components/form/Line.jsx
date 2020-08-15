import React from 'react';
import ColorPicker from 'rc-color-picker';
import 'rc-color-picker/assets/index.css';
import Number from './Number';
import { rgb2rgba, rgba2rgb } from '../../lib/util';

export default ({ lineWidth, lineStyle, lineColor, onUpdate }) => {
  const rgba = rgba2rgb(lineColor);
  return <React.Fragment>
    <select className="form-control" value={lineStyle} onChange={e => { onUpdate('lineStyle', e.target.value); }}>
      <option value="solid">Sólido</option>
      <option value="dotted">Pontilhado</option>
      <option value="dashed">Tracejado</option>
    </select>
    <div style={{ marginTop: 5 }}>
      <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
        <Number max={20} min={1} step={1} value={lineWidth} onChange={val => { onUpdate('lineWidth', val); }} />
      </div>
      <div style={{ display: 'inline-block', marginLeft: 30 }}>
        <ColorPicker color={rgba.rgb} alpha={rgba.alpha} onChange={e => { onUpdate('lineColor', rgb2rgba(e.color, e.alpha)); }} />
      </div>
    </div>
  </React.Fragment>;
};
