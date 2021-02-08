import { Store } from 'easy-peasy';

import { StoreModel } from '../store';
import { clampPosition } from '.';

export const isEdge = (element) =>
  'id' in element && 'source' in element && 'target' in element;

export const isNode = (element) =>
  'id' in element && !('source' in element) && !('target' in element);

export const getOutgoers = (node, elements) => {
  if (!isNode(node)) {
    return [];
  }

  const outgoerIds = elements.filter((e) => isEdge(e) && e.source === node.id).map((e) => (e).target);
  return elements.filter((e) => outgoerIds.includes(e.id));
};

export const getIncomers = (node, elements) => {
  if (!isNode(node)) {
    return [];
  }

  const incomersIds = elements.filter((e) => isEdge(e) && e.target === node.id).map((e) => (e).source);
  return elements.filter((e) => incomersIds.includes(e.id));
};

export const removeElements = (elementsToRemove, elements) => {
  const nodeIdsToRemove = elementsToRemove.map((n) => n.id);

  return elements.filter((element) => {
    const edgeElement = element;
    return !(
      nodeIdsToRemove.includes(element.id) ||
      nodeIdsToRemove.includes(edgeElement.target) ||
      nodeIdsToRemove.includes(edgeElement.source)
    );
  });
};

const getEdgeId = ({ source, sourceHandle, target, targetHandle }) =>
  `reactflow__edge-${source}${sourceHandle}-${target}${targetHandle}`;

const connectionExists = (edge, elements) => {
  return elements.some(
    (el) =>
      isEdge(el) &&
      el.source === edge.source &&
      el.target === edge.target &&
      (el.sourceHandle === edge.sourceHandle || (!el.sourceHandle && !edge.sourceHandle)) &&
      (el.targetHandle === edge.targetHandle || (!el.targetHandle && !edge.targetHandle))
  );
};

export const addEdge = (edgeParams, elements) => {
  if (!edgeParams.source || !edgeParams.target) {
    console.warn("Can't create edge. An edge needs a source and a target.");
    return elements;
  }

  let edge;
  if (isEdge(edgeParams)) {
    edge = { ...edgeParams };
  } else {
    edge = {
      ...edgeParams,
      id: getEdgeId(edgeParams),
    };
  }

  if (connectionExists(edge, elements)) {
    return elements;
  }

  return elements.concat(edge);
};

export const updateEdge = (oldEdge, newConnection, elements) => {
  if (!newConnection.source || !newConnection.target) {
    console.warn("Can't create new edge. An edge needs a source and a target.");
    return elements;
  }

  const foundEdge = elements.find((e) => isEdge(e) && e.id === oldEdge.id);

  if (!foundEdge) {
    console.warn(`The old edge with id=${oldEdge.id} does not exist.`);
    return elements;
  }

  // Remove old edge and create the new edge with parameters of old edge.
  const edge = {
    ...oldEdge,
    id: getEdgeId(newConnection),
    source: newConnection.source,
    target: newConnection.target,
    sourceHandle: newConnection.sourceHandle,
    targetHandle: newConnection.targetHandle,
  };

  return elements.filter((e) => e.id !== oldEdge.id).concat(edge);
};

export const pointToRendererPoint = (
  { x, y },
  [tx, ty, tScale],
  snapToGrid,
  [snapX, snapY]
) => {
  const position = {
    x: (x - tx) / tScale,
    y: (y - ty) / tScale,
  };

  if (snapToGrid) {
    return {
      x: snapX * Math.round(position.x / snapX),
      y: snapY * Math.round(position.y / snapY),
    };
  }

  return position;
};

export const onLoadProject = (currentStore) => {
  return (position) => {
    const { transform, snapToGrid, snapGrid } = currentStore.getState();

    return pointToRendererPoint(position, transform, snapToGrid, snapGrid);
  };
};

export const parseElement = (element) => {
  if (!element.id) {
    throw new Error('All nodes and edges need to have an id.');
  }

  if (isEdge(element)) {
    return {
      ...element,
      source: element.source.toString(),
      target: element.target.toString(),
      sourceHandle: element.sourceHandle ? element.sourceHandle.toString() : null,
      targetHandle: element.targetHandle ? element.targetHandle.toString() : null,
      id: element.id.toString(),
      type: element.type || 'default',
    };
  }

  return {
    ...element,
    id: element.id.toString(),
    type: element.type || 'default',
    __rf: {
      position: clampPosition(element.position, nodeExtent),
      width: null,
      height: null,
      handleBounds: {},
      isDragging: false,
    },
  };
};

const getBoundsOfBoxes = (box1, box2) => ({
  x: Math.min(box1.x, box2.x),
  y: Math.min(box1.y, box2.y),
  x2: Math.max(box1.x2, box2.x2),
  y2: Math.max(box1.y2, box2.y2),
});

export const rectToBox = ({ x, y, width, height }) => ({
  x,
  y,
  x2: x + width,
  y2: y + height,
});

export const boxToRect = ({ x, y, x2, y2 }) => ({
  x,
  y,
  width: x2 - x,
  height: y2 - y,
});

export const getBoundsofRects = (rect1, rect2) =>
  boxToRect(getBoundsOfBoxes(rectToBox(rect1), rectToBox(rect2)));

export const getRectOfNodes = (nodes) => {
  const box = nodes.reduce(
    (currBox, { __rf: { position, width, height } = {} }) =>
      getBoundsOfBoxes(currBox, rectToBox({ ...position, width, height })),
    { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity }
  );

  return boxToRect(box);
};

export const graphPosToZoomedPos = ({ x, y }, [tx, ty, tScale]) => ({
  x: x * tScale + tx,
  y: y * tScale + ty,
});

export const getNodesInside = (
  nodes,
  rect,
  [tx, ty, tScale] = [0, 0, 1],
  partially = false
) => {
  const rBox = rectToBox({
    x: (rect.x - tx) / tScale,
    y: (rect.y - ty) / tScale,
    width: rect.width / tScale,
    height: rect.height / tScale,
  });

  return nodes.filter(({ __rf: { position, width, height, isDragging } }) => {
    const nBox = rectToBox({ ...position, width, height });
    const xOverlap = Math.max(0, Math.min(rBox.x2, nBox.x2) - Math.max(rBox.x, nBox.x));
    const yOverlap = Math.max(0, Math.min(rBox.y2, nBox.y2) - Math.max(rBox.y, nBox.y));
    const overlappingArea = Math.ceil(xOverlap * yOverlap);

    if (width === null || height === null || isDragging) {
      // nodes are initialized with width and height = null
      return true;
    }

    if (partially) {
      return overlappingArea > 0;
    }

    const area = width * height;

    return overlappingArea >= area;
  });
};

export const getConnectedEdges = (nodes, edges) => {
  const nodeIds = nodes.map((node) => node.id);

  return edges.filter((edge) => nodeIds.includes(edge.source) || nodeIds.includes(edge.target));
};

const parseElements = (nodes, edges) => {
  return [
    ...nodes.map((node) => {
      const n = { ...node };

      n.position = n.__rf.position;

      delete n.__rf;
      return n;
    }),
    ...edges.map((e) => ({ ...e })),
  ];
};

export const onLoadGetElements = (currentStore) => {
  return () => {
    const { nodes = [], edges = [] } = currentStore.getState();

    return parseElements(nodes, edges);
  };
};

export const onLoadToObject = (currentStore) => {
  return () => {
    const { nodes = [], edges = [], transform } = currentStore.getState();

    return {
      elements: parseElements(nodes, edges),
      position: [transform[0], transform[1]],
      zoom: transform[2],
    };
  };
};
