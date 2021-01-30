import { useEffect, useState } from 'react';
import { getBezierPath } from '../Edges/BezierEdge';
import { getSmoothStepPath } from '../Edges/SmoothStepEdge';


export default ({
  connectionNodeId,
  connectionHandleId,
  connectionHandleType,
  connectionLineStyle,
  connectionPositionX,
  connectionPositionY,
  connectionLineType = ConnectionLineType.Bezier,
  nodes = [],
  transform,
  isConnectable,
  CustomConnectionLineComponent,
}) => {
  const [sourceNode, setSourceNode] = useState(null);
  const nodeId = connectionNodeId;
  const handleId = connectionHandleId;

  useEffect(() => {
    const nextSourceNode = nodes.find((n) => n.id === nodeId) || null;
    setSourceNode(nextSourceNode);
  }, []);

  if (!sourceNode || !isConnectable) {
    return null;
  }

  const sourceHandle = handleId
    ? sourceNode.__rf.handleBounds[connectionHandleType].find((d) => d.id === handleId)
    : sourceNode.__rf.handleBounds[connectionHandleType][0];
  const sourceHandleX = sourceHandle ? sourceHandle.x + sourceHandle.width / 2 : sourceNode.__rf.width / 2;
  const sourceHandleY = sourceHandle ? sourceHandle.y + sourceHandle.height / 2 : sourceNode.__rf.height;
  const sourceX = sourceNode.__rf.position.x + sourceHandleX;
  const sourceY = sourceNode.__rf.position.y + sourceHandleY;

  const targetX = (connectionPositionX - transform[0]) / transform[2];
  const targetY = (connectionPositionY - transform[1]) / transform[2];

  const isRightOrLeft = sourceHandle?.position === Position.Left || sourceHandle?.position === Position.Right;
  const targetPosition = isRightOrLeft ? Position.Left : Position.Top;

  if (CustomConnectionLineComponent) {
    return (
      <g className="react-flow__connection">
        <CustomConnectionLineComponent
          sourceX={sourceX}
          sourceY={sourceY}
          sourcePosition={sourceHandle?.position}
          targetX={targetX}
          targetY={targetY}
          targetPosition={targetPosition}
          connectionLineType={connectionLineType}
          connectionLineStyle={connectionLineStyle}
        />
      </g>
    );
  }

  let dAttr = '';

  if (connectionLineType === ConnectionLineType.Bezier) {
    dAttr = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition: sourceHandle?.position,
      targetX,
      targetY,
      targetPosition,
    });
  } else if (connectionLineType === ConnectionLineType.Step) {
    dAttr = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: sourceHandle?.position,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 0,
    });
  } else if (connectionLineType === ConnectionLineType.SmoothStep) {
    dAttr = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: sourceHandle?.position,
      targetX,
      targetY,
      targetPosition,
    });
  } else {
    dAttr = `M${sourceX},${sourceY} ${targetX},${targetY}`;
  }

  return (
    <g className="react-flow__connection">
      <path d={dAttr} className="react-flow__connection-path" style={connectionLineStyle} />
    </g>
  );
};
