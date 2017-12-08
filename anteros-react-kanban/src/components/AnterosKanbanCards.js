import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import lodash from 'lodash';
import Card from './AnterosKanbanDraggableCard';

const specs = {
  drop(props, monitor, component) {
    document.getElementById(monitor.getItem().id).style.display = 'block';
    const { placeholderIndex } = component.state;
    const lastX = monitor.getItem().x;
    const lastY = monitor.getItem().y;
    const nextX = props.x;
    let nextY = placeholderIndex;

    if (lastY > nextY) {
      nextY += 1;
    } else if (lastX !== nextX) {
      nextY += 1;
    }

    if (lastX === nextX && lastY === nextY) {
      return;
    }

    let positionTo = -1;
    if ((placeholderIndex >= 0) && (placeholderIndex < props.cards.length)) {
      positionTo = props.cards[placeholderIndex].index;
    }
    const positionFrom = monitor.getItem().index;
    const from = monitor.getItem().dataFieldValue;
    const to = component.props.dataFieldValue;
    props.moveCard(monitor.getItem().item, from, to, positionFrom, positionTo);
  },
  hover(props, monitor, component) {
    let placeholderIndex = -1;
    var children = findDOMNode(component).children;
    let y = monitor.getClientOffset().y;
    for (let i = 0; i < children.length; i++) {
      if (i == 0) {
        if (y >= children[i].getBoundingClientRect().top && y <= children[i].getBoundingClientRect().bottom) {
          placeholderIndex = i;
          break;
        }
      }
      else {
        let value = Math.floor(children[i].getBoundingClientRect().top + (children[i].getBoundingClientRect().bottom - children[i].getBoundingClientRect().top) / 2);
        if (y >= value && y <= children[i].getBoundingClientRect().bottom) {
          placeholderIndex = i;
          break;
        }
      }
    }

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
    const item = monitor.getItem();
    component.setState({ placeholderIndex });
    document.getElementById(item.id).style.display = 'none';
  }
};


const collectSource = function (connectDragSource, monitor) {
  return {
    connectDropTarget: connectDragSource.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    item: monitor.getItem()
  }
}

class AnterosKanbanCards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      placeholderIndex: undefined,
      isScrolling: false,
    };
    this.cardsId = lodash.uniqueId('cards');
  }

  render() {
    const { connectDropTarget, x, cards, isOver, canDrop, cardComponent } = this.props;
    const { placeholderIndex } = this.state;


    let isPlaceHold = false;
    let cardList = [];
    cards.forEach((card, i) => {
      if (isOver && canDrop) {
        isPlaceHold = false;
        if (i === 0 && placeholderIndex === -1) {
          cardList.push(<div key="placeholder" className="item placeholder" />);
        } else if (placeholderIndex > i) {
          isPlaceHold = true;
        }
      }
      if (isOver && canDrop && placeholderIndex === i) {
        cardList.push(<div key="placeholder" className="item placeholder" />);
      }

      if (card !== undefined) {
        cardList.push(React.createElement(Card,
          {
            x: x, y: i, dataFieldValue: this.props.dataFieldValue,
            item: card.item,
            key: card.item.id,
            index: card.index,
            id: this.cardsId + "_" + card.item.id,
            cardComponent: this.props.cardComponent,
            stopScrolling: this.props.stopScrolling,
            onBeginDragCard: this.props.onBeginDragCard,
            onEndDragCard: this.props.onEndDragCard,
            onHoverCard: this.props.onHoverCard,
            onClickCard: this.props.onClickCard
          }));
      }

    });

    if (isPlaceHold) {
      cardList.push(<div key="placeholder" className="item placeholder" />);
    }
    if (isOver && canDrop && cards.length === 0) {
      cardList.push(<div key="placeholder" className="item placeholder" />);
    }

    return connectDropTarget(
      <div className="desk-items" id={this.cardsId} ref={ref => this.cardsDiv = ref}>
        {cardList}
      </div>
    );
  }
}

AnterosKanbanCards.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  moveCard: PropTypes.func.isRequired,
  cards: PropTypes.array.isRequired,
  x: PropTypes.number.isRequired,
  isOver: PropTypes.bool,
  item: PropTypes.object,
  canDrop: PropTypes.bool,
  startScrolling: PropTypes.func,
  stopScrolling: PropTypes.func,
  isScrolling: PropTypes.bool,
  cardComponent: PropTypes.any.isRequired
}


export default DropTarget('card', specs, collectSource)(AnterosKanbanCards)