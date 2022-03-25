/* eslint-disable @typescript-eslint/no-unsafe-call */
import { getShadowRoot } from '@anterostecnologia/anteros-email-editor';
import React, { useEffect, useMemo, useState } from 'react';

export const SelectionRangeContext = React.createContext<{
  selectionRange: Range | null;
  setSelectionRange: React.Dispatch<React.SetStateAction<Range | null>>;
}>({
  selectionRange: null,
  setSelectionRange: () => {},
});

export const SelectionRangeProvider: React.FC<{}> = (props) => {
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  useEffect(() => {
    const onSelectionChange = () => {
      try {
        const range = (getShadowRoot() as any).getSelection().getRangeAt(0);
        if (range) {
          setSelectionRange(range);
        }
      } catch (error) {}
    };

    document.addEventListener('selectionchange', onSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, []);

  const value = useMemo(() => {
    return {
      selectionRange,
      setSelectionRange,
    };
  }, [selectionRange]);

  return useMemo(() => {
    return (
      <SelectionRangeContext.Provider value={value}>
        {props.children}
      </SelectionRangeContext.Provider>
    );
  }, [props.children, value]);
};
