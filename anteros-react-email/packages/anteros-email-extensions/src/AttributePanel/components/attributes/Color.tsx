import React from 'react';
import { ColorPickerField } from '../../../components/Form';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';

export function Color({
  title = 'Cor',
}: {
  title?: string;
  inline?: boolean;
}) {
  const { focusIdx } = useFocusIdx();

  return (
    <ColorPickerField
      label={title}
      name={`${focusIdx}.attributes.color`}
      alignment='center'
    />
  );
}
