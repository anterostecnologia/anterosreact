import React, { useMemo } from 'react';
import { useFocusIdx, Stack } from '@anterostecnologia/anteros-email-editor';
import { RadioGroupField } from '../../../components/Form';

const options = [
  {
    value: 'ltr',
    label: 'ltr',
  },
  {
    value: 'rtl',
    label: 'rtl',
  },
];

export function Direction() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack>
        <RadioGroupField
          label='Direção'
          name={`${focusIdx}.attributes.direction`}
          options={options}
          inline
        />
      </Stack>
    );
  }, [focusIdx]);
}
