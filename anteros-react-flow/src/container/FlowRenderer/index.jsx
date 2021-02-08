import { useCallback, memo, ReactNode, WheelEvent, MouseEvent } from 'react';
import { useStoreActions, useStoreState } from '../../store/hooks';

import useGlobalKeyHandler from '../../hooks/useGlobalKeyHandler';
import useKeyPress from '../../hooks/useKeyPress';

import { GraphViewProps } from '../GraphView';
import ZoomPane from '../ZoomPane';
import UserSelection from '../../components/UserSelection';
import NodesSelection from '../../components/NodesSelection';

const FlowRenderer = ({
  children,
  onPaneClick,
  onPaneContextMenu,
  onPaneScroll,
  onElementsRemove,
  deleteKeyCode,
  onMove,
  onMoveStart,
  onMoveEnd,
  selectionKeyCode,
  multiSelectionKeyCode,
  zoomActivationKeyCode,
  elementsSelectable,
  zoomOnScroll,
  zoomOnPinch,
  panOnScroll,
  panOnScrollSpeed,
  panOnScrollMode,
  zoomOnDoubleClick,
  paneMoveable,
  defaultPosition,
  defaultZoom,
  translateExtent,
  onSelectionDragStart,
  onSelectionDrag,
  onSelectionDragStop,
  onSelectionContextMenu,
}) => {
  const unsetNodesSelection = useStoreActions((actions) => actions.unsetNodesSelection);
  const resetSelectedElements = useStoreActions((actions) => actions.resetSelectedElements);
  const nodesSelectionActive = useStoreState((state) => state.nodesSelectionActive);

  const selectionKeyPressed = useKeyPress(selectionKeyCode);

  useGlobalKeyHandler({ onElementsRemove, deleteKeyCode, multiSelectionKeyCode });

  const onClick = useCallback(
    (event) => {
      onPaneClick?.(event);
      unsetNodesSelection();
      resetSelectedElements();
    },
    [onPaneClick]
  );

  const onContextMenu = useCallback(
    (event) => {
      onPaneContextMenu?.(event);
    },
    [onPaneContextMenu]
  );

  const onWheel = useCallback(
    (event) => {
      onPaneScroll?.(event);
    },
    [onPaneScroll]
  );

  return (
    <ZoomPane
      onMove={onMove}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      selectionKeyPressed={selectionKeyPressed}
      elementsSelectable={elementsSelectable}
      zoomOnScroll={zoomOnScroll}
      zoomOnPinch={zoomOnPinch}
      panOnScroll={panOnScroll}
      panOnScrollSpeed={panOnScrollSpeed}
      panOnScrollMode={panOnScrollMode}
      zoomOnDoubleClick={zoomOnDoubleClick}
      paneMoveable={paneMoveable}
      defaultPosition={defaultPosition}
      defaultZoom={defaultZoom}
      translateExtent={translateExtent}
      zoomActivationKeyCode={zoomActivationKeyCode}
    >
      {children}
      <UserSelection selectionKeyPressed={selectionKeyPressed} />
      {nodesSelectionActive && (
        <NodesSelection
          onSelectionDragStart={onSelectionDragStart}
          onSelectionDrag={onSelectionDrag}
          onSelectionDragStop={onSelectionDragStop}
          onSelectionContextMenu={onSelectionContextMenu}
        />
      )}
      <div className="react-flow__pane" onClick={onClick} onContextMenu={onContextMenu} onWheel={onWheel} />
    </ZoomPane>
  );
};

FlowRenderer.displayName = 'FlowRenderer';

export default memo(FlowRenderer);
