import { memo } from 'react';
import SmoothStepEdge from './SmoothStepEdge';

export default memo((props) => {
  return <SmoothStepEdge {...props} borderRadius={0} />;
});
