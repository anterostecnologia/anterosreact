import useCounter from '../src/hooks/useCounter';
import useNumber from '../src/hooks/useNumber';

it('should be an alias for useCounter', () => {
  expect(useNumber).toBe(useCounter);
});
