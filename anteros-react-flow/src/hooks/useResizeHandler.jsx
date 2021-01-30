import { useEffect, MutableRefObject } from 'react';
import { useStoreActions } from '../store/hooks';

import { getDimensions } from '../utils';

export default (rendererNode) => {
  const updateSize = useStoreActions((actions) => actions.updateSize);

  useEffect(() => {
    let resizeObserver;

    const updateDimensions = () => {
      if (!rendererNode.current) {
        return;
      }

      const size = getDimensions(rendererNode.current);

      if (size.height === 0 || size.width === 0) {
        console.warn('The React Flow parent container needs a width and a height to render the graph.');
      }

      updateSize(size);
    };

    updateDimensions();
    window.onresize = updateDimensions;

    if (rendererNode.current) {
      resizeObserver = new ResizeObserver(() => updateDimensions());
      resizeObserver.observe(rendererNode.current);
    }

    return () => {
      window.onresize = null;

      if (resizeObserver && rendererNode.current) {
        resizeObserver.unobserve(rendererNode.current);
      }
    };
  }, []);
};
