import { useMemo} from 'react';
import cc from 'classcat';

import GraphView from '../GraphView';
import ElementUpdater from '../../components/ElementUpdater';
import DefaultNode from '../../components/Nodes/DefaultNode';
import InputNode from '../../components/Nodes/InputNode';
import OutputNode from '../../components/Nodes/OutputNode';
import { createNodeTypes } from '../NodeRenderer/utils';
import SelectionListener from '../../components/SelectionListener';
import { BezierEdge, StepEdge, SmoothStepEdge, StraightEdge } from '../../components/Edges';
import { createEdgeTypes } from '../EdgeRenderer/utils';
import Wrapper from './Wrapper';

import '../../style.css';
import '../../theme-default.scss';

const defaultNodeTypes = {
  input: InputNode,
  default: DefaultNode,
  output: OutputNode,
};

const defaultEdgeTypes = {
  default: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
};
const ReactFlow = ({
  elements = [],
  className,
  nodeTypes = defaultNodeTypes,
  edgeTypes = defaultEdgeTypes,
  onElementClick,
  onLoad,
  onMove,
  onMoveStart,
  onMoveEnd,
  onElementsRemove,
  onConnect,
  onConnectStart,
  onConnectStop,
  onConnectEnd,
  onNodeMouseEnter,
  onNodeMouseMove,
  onNodeMouseLeave,
  onNodeContextMenu,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  onSelectionChange,
  onSelectionDragStart,
  onSelectionDrag,
  onSelectionDragStop,
  onSelectionContextMenu,
  connectionMode = ConnectionMode.Strict,
  connectionLineType = ConnectionLineType.Bezier,
  connectionLineStyle,
  connectionLineComponent,
  deleteKeyCode = 'Backspace',
  selectionKeyCode = 'Shift',
  multiSelectionKeyCode = 'Meta',
  zoomActivationKeyCode = 'Meta',
  snapToGrid = false,
  snapGrid = [15, 15],
  onlyRenderVisibleElements = true,
  selectNodesOnDrag = true,
  nodesDraggable,
  nodesConnectable,
  elementsSelectable,
  minZoom,
  maxZoom,
  defaultZoom = 1,
  defaultPosition = [0, 0],
  translateExtent,
  nodeExtent,
  arrowHeadColor = '#b1b1b7',
  markerEndId,
  zoomOnScroll = true,
  zoomOnPinch = true,
  panOnScroll = false,
  panOnScrollSpeed = 0.5,
  panOnScrollMode = PanOnScrollMode.Free,
  zoomOnDoubleClick = true,
  paneMoveable = true,
  onPaneClick,
  onPaneScroll,
  onPaneContextMenu,
  children,
  onEdgeUpdate,
  ...rest
}) => {
  const nodeTypesParsed = useMemo(() => createNodeTypes(nodeTypes), []);
  const edgeTypesParsed = useMemo(() => createEdgeTypes(edgeTypes), []);
  const reactFlowClasses = cc(['react-flow', className]);

  return (
    <div {...rest} className={reactFlowClasses}>
      <Wrapper>
        <GraphView
          onLoad={onLoad}
          onMove={onMove}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          onElementClick={onElementClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseMove={onNodeMouseMove}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypesParsed}
          edgeTypes={edgeTypesParsed}
          connectionMode={connectionMode}
          connectionLineType={connectionLineType}
          connectionLineStyle={connectionLineStyle}
          connectionLineComponent={connectionLineComponent}
          selectionKeyCode={selectionKeyCode}
          onElementsRemove={onElementsRemove}
          deleteKeyCode={deleteKeyCode}
          multiSelectionKeyCode={multiSelectionKeyCode}
          zoomActivationKeyCode={zoomActivationKeyCode}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectStop={onConnectStop}
          onConnectEnd={onConnectEnd}
          snapToGrid={snapToGrid}
          snapGrid={snapGrid}
          onlyRenderVisibleElements={onlyRenderVisibleElements}
          nodesDraggable={nodesDraggable}
          nodesConnectable={nodesConnectable}
          elementsSelectable={elementsSelectable}
          selectNodesOnDrag={selectNodesOnDrag}
          minZoom={minZoom}
          maxZoom={maxZoom}
          defaultZoom={defaultZoom}
          defaultPosition={defaultPosition}
          translateExtent={translateExtent}
          nodeExtent={nodeExtent}
          arrowHeadColor={arrowHeadColor}
          markerEndId={markerEndId}
          zoomOnScroll={zoomOnScroll}
          zoomOnPinch={zoomOnPinch}
          zoomOnDoubleClick={zoomOnDoubleClick}
          panOnScroll={panOnScroll}
          panOnScrollSpeed={panOnScrollSpeed}
          panOnScrollMode={panOnScrollMode}
          paneMoveable={paneMoveable}
          onPaneClick={onPaneClick}
          onPaneScroll={onPaneScroll}
          onPaneContextMenu={onPaneContextMenu}
          onSelectionDragStart={onSelectionDragStart}
          onSelectionDrag={onSelectionDrag}
          onSelectionDragStop={onSelectionDragStop}
          onSelectionContextMenu={onSelectionContextMenu}
          onEdgeUpdate={onEdgeUpdate}
        />
        <ElementUpdater elements={elements} />
        {onSelectionChange && <SelectionListener onSelectionChange={onSelectionChange} />}
        {children}
      </Wrapper>
    </div>
  );
};

ReactFlow.displayName = 'ReactFlow';

export default ReactFlow;
