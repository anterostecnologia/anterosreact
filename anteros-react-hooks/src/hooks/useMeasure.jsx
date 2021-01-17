import { useState, useMemo } from 'react';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';
import { isClient } from './util';

const defaultState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

const useMeasure = () => {
  const [element, ref] = useState(null);
  const [rect, setRect] = useState(defaultState);

  const observer = useMemo(
    () =>
      new window.ResizeObserver((entries) => {
        if (entries[0]) {
          const { x, y, width, height, top, left, bottom, right } = entries[0].contentRect;
          setRect({ x, y, width, height, top, left, bottom, right });
        }
      }),
    []
  );

  useIsomorphicLayoutEffect(() => {
    if (!element) return;
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element]);

  return [ref, rect];
};

const useMeasureMock = () => [() => {}, defaultState];

export default isClient && !!window.ResizeObserver ? useMeasure : useMeasureMock;
