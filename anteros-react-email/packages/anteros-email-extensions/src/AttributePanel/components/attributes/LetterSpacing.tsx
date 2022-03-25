import React from 'react';
import { InputWithUnitField } from '../../../components/Form';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';

export function LetterSpacing({ name }: { name?: string; }) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label='Espaçamento entre letras'
      name={name || `${focusIdx}.attributes.letter-spacing`}
    />
  );
}
