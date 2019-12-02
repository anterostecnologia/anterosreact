import React, { Component, Fragment } from "react"
import PropTypes from 'prop-types';
import lodash from 'lodash'
import {CSSTransitionGroup} from "react-transition-group";
import { DndProvider, DropTarget, DragSource } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import windowSize from "react-window-size";
import {autoBind} from 'anteros-react-core';


class AnterosDashboard extends Component {
    constructor(props) {
        super(props)
        autoBind(this);
        this.state = {
            editMode: false,
            moveMode: false
        }
    }

    displayName() {
        return "AnterosDashboard"
    }

    // # optimize re-render to exclude width changes unless they affect column count
    shouldComponentUpdate(nextProps, nextState) {
        this.layout.reset(nextProps.componentWidthForTesting || nextState.componentWidth)
        const cc1 = this.layout.columnCount()
        this.layout.reset(this.state.componentWidth)

        const cc2 = this.layout.columnCount()
        return (
            nextProps !== this.props ||
            nextState.editMode !== this.state.editMode ||
            nextState.moveMode !== this.state.moveMode ||
            cc1 !== cc2
        )
    }

    childComponentsForConfig(components, config, editMode, moveMode, sizeConfig, columnCount, doneButtonClass) {
        const componentsById = getComponentsById(components)
        const instances = config.map((widget) => {
            if (componentsById[widget.widgetId]) {
                const withPositions = this.layout.setWidgetPosition(componentsById[widget.widgetId], widget.config)
                return React.cloneElement(withPositions, {
                    dashEditable: editMode,
                    draggable: moveMode,
                    key: widget.instanceId,
                    onConfigChange: this.configChange,
                    onHide: () => {
                        return this.hideWidget(widget.instanceId)
                    },
                    config: widget.config,
                    instanceId: widget.instanceId,
                    sizeConfig,
                    columnCount,
                    onDrop: this.moveWidget,
                    doneButtonClass
                })
            }
        })

        return lodash.compact(instances)
    }

    toggleEditMode() {
        const newEditMode = !this.state.editMode;
        this.setState({ editMode: newEditMode });
        if (!newEditMode) {
            this.setState({ moveMode: false });
        }
    }

    toggleMoveMode() {
        this.setState({ moveMode: !this.state.moveMode });
    }

    hideWidget(instanceId) {
        const allConfigs = [].concat(this.props.config);
        const index = lodash.findIndex(allConfigs, (config) => config.instanceId === instanceId);
        allConfigs.splice(index, 1);
        return this.props.onConfigChange(allConfigs);
    }

    configChange(instanceId, newConfig) {
        let allConfigs = [].concat(this.props.config)

        const index = lodash.findIndex(allConfigs, (config) => config.instanceId === instanceId)

        allConfigs[index] = {
            widgetId: allConfigs[index].widgetId,
            instanceId: instanceId,
            config: newConfig
        }

        return this.props.onConfigChange(allConfigs)
    }

    addWidget(id) {
        const config = [].concat(this.props.config)
        config.push({
            widgetId: id,
            instanceId: Math.floor(Math.random() * 100000),
            config: {}
        })
        return this.props.onConfigChange(config)
    }

    moveWidget(draggingWidgetId, targetWidgetId) {
        let config = [].concat(this.props.config)
        let targetIndex = lodash.findIndex(config, (widget) => widget.instanceId === targetWidgetId)
        const sourceIndex = lodash.findIndex(config, (widget) => widget.instanceId === draggingWidgetId)
        if (sourceIndex < targetIndex) {
            targetIndex--
        }

        config.splice(targetIndex, 0, config.splice(sourceIndex, 1)[0])
        return this.props.onConfigChange(config)
    }

    renderAddWidgets() {
        let _this = this;
        if (this.state.editMode && !this.state.moveMode) {
            let arrChildren = React.Children.toArray(this.props.children);
            const addPanelChildren = arrChildren.map((child) => {
                const preview = child.props.previewComp ? (
                    React.createElement(child.props.previewComp)
                ) : (
                        <div className="default-preview" key={child.props.id}>
                            No Preview
                    </div>
                    )
                return (
                    <div className="widget-preview" key={child.props.id} onClick={() => _this.addWidget(child.props.id)}>
                        <div className="no-click">{preview}</div>
                    </div>
                )
            })

            return <AddWidgetPanel>{addPanelChildren}</AddWidgetPanel>
        }
    }
    handleResize() {
        this.setState({
            componentWidth: window.innerWidth
        })
    }

