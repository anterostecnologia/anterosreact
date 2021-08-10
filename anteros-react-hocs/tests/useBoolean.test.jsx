import useBoolean from '../src/hooks/useBoolean';
import useToggle from '../src/hooks/useToggle';

it('deve ser um alias para useToggle', () => {
  expect(useBoolean).toBe(useToggle);
});
