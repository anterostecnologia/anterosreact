import { useMemo } from 'react';
import { zoomIdentity } from 'd3-zoom';
import { useStoreState, useStore } from '../store/hooks';
import { clamp } from '../utils';
import { getRectOfNodes } from '../utils/graph';

const initialZoomPanHelper = {
  zoomIn: () => {},
  zoomOut: () => {},
  zoomTo: (_) => {},
  transform: (_) => {},
  fitView: (_ = { padding: 0.1 }) => {},
  setCenter: (_, __) => {},
  fitBounds: (_) => {},
  initialized: false,
};

const getTransformForBounds = (
  bounds,
  width,
  height,
  minZoom,
  maxZoom,
  padding = 0.1
) => {
  const xZoom = width / (bounds.width * (1 + padding));
  const yZoom = height / (bounds.height * (1 + padding));
  const zoom = Math.min(xZoom, yZoom);
  const clampedZoom = clamp(zoom, minZoom, maxZoom);
  const boundsCenterX = bounds.x + bounds.width / 2;
  const boundsCenterY = bounds.y + bounds.height / 2;
  const x = width / 2 - boundsCenterX * clampedZoom;
  const y = height / 2 - boundsCenterY * clampedZoom;

  return [x, y, clampedZoom];
};

const usePanZoomHelper = () => {
  const store = useStore();
  const d3Zoom = useStoreState((s) => s.d3Zoom);
  const d3Selection = useStoreState((s) => s.d3Selection);

  const zoomPanHelperFunctions = useMemo(() => {
    if (d3Selection && d3Zoom) {
      return {
        zoomIn: () => d3Zoom.scaleBy(d3Selection, 1.2),
        zoomOut: () => d3Zoom.scaleBy(d3Selection, 1 / 1.2),
        zoomTo: (zoomLevel) => d3Zoom.scaleTo(d3Selection, zoomLevel),
        transform: (transform) => {
          const nextTransform = zoomIdentity.translate(transform.x, transform.y).scale(transform.zoom);

          d3Zoom.transform(d3Selection, nextTransform);
        },
        fitView: (options = { padding: 0.1 }) => {
          const { nodes, width, height, minZoom, maxZoom } = store.getState();

          if (!nodes.length) {
            return;
          }

          const bounds = getRectOfNodes(nodes);
          const [x, y, zoom] = getTransformForBounds(bounds, width, height, minZoom, maxZoom, options.padding);
          const transform = zoomIdentity.translate(x, y).scale(zoom);

          d3Zoom.transform(d3Selection, transform);
        },
        setCenter: (x, y, zoom) => {
          const { width, height, maxZoom } = store.getState();

          const nextZoom = typeof zoom !== 'undefined' ? zoom : maxZoom;
          const centerX = width / 2 - x * nextZoom;
          const centerY = height / 2 - y * nextZoom;
          const transform = zoomIdentity.translate(centerX, centerY).scale(nextZoom);

          d3Zoom.transform(d3Selection, transform);
        },
        fitBounds: (bounds, padding = 0.1) => {
          const { width, height, minZoom, maxZoom } = store.getState();
          const [x, y, zoom] = getTransformForBounds(bounds, width, height, minZoom, maxZoom, padding);
          const transform = zoomIdentity.translate(x, y).scale(zoom);

          d3Zoom.transform(d3Selection, transform);
        },
        initialized: true,
      };
    }

    return initialZoomPanHelper;
  }, [d3Zoom, d3Selection]);

  return zoomPanHelperFunctions;
};

export default usePanZoomHelper;
