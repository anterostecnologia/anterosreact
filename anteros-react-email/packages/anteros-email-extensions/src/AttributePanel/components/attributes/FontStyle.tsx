import React, { useMemo } from 'react';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { RadioGroupField } from '../../../components/Form';

const options = [
  {
    value: 'normal',
    label: 'Normal',
  },
  {
    value: 'italic',
    label: 'Italic',
  },
];

export function FontStyle({ name }: { name?: string; }) {
  const { focusIdx } = useFocusIdx();

  return (
    <RadioGroupField
      label='Estilo fonte'
      name={name || `${focusIdx}.attributes.font-style`}
      options={options}
    />
  );
}
