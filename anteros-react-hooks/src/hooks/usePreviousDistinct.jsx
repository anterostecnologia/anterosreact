import { useRef } from 'react';
import { useFirstMountState } from './useFirstMountState';


const strictEquals = (prev, next) => prev === next;

export default function usePreviousDistinct(value, compare = strictEquals) {
  const prevRef = useRef();
  const curRef = useRef(value);
  const isFirstMount = useFirstMountState();

  if (!isFirstMount && !compare(curRef.current, value)) {
    prevRef.current = curRef.current;
    curRef.current = value;
  }

  return prevRef.current;
}
