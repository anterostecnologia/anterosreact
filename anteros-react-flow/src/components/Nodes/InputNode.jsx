import { memo } from 'react';
import Handle from '../Handle';

const InputNode = ({ data, isConnectable, sourcePosition = Position.Bottom }) => (
  <>
    {data.label}
    <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
  </>
);

InputNode.displayName = 'InputNode';

export default memo(InputNode);
