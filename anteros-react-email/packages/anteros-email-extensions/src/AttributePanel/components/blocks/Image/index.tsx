import React, { useContext } from 'react';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import {
  ColorPickerField,
  ImageUploaderField,
  TextField,
} from '@extensions/components/Form';
import { Width } from '@extensions/AttributePanel/components/attributes/Width';
import { Height } from '@extensions/AttributePanel/components/attributes/Height';
import { Link } from '@extensions/AttributePanel/components/attributes/Link';
import { Align } from '@extensions/AttributePanel/components/attributes/Align';

import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Button, Collapse, Grid, Space } from '@arco-design/web-react';
import { Border } from '@extensions/AttributePanel/components/attributes/Border';
import { Stack, useEditorProps, useFocusIdx, IconFont } from '@anterostecnologia/anteros-email-editor';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';

export function Image() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage, onGetImageGallery } = useEditorProps();

  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3', '4']}>
        <Collapse.Item name='1' header='Configuração'>
          <Stack vertical spacing='tight'>
            <ImageUploaderField
              label='src'
              labelHidden
              onGetImageGallery={onGetImageGallery}
              name={`${focusIdx}.attributes.src`}
              helpText='O sufixo da imagem deve ser .jpg, jpeg, png, gif, etc. Caso contrário, a imagem pode não ser exibida normalmente.'
              uploadHandler={onUploadImage}
            />
            <ColorPickerField
              label='Cor fundo'
              name={`${focusIdx}.attributes.container-background-color`}
              inline
              alignment='center'
            />
          </Stack>
        </Collapse.Item>

        <Collapse.Item name='0' header='Dimensão'>
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={11}>
                <Width />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <Height />
              </Grid.Col>
            </Grid.Row>

            <Padding />
            <Grid.Row>
              <Grid.Col span={24}>
                <Align />
              </Grid.Col>
            </Grid.Row>
          </Space>
        </Collapse.Item>

        <Collapse.Item name='2' header='Link'>
          <Stack vertical spacing='tight'>
            <Link />
          </Stack>
        </Collapse.Item>

        <Collapse.Item name='3' header='Borda'>
          <Border />
        </Collapse.Item>

        <Collapse.Item name='4' header='Extra'>
          <Grid.Row>
            <Grid.Col span={11}>
              <TextField label='Titulo' name={`${focusIdx}.attributes.title`} />
            </Grid.Col>
            <Grid.Col offset={1} span={11}>
              <TextField label='alt' name={`${focusIdx}.attributes.alt`} />
            </Grid.Col>
          </Grid.Row>
          <Grid.Col span={24}>
            <TextField
              label='Nome da classe'
              name={`${focusIdx}.attributes.css-class`}
            />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
