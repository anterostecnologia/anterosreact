import React, { useMemo } from 'react';
import { ColorPickerField } from '../../../components/Form';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';

export function BackgroundColor({
  title = 'Cor fundo',
}: {
  title?: string;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label={title}
        name={`${focusIdx}.attributes.background-color`}
        alignment='center'
      />
    );
  }, [focusIdx, title]);
}
