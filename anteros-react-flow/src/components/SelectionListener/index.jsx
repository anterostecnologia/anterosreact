import { useEffect } from 'react';
import { useStoreState } from '../../store/hooks';

// This is just a helper component for calling the onSelectionChange listener.
// As soon as easy-peasy has implemented the effectOn hook, we can remove this component
// and use the hook instead. https://github.com/ctrlplusb/easy-peasy/pull/459

export default ({ onSelectionChange }) => {
  const selectedElements = useStoreState((s) => s.selectedElements);

  useEffect(() => {
    onSelectionChange(selectedElements);
  }, [selectedElements]);

  return null;
};
