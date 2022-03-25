import React from 'react';
import { Stack, useFocusIdx } from '@anterostecnologia/anteros-email-editor';

import { Padding } from '../../attributes/Padding';
import { BackgroundColor } from '../../attributes/BackgroundColor';
import { Color } from '../../attributes/Color';
import { TextAreaField } from '../../../../components/Form';
import { FontSize } from '../../attributes/FontSize';
import { FontWeight } from '../../attributes/FontWeight';
import { FontFamily } from '../../attributes/FontFamily';
import { LineHeight } from '../../attributes/LineHeight';
import { AttributesPanelWrapper } from '../../attributes/AttributesPanelWrapper';
import { Collapse, Grid, Space } from '@arco-design/web-react';

export function AccordionText() {
  const { focusIdx } = useFocusIdx();

  return (
    <AttributesPanelWrapper>
      <Collapse defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item name='0' header='Configuração'>
          <Space direction='vertical'>
            <TextAreaField
              label='Conteúdo'
              name={`${focusIdx}.data.value.content`}
            />
            <Grid.Row>
              <Grid.Col span={11}>
                <Color />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <FontSize />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={11}>
                <LineHeight />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <FontWeight />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={11}>
                <FontFamily />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <BackgroundColor />
              </Grid.Col>
            </Grid.Row>

            <Padding title='Espaçamento' attributeName='padding' />
          </Space>
        </Collapse.Item>
      </Collapse>
    </AttributesPanelWrapper>
  );
}
