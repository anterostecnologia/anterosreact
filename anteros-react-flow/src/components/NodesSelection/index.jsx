/**
 * The nodes selection rectangle gets displayed when a user
 * made a selectio  with on or several nodes
 */

import { useMemo, useCallback, useRef } from 'react';
import ReactDraggable from 'react-draggable';

import { useStoreState, useStoreActions } from '../../store/hooks';
import { isNode } from '../../utils/graph';


export default ({
  onSelectionDragStart,
  onSelectionDrag,
  onSelectionDragStop,
  onSelectionContextMenu,
}) => {
  const [tX, tY, tScale] = useStoreState((state) => state.transform);
  const selectedNodesBbox = useStoreState((state) => state.selectedNodesBbox);
  const selectionActive = useStoreState((state) => state.selectionActive);
  const selectedElements = useStoreState((state) => state.selectedElements);
  const snapToGrid = useStoreState((state) => state.snapToGrid);
  const snapGrid = useStoreState((state) => state.snapGrid);
  const nodes = useStoreState((state) => state.nodes);

  const updateNodePosDiff = useStoreActions((actions) => actions.updateNodePosDiff);

  const nodeRef = useRef(null);

  const grid = useMemo(() => (snapToGrid ? snapGrid : [1, 1]), [snapToGrid, snapGrid]);

  const selectedNodes = useMemo(
    () =>
      selectedElements
        ? selectedElements.filter(isNode).map((selectedNode) => {
            const matchingNode = nodes.find((node) => node.id === selectedNode.id);

            return {
              ...matchingNode,
              position: matchingNode?.__rf.position,
            };
          })
        : [],
    [selectedElements, nodes]
  );

  const style = useMemo(
    () => ({
      transform: `translate(${tX}px,${tY}px) scale(${tScale})`,
    }),
    [tX, tY, tScale]
  );

  const innerStyle = useMemo(
    () => ({
      width: selectedNodesBbox.width,
      height: selectedNodesBbox.height,
      top: selectedNodesBbox.y,
      left: selectedNodesBbox.x,
    }),
    [selectedNodesBbox]
  );

  const onStart = useCallback(
    (event) => {
      onSelectionDragStart?.(event, selectedNodes);
    },
    [onSelectionDragStart, selectedNodes]
  );

  const onDrag = useCallback(
    (event, data) => {
      if (onSelectionDrag) {
        onSelectionDrag(event, selectedNodes);
      }

      updateNodePosDiff({
        diff: {
          x: data.deltaX,
          y: data.deltaY,
        },
      });
    },
    [onSelectionDrag, selectedNodes, updateNodePosDiff]
  );

  const onStop = useCallback(
    (event) => {
      updateNodePosDiff({
        isDragging: false,
      });

      onSelectionDragStop?.(event, selectedNodes);
    },
    [selectedNodes, onSelectionDragStop]
  );

  const onContextMenu = useCallback(
    (event) => {
      const selNodes = selectedElements
        ? selectedElements.filter(isNode).map((selectedNode) => nodes.find((node) => node.id === selectedNode.id))
        : [];

      onSelectionContextMenu?.(event, selNodes);
    },
    [onSelectionContextMenu]
  );

  if (!selectedElements || selectionActive) {
    return null;
  }

  return (
    <div className="react-flow__nodesselection" style={style}>
      <ReactDraggable
        scale={tScale}
        grid={grid}
        onStart={(event) => onStart(event)}
        onDrag={(event, data) => onDrag(event, data)}
        onStop={(event) => onStop(event)}
        nodeRef={nodeRef}
      >
        <div
          ref={nodeRef}
          className="react-flow__nodesselection-rect"
          onContextMenu={onContextMenu}
          style={innerStyle}
        />
      </ReactDraggable>
    </div>
  );
};
