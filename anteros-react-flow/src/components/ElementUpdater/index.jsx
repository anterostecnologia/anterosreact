import { useEffect } from 'react';

import { useStoreActions } from '../../store/hooks';


const ElementUpdater = ({ elements }) => {
  const setElements = useStoreActions((actions) => actions.setElements);

  useEffect(() => {
    setElements(elements);
  }, [elements]);

  return null;
};

export default ElementUpdater;
