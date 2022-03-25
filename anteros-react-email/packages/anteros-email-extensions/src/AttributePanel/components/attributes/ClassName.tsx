import React, { useMemo } from 'react';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { TextField } from '../../../components/Form';

export function ClassName() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <TextField label='Nome da classe' name={`${focusIdx}.attributes.css-class`} />
    );
  }, [focusIdx]);
}
