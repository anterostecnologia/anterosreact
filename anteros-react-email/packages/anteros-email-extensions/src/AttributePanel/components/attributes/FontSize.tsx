import React from 'react';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { InputWithUnitField } from '../../../components/Form';

export function FontSize() {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label='Tamanho fonte'
      name={`${focusIdx}.attributes.font-size`}
    />
  );
}
