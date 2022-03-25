import React, { useMemo } from 'react';
import { useFocusIdx, Stack } from '@anterostecnologia/anteros-email-editor';
import { SelectField } from '../../../components/Form';

const options = [
  {
    value: 'top',
    label: 'Topo',
  },
  {
    value: 'middle',
    label: 'Meio',
  },
  {
    value: 'bottom',
    label: 'Abaixo',
  },
];

export function VerticalAlign({
  attributeName = 'vertical-align',
}: {
  attributeName?: string;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack>
        <SelectField
          style={{ width: 120 }}
          label='Alinhamento vertical'
          name={`${focusIdx}.attributes.${attributeName}`}
          options={options}
        />
      </Stack>
    );
  }, [attributeName, focusIdx]);
}
