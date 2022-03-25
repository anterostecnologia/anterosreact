import React from 'react';
import {
  ColorPickerField,
  InputWithUnitField,
  SwitchField,
  TextAreaField,
  TextField,
} from '@extensions/components/Form';
import { Help } from '@extensions/AttributePanel/components/UI/Help';
import { AddFont } from '@extensions/components/Form/AddFont';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { Stack, TextStyle, useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { FontFamily } from '../../attributes/FontFamily';

export function Page() {
  const { focusIdx } = useFocusIdx();

  if (!focusIdx) return null;
  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <Stack.Item fill>
        <Collapse defaultActiveKey={['0', '1']}>
          <Collapse.Item name='0' header='Configuração E-mail'>
            <Space direction='vertical'>
              <TextField label='Assunto' name={'subject'} inline />
              <TextField label='Subtítulo' name={'subTitle'} inline />
              <InputWithUnitField
                label='largura'
                name={`${focusIdx}.attributes.width`}
                inline
              />
              <InputWithUnitField
                label='Ponto de interrupção'
                helpText='Permite controlar em qual ponto de interrupção o layout deve ser desktop/mobile.'
                name={`${focusIdx}.data.value.breakpoint`}
                inline
              />
            </Space>
          </Collapse.Item>
          <Collapse.Item name='1' header='Configuração Tema'>
            <Stack vertical spacing='tight'>
              <Grid.Row>
                <Grid.Col span={11}>
                  <FontFamily name={`${focusIdx}.data.value.font-family`} />
                </Grid.Col>
                <Grid.Col offset={1} span={11}>
                  <InputWithUnitField
                    label='Tamanho fonte'
                    name={`${focusIdx}.data.value.font-size`}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <Grid.Col span={11}>
                  <InputWithUnitField
                    label='Altura linha'
                    unitOptions='percent'
                    name={`${focusIdx}.data.value.line-height`}
                  />
                </Grid.Col>
                <Grid.Col offset={1} span={11}>
                  <InputWithUnitField
                    label='Peso fonte'
                    unitOptions='percent'
                    name={`${focusIdx}.data.value.font-weight`}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <Grid.Col span={11}>
                  <ColorPickerField
                    label='Cor texto'
                    name={`${focusIdx}.data.value.text-color`}
                  />
                </Grid.Col>
                <Grid.Col offset={1} span={11}>
                  <ColorPickerField
                    label='Fundo'
                    name={`${focusIdx}.attributes.background-color`}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <ColorPickerField
                  label='Conteúdo fundo'
                  name={`${focusIdx}.data.value.content-background-color`}
                />

              </Grid.Row>

              <TextAreaField
                autoSize
                label='Estilo usuário'
                name={`${focusIdx}.data.value.user-style.content`}
              />
              <Stack.Item />
              <Stack.Item />
              <AddFont />
              <Stack.Item />
              <Stack.Item />
            </Stack>
          </Collapse.Item>
        </Collapse>
      </Stack.Item>
    </AttributesPanelWrapper>
  );
}