    componentDidMount() {
        this.handleResize()
        window.addEventListener("resize", this.handleResize)
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize)
    }

    render() {
        let {
            children,
            title,
            className,
            config,
            widgetHeight,
            widgetWidth,
            widgetMargin,
            titleHeight = 50,
            maxColumns = 5,
            doneButtonClass = ""
        } = this.props;

        let { editMode, moveMode, componentWidth } = this.state

        children = [].concat(children)

        let sizeConfig = { widgetHeight, widgetWidth, widgetMargin, titleHeight, maxColumns }

        // this.layout = layout = new Layout(sizeConfig)
        this.layout = new AnterosDashboardLayout(sizeConfig)
        this.layout.reset(this.props.componentWidthForTesting || componentWidth)

        let childrenForCurrentConfig = this.childComponentsForConfig(
            children,
            config,
            editMode,
            moveMode,
            sizeConfig,
            this.layout.columnCount(),
            doneButtonClass
        )

        let contentWidth = this.layout.columnCount() * (widgetWidth + widgetMargin) - widgetMargin

        if (this.layout.columnCount() === 1) {
            contentWidth = "90%"
        }

        return (
            <DndProvider backend={HTML5Backend}>
                <Fragment>
                <div className={`dashboard ${className} ${editMode && !moveMode ? "editing" : ""}`}>
                    <DashboardTitle height={titleHeight}>
                        {title}
                    </DashboardTitle>
                    <div className={`edit-button ${editMode ? "editing" : ""}`} onClick={this.toggleEditMode}>
                        <i className="fa fa-cogs" />
                    </div>
                    {editMode ? (
                        <div className={`move-button ${moveMode ? "moving" : ""}`} onClick={this.toggleMoveMode}>
                            <i className="fa fa-arrows" />
                        </div>
                    ) : null}
                    <div className="dashboard-container">
                        <div
                            className={`dashboard-content columns-${this.layout.columnCount()}`}
                            style={{ width: contentWidth }}>
                            {childrenForCurrentConfig}
                        </div>
                    </div>
                    <CSSTransitionGroup
                        transitionName="widget-panel"
                        transitionEnterTimeout={500}
                        transitionLeaveTimeout={500}
                        transitionEnter={true}
                        transitionLeave={true}>
                        {this.renderAddWidgets()}
                    </CSSTransitionGroup>
                </div>
                </Fragment>
           </DndProvider>
        )
    }
}

AnterosDashboard.propTypes = {
    /* if provided, a title bar will be rendered at the top with the given text */
    title: PropTypes.string,
    /* (required) contains the widget instances and the configuration for the instances. For the sake of usability, a reasonable initial value should be provided. If not, the user will not have any widgets in the dashboard until they add them. This data structure is what you would save in the user's preferences. */
    config: PropTypes.any.isRequired,
    /* fires when the user updates the widgets on the screen (by adding/removing them or by configuring one) */
    onConfigChange: PropTypes.func,
    /* 250	height of a single row in pixels */
    widgetHeight: PropTypes.number.isRequired,
    /* 250	width of a single column in pixels */
    widgetWidth: PropTypes.number.isRequired,
    /* 15	gap between widgets in pixels */
    widgetMargin: PropTypes.number.isRequired,
    /* 50	height of the title */
    titleHeight: PropTypes.number.isRequired,
    /* 5	when displayed on a high-resolution (wide) screen, limit the number of columns to this value (for usability/ascetics) */
    maxColumns: PropTypes.number.isRequired,
};

AnterosDashboard.defaultProps = {
    widgetWidth: 250,
    widgetHeight: 250,
    widgetMargin: 15,
    titleHeight: 50,
    maxColumns: 5
}



const getComponentsById = (components) => {
    const byId = {}
    components.forEach((comp) => (byId[comp.props.id] = comp))
    return byId
}



