import React, { useMemo } from 'react';
import { useFocusIdx, Stack } from '@anterostecnologia/anteros-email-editor';
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

export function TextAlign({ name }: { name?: string; }) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack>
        <RadioGroupField
          label='Alinhamento texto'
          name={name || `${focusIdx}.attributes.text-align`}
          options={options}
        />
      </Stack>
    );
  }, [focusIdx, name]);
}
