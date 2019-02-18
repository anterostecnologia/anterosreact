import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';


function getStyles(isDragging) {
  return {
    display: isDragging ? 0.5 : 1
  };
}

const cardSource = {
  beginDrag(props, monitor, component) {
    const { item, x, y, dataFieldValue, index, id } = props;
    const { title } = item;
    const { clientWidth, clientHeight } = findDOMNode(component);

    if (props.onBeginDragCard){
      props.onBeginDragCard(item);
    }

    return { id, title, item, x, y, index, clientWidth, clientHeight, dataFieldValue };
  },
  endDrag(props, monitor) {
    props.stopScrolling();
    if (props.onEndDragCard){
      props.onEndDragCard(props.item);
    }
  },
  isDragging(props, monitor) {
    const isDragging = props.item && props.item.id === monitor.getItem().id;
    return isDragging;
  }
};

const OPTIONS = {
  arePropsEqual: function arePropsEqual(props, otherProps) {
    let isEqual = true;
    if (props.item.id === otherProps.item.id &&
        props.x === otherProps.x &&
        props.y === otherProps.y
       ) {
      isEqual = true;
    } else {
      isEqual = false;
    }
    return isEqual;
  }
};

function collectDragSource(connectDragSource, monitor) {
  return {
    connectDragSource: connectDragSource.dragSource(),
    connectDragPreview: connectDragSource.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

class AnterosKanbanCardComponent extends Component {
  constructor(props){
    super(props);
    this.onClickCard = this.onClickCard.bind(this);
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    });
  }

  onClickCard(event){
    event.preventDefault();
    if (this.props.onClickCard){
      this.props.onClickCard(this.props.item);
    }
  }

  render() {
    const { isDragging, connectDragSource, item, cardComponent, id } = this.props;
    const DynamicComponent = cardComponent;

    return connectDragSource(
      <div onClick={this.onClickCard}>
        <DynamicComponent style={getStyles(isDragging)} item={item} id={id} />
      </div>
    );
  }
}


AnterosKanbanCardComponent.propTypes = {
    item: PropTypes.object,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number,
    id: PropTypes.string,
    stopScrolling: PropTypes.func,
    cardComponent: PropTypes.any.isRequired,
    onBeginDragCard: PropTypes.func,
    onEndDragCard: PropTypes.func,
    onHoverCard: PropTypes.func,
    onClickCard: PropTypes.func
  }


  export default DragSource('card', cardSource, collectDragSource, OPTIONS)(AnterosKanbanCardComponent);