const DashboardTitle = ({ children, height }) => (
    <div className="title" style={{ height }}>
        {children}
    </div>
)

DashboardTitle.displayName = "Title";
let Positioner;

const AnterosDashboardLayout = (Positioner = (function () {
    Positioner = class Positioner {
        static initClass() {
            this.prototype._currentGrid = [];
            this.prototype._columnCount = 4;
        }

        constructor(sizeConfig) {
            this.sizeConfig = sizeConfig;
        }

        reset(dashboardWidth) {
            const maxWidthForColumnCount = colCount => {
                return ((this.sizeConfig.widgetWidth + this.sizeConfig.widgetMargin) * colCount) + 100;
            };
            this._currentGrid = [];
            let columnCount = this.sizeConfig.maxColumns;
            while (dashboardWidth < maxWidthForColumnCount(columnCount)) {
                columnCount--;
            }
            return this._columnCount = Math.max(1, columnCount);
        }

        cellIsEmpty({ row, col }) {
            return !(this._currentGrid[row] != null ? this._currentGrid[row][col] : undefined);
        }

        getAllCellsFor({ height, width }, row, col, config) {
            width = Math.min(parseInt((config != null ? config.width : undefined) || width || 1), this._columnCount);
            height = parseInt((config != null ? config.height : undefined) || height || 1);
            let outOfBounds = false;
            const cells = [];
            for (let h = row, end = (row + height) - 1, asc = row <= end; asc ? h <= end : h >= end; asc ? h++ : h--) {
                for (let w = col, end1 = (col + width) - 1, asc1 = col <= end1; asc1 ? w <= end1 : w >= end1; asc1 ? w++ : w--) {
                    cells.push({ row: h, col: w });
                    if (w >= this._columnCount) {
                        outOfBounds = true;
                    }
                }
            }
            if (outOfBounds) { return []; } else { return cells; }
        }

        fitsInGrid(widget, row, col, config) {
            const cells = this.getAllCellsFor(widget.props, row, col, config);
            return (cells.length > 0) && cells.every(cell => {
                return this.cellIsEmpty(cell);
            });
        }

        markGridAsUsed(widget, row, col, config) {
            const cells = this.getAllCellsFor(widget.props, row, col, config);
            return cells.forEach(cell => {
                if (!this._currentGrid[cell.row]) { this._currentGrid[cell.row] = []; }
                return this._currentGrid[cell.row][cell.col] = 'x';
            });
        }

        setWidgetPositionInRow(widget, row, config) {
            let updatedWidget = null;
            for (let col = 0, end = this._columnCount - 1, asc = 0 <= end; asc ? col <= end : col >= end; asc ? col++ : col--) {
                if (this.fitsInGrid(widget, row, col, config)) {
                    this.markGridAsUsed(widget, row, col, config);
                    updatedWidget = React.cloneElement(widget, { col, row });
                    break;
                }
            }
            return updatedWidget;
        }

        setWidgetPosition(widget, config) {
            let updatedWidget = null;
            let row = 0;
            while (!updatedWidget) {
                if (!this._currentGrid[row]) {
                    this._currentGrid[row] = [];
                }
                updatedWidget = this.setWidgetPositionInRow(widget, row, config);
                row++;
            }
            return updatedWidget;
        }

        columnCount() {
            return this._columnCount;
        }

        rowCount() {
            return this._currentGrid.length;
        }
    };
    Positioner.initClass();
    return Positioner;
})());


const AddWidgetPanel = ({ children }) => <div className="add-widget-panel">{children}</div>;
AddWidgetPanel.displayName = "AddWidgetPanel";

const DashboardContent = ({ children }) => <div className="content">{children}</div>;
DashboardContent.displayName = "Content";

const DashboardConfig = ({ children }) => <div className="config">{children}</div>
DashboardConfig.displayName = "Config"


const Dnd = {
    ItemTypes: {
        WIDGET: "widget"
    },
    widgetSource: {
        beginDrag: (props) => {
            return {
                id: props.instanceId
            }
        }
    },
    collectDragable: (connect, monitor) => {
        return {
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging()
        }
    },
    target: {
        drop: (props, monitor) => {
            return props.onDrop(monitor.getItem().id, props.instanceId)
        }
    },
    collectDropTarget: (connect, monitor) => {
        return {
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver()
        }
    }
}


