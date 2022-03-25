import React, { useMemo } from 'react';
import { Stack, useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { RadioGroupField } from '../../../components/Form';

const options = [
  {
    value: 'left',
    label: 'Esquerda',
  },
  {
    value: 'center',
    label: 'Centro',
  },
  {
    value: 'right',
    label: 'Direita',
  },
];

export function Align({ inline }: { inline?: boolean }) {
  const { focusIdx } = useFocusIdx();

  return (
    <RadioGroupField
      label='Alinhamento'
      name={`${focusIdx}.attributes.align`}
      options={options}
    />
  );
}
