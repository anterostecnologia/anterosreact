import { Stack } from '@demo/components/Stack';
import { useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import {
  AttributesPanelWrapper,
  ColorPickerField,
  NumberField,
  TextField,
} from '@anterostecnologia/anteros-email-extensions';
import React from 'react';

export function Panel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper style={{ padding: '20px' }}>
      <Stack vertical>
        <NumberField
          label='Quantidade'
          inline
          max={6}
          name={`${focusIdx}.data.value.quantity`}
        />
        <TextField
          label='Título'
          name={`${focusIdx}.data.value.title`}
          inline
          alignment='center'
        />
        <TextField
          label='Button text'
          name={`${focusIdx}.data.value.buttonText`}
          inline
          alignment='center'
        />
        <ColorPickerField
          label='Cor fundo'
          name={`${focusIdx}.attributes.background-color`}
          inline
          alignment='center'
        />
        <ColorPickerField
          label='Title color'
          name={`${focusIdx}.attributes.title-color`}
          inline
          alignment='center'
        />
        <ColorPickerField
          label='Cor do nome do produto'
          name={`${focusIdx}.attributes.product-name-color`}
          inline
          alignment='center'
        />
        <ColorPickerField
          label='Cor do preço do produto'
          name={`${focusIdx}.attributes.product-price-color`}
          inline
          alignment='center'
        />
        <ColorPickerField
          label='Cor botão'
          name={`${focusIdx}.attributes.button-color`}
          inline
          alignment='center'
        />
        <ColorPickerField
          label='Cor texto botão'
          name={`${focusIdx}.attributes.button-text-color`}
          inline
          alignment='center'
        />
      </Stack>
    </AttributesPanelWrapper>
  );
}
