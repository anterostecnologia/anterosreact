import React, { useMemo } from 'react';
import { NumberField, TextField } from '../../../components/Form';
import { useFocusIdx, Stack, TextStyle } from '@anterostecnologia/anteros-email-editor';

export function Decoration() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack key={focusIdx} vertical spacing='extraTight'>
        <TextStyle variation='strong' size='large'>
          Decoration
        </TextStyle>
        <TextField
          label='Raio da borda'
          name={`${focusIdx}.attributes.borderRadius`}
          inline
        />
        <TextField
          label='Borda'
          name={`${focusIdx}.attributes.border`}
          inline
          alignment='center'
        />
        <NumberField
          label='Opacidade'
          max={1}
          min={0}
          step={0.1}
          name={`${focusIdx}.attributes.opacity`}
          inline
          alignment='center'
        />
      </Stack>
    );
  }, [focusIdx]);
}
