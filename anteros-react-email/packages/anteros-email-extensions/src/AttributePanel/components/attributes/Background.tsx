import React, { useContext, useMemo } from 'react';
import {
  ImageUploaderField,
  InputWithUnitField,
  SelectField,
  TextField,
} from '../../../components/Form';
import { Stack, useFocusIdx, useEditorProps } from '@anterostecnologia/anteros-email-editor';
import { BackgroundColor } from './BackgroundColor';
import { Grid, Space } from '@arco-design/web-react';

const backgroundRepeatOptions = [
  {
    value: 'no-repeat',
    label: 'No repeat',
  },
  {
    value: 'repeat',
    label: 'Repeat',
  },
  {
    value: 'repeat-x',
    label: 'Repeat X',
  },
  {
    value: 'repeat-y',
    label: 'Repeat Y',
  },
];

export function Background() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage, onGetImageGallery } = useEditorProps();
  return useMemo(() => {
    return (
      <Space key={focusIdx} direction='vertical'>
        <ImageUploaderField
          label='Imagem fundo'
          name={`${focusIdx}.attributes.background-url`}
          onGetImageGallery={onGetImageGallery}
          helpText='O sufixo da imagem deve ser .jpg, jpeg, png, gif, etc. Caso contrário, a imagem pode não ser exibida normalmente.'
          uploadHandler={onUploadImage}
        />

        <Grid.Row>
          <Grid.Col span={11}>
            <BackgroundColor />
          </Grid.Col>
          <Grid.Col offset={1} span={11}>
            <SelectField
              label='Fundo de repetição'
              name={`${focusIdx}.attributes.background-repeat`}
              options={backgroundRepeatOptions}
            />
          </Grid.Col>
        </Grid.Row>
        <TextField
          label='Tamanho fundo'
          name={`${focusIdx}.attributes.background-size`}
        />
      </Space>
    );
  }, [focusIdx, onUploadImage]);
}
