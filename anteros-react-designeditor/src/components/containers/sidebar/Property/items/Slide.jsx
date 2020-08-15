import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Number } from '../../../../components';

const Slide = ({ title = "Largura", value = 100, attribute = 'width', onUpdate = () => { } }) => (
  <div className="ds-widget ds-link-widget">
    <div className="card-row">
      <div className="ds-widget-label col-6">
        <label className="ds-label-primary"><span>{title}</span></label>
      </div>
      <div className="col-6">
        <Slider
          trackStyle={{ backgroundColor: '#007BFF' }}
          handleStyle={{ borderColor: '#4094EF' }}
          value={value}
          onChange={val => { onUpdate(attribute, val); }}
        />
        <Number max={100} min={0} step={1} value={value} onChange={val => { onUpdate(attribute, val); }} style={{ marginTop: 5 }} />
      </div>
    </div>
  </div>);


export default Slide;