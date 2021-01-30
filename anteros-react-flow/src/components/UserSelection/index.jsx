/**
 * The user selection rectangle gets displayed when a user drags the mouse while pressing shift
 */

import { memo } from 'react';

import { useStoreActions, useStoreState } from '../../store/hooks';


function getMousePosition(event) {
  const reactFlowNode = (event.target).closest('.react-flow');
  if (!reactFlowNode) {
    return;
  }

  const containerBounds = reactFlowNode.getBoundingClientRect();

  return {
    x: event.clientX - containerBounds.left,
    y: event.clientY - containerBounds.top,
  };
}

const SelectionRect = () => {
  const userSelectionRect = useStoreState((state) => state.userSelectionRect);

  if (!userSelectionRect.draw) {
    return null;
  }

  return (
    <div
      className="react-flow__selection"
      style={{
        width: userSelectionRect.width,
        height: userSelectionRect.height,
        transform: `translate(${userSelectionRect.x}px, ${userSelectionRect.y}px)`,
      }}
    />
  );
};

export default memo(({ selectionKeyPressed }) => {
  const selectionActive = useStoreState((state) => state.selectionActive);
  const elementsSelectable = useStoreState((state) => state.elementsSelectable);

  const setUserSelection = useStoreActions((actions) => actions.setUserSelection);
  const updateUserSelection = useStoreActions((actions) => actions.updateUserSelection);
  const unsetUserSelection = useStoreActions((actions) => actions.unsetUserSelection);
  const unsetNodesSelection = useStoreActions((actions) => actions.unsetNodesSelection);
  const renderUserSelectionPane = selectionActive || selectionKeyPressed;

  if (!elementsSelectable || !renderUserSelectionPane) {
    return null;
  }

  const onMouseDown = (event) => {
    const mousePos = getMousePosition(event);
    if (!mousePos) {
      return;
    }

    setUserSelection(mousePos);
  };

  const onMouseMove = (event) => {
    if (!selectionKeyPressed || !selectionActive) {
      return;
    }
    const mousePos = getMousePosition(event);

    if (!mousePos) {
      return;
    }

    updateUserSelection(mousePos);
  };

  const onMouseUp = () => unsetUserSelection();

  const onMouseLeave = () => {
    unsetUserSelection();
    unsetNodesSelection();
  };

  return (
    <div
      className="react-flow__selectionpane"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <SelectionRect />
    </div>
  );
});
