import React, { useMemo } from 'react';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { TextField } from '../../../components/Form';

export function BorderWidth() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <TextField
        label='Largura'
        quickchange
        name={`${focusIdx}.attributes.border-width`}
      />
    );
  }, [focusIdx]);
}
