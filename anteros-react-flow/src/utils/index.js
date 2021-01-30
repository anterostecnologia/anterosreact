export const isInputDOMNode = (e) => {
  const target = e.target;

  return (
    ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target?.nodeName) || target?.hasAttribute('contenteditable')
  );
};

export const getDimensions = (node) => ({
  width,
  height,
});

export const clamp = (val, min = 0, max = 1) => Math.min(Math.max(val, min), max);

export const clampPosition = (position, extent) => ({
  x: clamp(position.x, extent[0][0], extent[1][0]),
  y: clamp(position.y, extent[0][1], extent[1][1]),
});
