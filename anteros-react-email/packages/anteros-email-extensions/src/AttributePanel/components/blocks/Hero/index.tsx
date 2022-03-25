import React, { useContext } from 'react';
import { BackgroundColor } from '@extensions/AttributePanel/components/attributes/BackgroundColor';
import {
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  TextField,
} from '@extensions/components/Form';
import { Width } from '@extensions/AttributePanel/components/attributes/Width';
import { Height } from '@extensions/AttributePanel/components/attributes/Height';
import { VerticalAlign } from '@extensions/AttributePanel/components/attributes/VerticalAlign';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { Stack, useEditorProps, useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';

const options = [
  {
    value: 'fluid-height',
    label: 'Fluid height',
  },
  {
    value: 'fixed-height',
    label: 'Fixed height',
  },
];

export function Hero() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage, onGetImageGallery } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item name='0' header='Dimensão'>
          <Space direction='vertical'>
            <RadioGroupField
              label='Modo'
              name={`${focusIdx}.attributes.mode`}
              options={options}
            />
            <Grid.Row>
              <Grid.Col span={11}>
                <Width />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <Height />
              </Grid.Col>
            </Grid.Row>

            <Padding />
            <VerticalAlign />
          </Space>
        </Collapse.Item>
        <Collapse.Item name='1' header='Fundo'>
          <Space direction='vertical'>
            <ImageUploaderField
              label='src'
              name={`${focusIdx}.attributes.background-url`}
              onGetImageGallery={onGetImageGallery}
              helpText='O sufixo da imagem deve ser .jpg, jpeg, png, gif, etc. Caso contrário, a imagem pode não ser exibida normalmente.'
              uploadHandler={onUploadImage}
            />

            <Grid.Row>
              <Grid.Col span={11}>
                <InputWithUnitField
                  label='Largura fundo'
                  name={`${focusIdx}.attributes.background-width`}
                />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <InputWithUnitField
                  label='Altura fundo'
                  name={`${focusIdx}.attributes.background-height`}
                />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <TextField
                  label='Posição fundo'
                  name={`${focusIdx}.attributes.background-position`}
                />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <InputWithUnitField
                  label='Raio da borda'
                  name={`${focusIdx}.attributes.border-radius`}
                  unitOptions='percent'
                />
              </Grid.Col>
              <Grid.Col span={11}>
                <BackgroundColor />
              </Grid.Col>
            </Grid.Row>
          </Space>
        </Collapse.Item>
        <Collapse.Item name='4' header='Extra'>
          <Grid.Col span={24}>
            <ClassName />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
