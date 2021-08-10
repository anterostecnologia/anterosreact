# `useCounter`

React state hook that tracks a numeric value.

`useNumber` is an alias for `useCounter`.


## Usage

```jsx
import {useCounter, useNumber} from 'react-use';

const Demo = () => {
  const [min, { inc: incMin, dec: decMin }] = useCounter(1);
  const [max, { inc: incMax, dec: decMax }] = useCounter(10);
  const [value, { inc, dec, set, reset }] = useCounter(5, max, min);

  return (
    <div>
      <div>
        current: { value } [min: { min }; max: { max }]
      </div>

      <br />
      Current value: <button onClick={ () => inc() }>Increment</button>
      <button onClick={ () => dec() }>Decrement</button>
      <button onClick={ () => inc(5) }>Increment (+5)</button>
      <button onClick={ () => dec(5) }>Decrement (-5)</button>
      <button onClick={ () => set(100) }>Set 100</button>
      <button onClick={ () => reset() }>Reset</button>
      <button onClick={ () => reset(25) }>Reset (25)</button>

      <br />
      <br />
      Min value:
      <button onClick={ () => incMin() }>Increment</button>
      <button onClick={ () => decMin() }>Decrement</button>

      <br />
      <br />
      Max value:
      <button onClick={ () => incMax() }>Increment</button>
      <button onClick={ () => decMax() }>Decrement</button>
    </div>
  );
};
```


## Reference

```ts 
const [ current, { inc, dec, get, set, reset } ] = useCounter(initial, max | null = null, min | null = null);
```
- `current` - current counter value;
- `get()` - getter of current counter value;
- `inc(delta): void` - increment current value;
- `dec(delta): void` - decrement current value;
- `set(value): void` - set arbitrary value;
- `reset(value): void` - as the `set`, but also will assign value by reference to the `initial` parameter;
