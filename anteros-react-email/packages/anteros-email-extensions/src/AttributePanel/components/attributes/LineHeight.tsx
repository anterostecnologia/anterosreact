import React from 'react';
import { InputWithUnitField } from '../../../components/Form';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';

export function LineHeight({ name }: { name?: string; }) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label='Altura linha'
      unitOptions='percent'
      name={name || `${focusIdx}.attributes.line-height`}
    />
  );
}
