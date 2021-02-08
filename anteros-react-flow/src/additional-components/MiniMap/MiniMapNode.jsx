import { memo, CSSProperties } from 'react';
import cc from 'classcat';

const MiniMapNode = ({ x, y, width, height, style, color, strokeColor, className, borderRadius }) => {
  const { background, backgroundColor } = style || {};
  const fill = (color || background || backgroundColor);

  return (
    <rect
      className={cc(['react-flow__minimap-node', className])}
      x={x}
      y={y}
      rx={borderRadius}
      ry={borderRadius}
      width={width}
      height={height}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={2}
    />
  );
};

MiniMapNode.displayName = 'MiniMapNode';

export default memo(MiniMapNode);
