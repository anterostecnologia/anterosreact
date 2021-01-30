import { getDimensions } from '../../utils';

export const getHandleBounds = (nodeElement, scale) => {
  const bounds = nodeElement.getBoundingClientRect();

  return {
    source: getHandleBoundsByHandleType('.source', nodeElement, bounds, scale),
    target: getHandleBoundsByHandleType('.target', nodeElement, bounds, scale),
  };
};

export const getHandleBoundsByHandleType = (
  selector,
  nodeElement,
  parentBounds,
  k
) => {
  const handles = nodeElement.querySelectorAll(selector);

  if (!handles || !handles.length) {
    return null;
  }

  const handlesArray = Array.from(handles);

  return handlesArray.map(
    (handle) => {
      const bounds = handle.getBoundingClientRect();
      const dimensions = getDimensions(handle);
      const handleId = handle.getAttribute('data-handleid');
      const handlePosition = (handle.getAttribute('data-handlepos'));

      return {
        id: handleId,
        position: handlePosition,
        x: (bounds.left - parentBounds.left) / k,
        y: (bounds.top - parentBounds.top) / k,
        ...dimensions,
      };
    }
  );
};
