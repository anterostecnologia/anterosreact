import React from 'react';
import classnames from 'classnames';


export default ({ addOn, value, className, style = {}, onChange = () => {} }) => (
  <div style={style} className={classnames("input-group", className)}>
    {addOn && <div className="input-group-prepend">
      <span className="input-group-text">{addOn}</span>
    </div>}
    <input type="text" style={addOn ? {} : { borderRadius: '0.25rem' }} value={value} onChange={onChange} className="form-control" />
  </div>
);
