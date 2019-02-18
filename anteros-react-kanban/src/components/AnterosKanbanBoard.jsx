import React, { Component} from 'react';
import { DragDropContext, DragLayer, DropTarget, DragSource } from 'react-dnd';
import HTML5Backend, { getEmptyImage } from 'react-dnd-html5-backend';
import { AnterosDatasource, AnterosRemoteDatasource, AnterosLocalDatasource, dataSourceEvents } from "anteros-react-datasource";
import AnterosKanbanCardsContainer from './AnterosKanbanCardsContainer';
import AnterosKanbanCustomDragLayer from './AnterosKanbanCustomDragLayer';
import PropTypes from 'prop-types';

const DATASOURCE_EVENTS = [
    dataSourceEvents.AFTER_OPEN,
    dataSourceEvents.AFTER_DELETE];

class AnterosKanbanBoard extends Component {
    constructor(props) {
        super(props);
        this.moveCard = this.moveCard.bind(this);
        this.scrollRight = this.scrollRight.bind(this);
        this.scrollLeft = this.scrollLeft.bind(this);
        this.stopScrolling = this.stopScrolling.bind(this);
        this.startScrolling = this.startScrolling.bind(this);
        this.state = { isScrolling: false };
        this.lists = [];
        this.getCardsByColumnValue = this.getCardsByColumnValue.bind(this);
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }

    onDatasourceEvent(event){
        this.setState({ isScrolling: false }, clearInterval(this.scrollInterval));
    }

    componentDidMount(){
        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            this.props.dataSource.addEventListener(DATASOURCE_EVENTS, this.onDatasourceEvent);
        }
    }

    componentWillUnmount() {
        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            this.props.dataSource.removeEventListener(DATASOURCE_EVENTS, this.onDatasourceEvent);
        }
    }

    startScrolling(direction) {
        switch (direction) {
            case 'toLeft':
                this.setState({ isScrolling: true }, this.scrollLeft());
                break;
            case 'toRight':
                this.setState({ isScrolling: true }, this.scrollRight());
                break;
            default:
                break;
        }
    }

    scrollRight() {
        function scroll() {
            document.getElementsByTagName('kanban')[0].scrollLeft += 10;
        }
        this.scrollInterval = setInterval(scroll, 10);
    }

    scrollLeft() {
        function scroll() {
            document.getElementsByTagName('kanban')[0].scrollLeft -= 10;
        }
        this.scrollInterval = setInterval(scroll, 10);
    }

    stopScrolling() {
        this.setState({ isScrolling: false }, clearInterval(this.scrollInterval));
    }

    moveObjectAtIndex(array, sourceIndex, destIndex) {
        var placeholder = {};
        var objectToMove = array.splice(sourceIndex, 1, placeholder)[0];
        array.splice(destIndex, 0, objectToMove);
        array.splice(array.indexOf(placeholder), 1);
    }

    moveCard(item, from, to, positionFrom, positionTo) {
        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            if (positionTo==-1){
                positionTo = this.props.dataSource.getTotalRecords()-1;
            }
            this.moveObjectAtIndex(this.props.dataSource.getData(),positionFrom,positionTo);
            this.props.dataSource.gotoRecordByData(item);
            this.props.dataSource.edit();
            this.props.dataSource.setFieldByName(this.props.dataFieldColumn,to);            
            this.props.dataSource.post();
            
        } else {
            if (positionTo==-1){
                positionTo = this.props.dataSource.length-1;
            }
            this.moveObjectAtIndex(this.props.dataSource,positionFrom,positionTo);
            item[this.props.dataFieldColumn] = to;
        }
       
       this.setState({ isScrolling: false }, clearInterval(this.scrollInterval));
    }

    getCardsByColumnValue(value) {
        let _this = this;
        let data = [];
        if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
            data = this.props.dataSource.getData();
        } else {
            data = this.props.dataSource;
        }
        let cards = [];
        let index = 0;
        data.forEach(function (item) {
            if (value == item[_this.props.dataFieldColumn])
                cards.push({index:index,item:item});
            index++;
        });
        return cards;
    }

    render() {
        let _this = this;
        let i = 0;
        const children = React.Children.map(this.props.children,
            (child, index) => React.cloneElement(child, {
                moveCard: _this.moveCard,
                startScrolling: _this.startScrolling,
                stopScrolling: _this.stopScrolling,
                isScrolling: _this.state.isScrolling,
                index: index,
                cardComponent: _this.props.cardComponent,
                height: _this.props.columnHeight,
                onBeginDragCard:this.props.onBeginDragCard,
                onEndDragCard:this.props.onEndDragCard,
                onHoverCard:this.props.onHoverCard,
                onClickCard:this.props.onClickCard,
                cards: _this.getCardsByColumnValue(child.props.dataFieldValue)
            })
        );
        return (
            <div className="kanban" style={{height:this.props.height}}>
                <AnterosKanbanCustomDragLayer snapToGrid={false} cardComponent={this.props.cardComponent}/>
                {children}
            </div>
        );
    }
}


AnterosKanbanBoard.propTypes = {
    id: PropTypes.string,
    dataSource: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataFieldColumn: PropTypes.string,
    cardComponent: PropTypes.any.isRequired,
    onBeginDragCard: PropTypes.func,
    onEndDragCard: PropTypes.func,
    onHoverCard: PropTypes.func,
    onClickCard: PropTypes.func
}


export class AnterosKanbanColumn extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<AnterosKanbanCardsContainer
            title={this.props.title}
            cards={this.props.cards}
            dataFieldValue={this.props.dataFieldValue}
            moveCard={this.props.moveCard}
            startScrolling={this.props.startScrolling}
            stopScrolling={this.props.stopScrolling}
            isScrolling={this.props.isScrolling}
            height={this.props.height}
            renderTitle={this.props.renderTitle}
            backgroundColorTitle={this.props.backgroundColorTitle}
            fontColorTitle={this.props.fontColorTitle}
            centerTitle={this.props.centerTitle}
            cardComponent={this.props.cardComponent}
            width={this.props.width}
            opacity={this.props.opacity}
            onBeginDragCard={this.props.onBeginDragCard}
            onEndDragCard={this.props.onEndDragCard}
            onHoverCard={this.props.onHoverCard}
            onClickCard={this.props.onClickCard}
            x={this.props.index}
        />);
    }
}

AnterosKanbanColumn.propTypes = {
    dataFieldValue: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    renderTitle: PropTypes.func,
    backgroundColorTitle: PropTypes.string,
    opacity: PropTypes.string,
    fontColorTitle: PropTypes.string,
    centerTitle: PropTypes.bool,
    width: PropTypes.string    
}


export default DragDropContext(HTML5Backend)(AnterosKanbanBoard);