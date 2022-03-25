import React, { useMemo } from 'react';
import { ColorPickerField } from '../../../components/Form';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';

export function ContainerBackgroundColor({
  title = 'Cor fundo contêiner',
}: {
  title?: string;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label={title}
        name={`${focusIdx}.attributes.container-background-color`}
        alignment='center'
      />
    );
  }, [focusIdx, title]);
}
