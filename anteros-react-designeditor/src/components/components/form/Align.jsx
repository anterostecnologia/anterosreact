import React from 'react';
import classnames from 'classnames';


class Align extends React.Component {
  render() {
    const { align, onChange } = this.props;
    return <div className="align-item">
      <a className={classnames({ active: align === 'left' })} onClick={() => { onChange('left'); }}>
        <i className="fal fa-align-left" />
      </a>
      <a className={classnames({ active: align === 'center' })} onClick={() => { onChange('center'); }}>
        <i className="fal fa-align-center" />
      </a>
      <a className={classnames({ active: align === 'right' })} onClick={() => { onChange('right'); }}>
        <i className="fal fa-align-right" />
      </a>
    </div>;
  }
}


export default Align;