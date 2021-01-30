import { memo } from 'react';
import Handle from '../Handle';

const DefaultNode = ({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}) => (
  <>
    <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
    {data.label}
    <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
  </>
);

DefaultNode.displayName = 'DefaultNode';

export default memo(DefaultNode);
