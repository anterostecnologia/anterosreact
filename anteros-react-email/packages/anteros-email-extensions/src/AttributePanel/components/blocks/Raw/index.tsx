import React from 'react';
import { Stack, useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { TextField } from '@extensions/components/Form';

export function Raw() {
  const { focusIdx } = useFocusIdx();

  return (
    <Stack>
      <TextField
        label='conteúdo'
        name={`${focusIdx}.data.value.content`}
        inline
      />
    </Stack>
  );
}
