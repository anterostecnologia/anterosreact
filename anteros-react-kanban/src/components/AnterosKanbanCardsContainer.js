import React, { Component } from 'react';
import { DropTarget, DragSource } from 'react-dnd';
import PropTypes from 'prop-types';
import AnterosKanbanCards from './AnterosKanbanCards';

const listSource = {
  beginDrag(props) {
    return {
      id: props.id,
      x: props.x
    };
  },
  endDrag(props) {
    props.stopScrolling();
  }
};

const listTarget = {
  canDrop() {
    return false;
  },
  hover(props, monitor) {
    if (!props.isScrolling) {
      if (window.innerWidth - monitor.getClientOffset().x < 200) {
        props.startScrolling('toRight');
      } else if (monitor.getClientOffset().x < 200) {
        props.startScrolling('toLeft');
      }
    } else {
      if (window.innerWidth - monitor.getClientOffset().x > 200 &&
        monitor.getClientOffset().x > 200
      ) {
        props.stopScrolling();
      }
    }
    const { id: listId } = monitor.getItem();
    const { id: nextX } = props;
    if (listId !== nextX) {
      props.moveList(listId, props.x);
    }
  }
};

const collectTarget = function (connectDragSource) {
  return { connectDropTarget: connectDragSource.dropTarget() }
};

const collectSource = function (connectDragSource, monitor) {
  return {
    connectDragSource: connectDragSource.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class AnterosKanbanCardsContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cardComponent, connectDropTarget, connectDragSource, item, x, moveCard, isDragging, backgroundColorTitle, fontColorTitle, centerTitle, renderTitle } = this.props;
    const opacity = isDragging ? 0.5 : 1;

    let styleHeader = {};
    if (backgroundColorTitle) {
      styleHeader = { ...styleHeader, backgroundColor: backgroundColorTitle };
    }

    if (fontColorTitle) {
      styleHeader = { ...styleHeader, color: fontColorTitle };
    }

    if (centerTitle) {
      styleHeader = { ...styleHeader, textAlign: "center" };
    }

    if (this.props.opacity) {
      styleHeader = { ...styleHeader, opacity: this.props.opacity };
    }

    let divTitle = <div className="desk-name">{this.props.title}</div>;
    if (renderTitle) {
      divTitle = renderTitle(this.props.title);
    }



    return connectDragSource(connectDropTarget(
      <div className="desk" style={{ opacity, height: this.props.height, width: this.props.width }}>
        <div className="desk-head" style={styleHeader}>
          {divTitle}
        </div>
        <AnterosKanbanCards
          moveCard={moveCard}
          dataFieldValue={this.props.dataFieldValue}
          x={x}
          cards={this.props.cards}
          cardComponent={cardComponent}
          startScrolling={this.props.startScrolling}
          stopScrolling={this.props.stopScrolling}
          isScrolling={this.props.isScrolling}
          onBeginDragCard={this.props.onBeginDragCard}
          onEndDragCard={this.props.onEndDragCard}
          onHoverCard={this.props.onHoverCard}
          onClickCard={this.props.onClickCard}
        />
      </div>
    ));
  }
}


AnterosKanbanCardsContainer.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  cards: PropTypes.array,
  title: PropTypes.string,
  x: PropTypes.number,
  moveCard: PropTypes.func.isRequired,
  isDragging: PropTypes.bool,
  startScrolling: PropTypes.func,
  stopScrolling: PropTypes.func,
  isScrolling: PropTypes.bool
}



AnterosKanbanCardsContainer = DropTarget('list', listTarget, collectTarget)(AnterosKanbanCardsContainer);
AnterosKanbanCardsContainer = DragSource('list', listSource, collectSource)(AnterosKanbanCardsContainer);

export default AnterosKanbanCardsContainer;
