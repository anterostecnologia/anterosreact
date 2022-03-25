import React, { useMemo } from 'react';
import { ColorPickerField } from '../../../components/Form';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';

export function BorderColor() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label='Cor'
        name={`${focusIdx}.attributes.border-color`}
      />
    );
  }, [focusIdx]);
}
