import React from 'react';
import classnames from 'classnames';

class Selector extends React.Component {

  componentDidMount() {
    const { onRef = () => { } } = this.props;
    if (this.dragDom) {
      onRef(this.dragDom);
    }
  }
  render() {
    const { placeholder = "Linha", type = "row", onDelete = () => { }, onCopy = () => { } } = this.props;
    return <div className="ds-layer-selector">
      <div className="ds-layer-type">{placeholder}</div>
      <div
        ref={dom => { this.dragDom = dom; }}
        className={classnames("ds-layer-drag", type === 'row' ? 'ds-layer-drag-rows' : 'ds-layer-drag-contents')}
      >
        <i className='fal fa-expand-arrows' />
      </div>
      <div className="ds-layer-controls ds-layer-controls-rows">
        <div style={{ display: 'inline' }}>
          <a className="ds-layer-control ds-delete" onClick={onDelete}>
            <i className="fal fa-trash" />
          </a>
        </div>
        <div style={{ display: 'inline' }}>
          <a className="ds-layer-control" onClick={onCopy}>
            <i className="fal fa-copy" />
          </a>
        </div>
      </div>
    </div>;
  }
}


export default Selector;