@DragSource(Dnd.ItemTypes.WIDGET, Dnd.widgetSource, Dnd.collectDragable)
@DropTarget(Dnd.ItemTypes.WIDGET, Dnd.target, Dnd.collectDropTarget)
class AnterosDashboardWidget extends React.Component {
    constructor(props) {
        super(props)
        autoBind(this);
        this.state = {
            editMode: false
        }
    }

    displayName() {
        return "AnterosDashboardWidget"
    }


    toggleEditMode() {
        this.setState({ editMode: !this.state.editMode })
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.dashEditable && this.state.editMode) {
            this.setState({ editMode: false })
        }
    }

    hide() { }

    renderEditButton() {
        const { dashEditable, draggable, onHide, doneButtonClass, configComp } = this.props
        let className= "edit-widget-button close-button ";
        let hrefLink = '#';
        if (doneButtonClass){
            className+= doneButtonClass;
        }
        if (dashEditable && !draggable) {
            if (this.state.editMode) {
                return (
                    <a href={hrefLink} className={className} onClick={this.toggleEditMode}>
                        done
                    </a>
                )
            }
            return (
                <div className="edit-overlay">
                    {configComp ? <i className="fa fa-cog edit-widget-button" onClick={this.toggleEditMode} /> : null}
                    <i className="fa fa-times hide-widget-button" onClick={onHide} />
                </div>
            )
        }
    }

    renderComponent() {
        const { config, instanceId, onConfigChange, dashEditable, configComp, contentComp } = this.props
        if (dashEditable && this.state.editMode) {
            if (configComp) {
                return (
                    <div>
                        <div className="config-comp">
                            {React.createElement(configComp, {
                                instanceId,
                                config,
                                onConfigChange
                            })}
                        </div>
                        <i className="fa fa-lg fa-cog background-watermark" />
                    </div>
                ) 
            } else {
                return <div />
            }
        } else {
            if (contentComp) {
                return React.createElement(contentComp, { instanceId, config })
            } else {
                return <div />
            }
        }
    }
    render() {
        let {
            height,
            width,
            col,
            row,
            draggable,
            config,
            sizeConfig,
            columnCount,
            connectDragSource,
            connectDropTarget,
            isOver,
        } = this.props
        width = lodash.get(config, "width", width) || 1
        height = lodash.get(config, "height", height) || 1
        const { widgetHeight, widgetWidth, widgetMargin } = sizeConfig

        const styles = {
            height: height * (widgetHeight + widgetMargin) - widgetMargin,
            width: columnCount === 1 ? "100%" : width * (widgetWidth + widgetMargin) - widgetMargin,
            left: Math.max(0, col * (widgetWidth + widgetMargin)),
            top: row * (widgetHeight + widgetMargin)
        }

        const classes = ["widget"]
        if (draggable) classes.push("draggable")

        if (isOver) classes.push("drag-over")

        const rendered = (
            <div className={classes.join(" ")} style={styles}>
                {isOver ? <div className="drop-prompt" style={{ height: widgetHeight }} /> : null}
                <div className="widget-inner">
                    {draggable ? <div className="dragbar" /> : null}
                    {this.renderEditButton()}
                    {this.renderComponent()}
                </div>
            </div>
        )
        return draggable ? connectDragSource(connectDropTarget(rendered)) : rendered
    }
}


AnterosDashboardWidget.propTypes = {
    /* Unique identifier for this widget. Used to in the Dashboard state (referred to as widgetId). */
    id: PropTypes.string.isRequired,
    /* The widget as normally displayed on the dashboard */
    contentComp: PropTypes.any.isRequired,
    /* (optional) The widget as displayed in the 'add widget' panel (usually a simplified version which doesn't depend on external data). While optional, the default is simply a 'No Preview' message. A previewComp is recommended for all Widgets. */
    previewComp: PropTypes.any,
    /* (optional) The configuration screen */
    configComp: PropTypes.any,
}

export default windowSize(AnterosDashboard);

export {AnterosDashboardWidget}


