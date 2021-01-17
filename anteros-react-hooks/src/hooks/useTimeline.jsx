import { useRef } from 'react';
import usePrevious from './usePrevious';
import { MAX_SMALL_INTEGER } from './util';

/**
 * Records states of a value over time.
 *
 * @param value Props, state or any other calculated value.
 * @param maxLength Maximum amount of states to store at once. Should be an integer greater than 1.
 * @returns Results of state updates in chronological order.
 *
 * @example
 * function Component() {
 *   const [count, setCount] = useState(0);
 *   const counts = useTimeline(count);
 *   // ...
 *   return `Now: ${count}, history: ${counts}`;
 * }
 */
export default function useTimeline(
  value,
  maxLength = MAX_SMALL_INTEGER,
) {
  const valuesRef = useRef([]);
  const prevValue = usePrevious(value);

  if (!Object.is(value, prevValue)) {
    // Use immutable refs to behave like state variables
    valuesRef.current = [...valuesRef.current, value];
  }

  if (valuesRef.current.length > maxLength) {
    valuesRef.current.splice(0, valuesRef.current.length - maxLength);
  }

  return valuesRef.current;
}
