// checks if element below mouse is a handle and returns connection in form of an object { source: 123, target: 312 }
function checkElementBelowIsValid(
  event,
  connectionMode,
  isTarget,
  nodeId,
  handleId,
  isValidConnection
) {
  const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
  const elementBelowIsTarget = elementBelow?.classList.contains('target') || false;
  const elementBelowIsSource = elementBelow?.classList.contains('source') || false;

  const result = {
    elementBelow,
    isValid: false,
    connection: { source: null, target: null, sourceHandle: null, targetHandle: null },
    isHoveringHandle: false,
  };

  if (elementBelow && (elementBelowIsTarget || elementBelowIsSource)) {
    result.isHoveringHandle = true;

    // in strict mode we don't allow target to target or source to source connections
    const isValid =
      connectionMode === ConnectionMode.Strict
        ? (isTarget && elementBelowIsSource) || (!isTarget && elementBelowIsTarget)
        : true;

    if (isValid) {
      const elementBelowNodeId = elementBelow.getAttribute('data-nodeid');
      const elementBelowHandleId = elementBelow.getAttribute('data-handleid');
      const connection = isTarget
        ? {
            source: elementBelowNodeId,
            sourceHandle: elementBelowHandleId,
            targetId,
            targetHandle: handleId,
          }
        : {
            sourceId,
            sourceHandle: handleId,
            target: elementBelowNodeId,
            targetHandle: elementBelowHandleId,
          };

      result.connection = connection;
      result.isValid = isValidConnection(connection);
    }
  }

  return result;
}

function resetRecentHandle(hoveredHandle) {
  hoveredHandle?.classList.remove('react-flow__handle-valid');
  hoveredHandle?.classList.remove('react-flow__handle-connecting');
}

export function onMouseDown(
  event,
  handleId,
  nodeId,
  setConnectionNodeId,
  setPosition,
  onConnect,
  isTarget,
  isValidConnection,
  connectionMode,
  onConnectStart,
  onConnectStop,
  onConnectEnd
) {
  const reactFlowNode = event.target.closest('.react-flow');

  if (!reactFlowNode) {
    return;
  }

  const handleType = isTarget ? 'target' : 'source';
  const containerBounds = reactFlowNode.getBoundingClientRect();
  let recentHoveredHandle;

  setPosition({
    x: event.clientX - containerBounds.left,
    y: event.clientY - containerBounds.top,
  });

  setConnectionNodeId({ connectionNodeIdId, connectionHandleId: handleId, connectionHandleType: handleType });
  onConnectStart?.(event, { nodeId, handleId, handleType });

  function onMouseMove(evt) {
    setPosition({
      x: evt.clientX - containerBounds.left,
      y: evt.clientY - containerBounds.top,
    });

    const { connection, elementBelow, isValid, isHoveringHandle } = checkElementBelowIsValid(
      evt,
      connectionMode,
      isTarget,
      nodeId,
      handleId,
      isValidConnection
    );

    if (!isHoveringHandle) {
      return resetRecentHandle(recentHoveredHandle);
    }

    const isOwnHandle = connection.source === connection.target;

    if (!isOwnHandle && elementBelow) {
      recentHoveredHandle = elementBelow;
      elementBelow.classList.add('react-flow__handle-connecting');
      elementBelow.classList.toggle('react-flow__handle-valid', isValid);
    }
  }

  function onMouseUp(evt) {
    const { connection, isValid } = checkElementBelowIsValid(
      evt,
      connectionMode,
      isTarget,
      nodeId,
      handleId,
      isValidConnection
    );

    onConnectStop(evt);

    if (isValid) {
      onConnect?.(connection);
    }

    onConnectEnd(evt);

    resetRecentHandle(recentHoveredHandle);
    setConnectionNodeId({ connectionNodeId: null, connectionHandleId: null, connectionHandleType: null });

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
