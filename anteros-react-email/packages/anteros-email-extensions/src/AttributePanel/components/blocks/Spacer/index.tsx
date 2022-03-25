import React from 'react';
import { Height } from '@extensions/AttributePanel/components/attributes/Height';
import { ContainerBackgroundColor } from '@extensions/AttributePanel/components/attributes/ContainerBackgroundColor';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { Stack } from '@anterostecnologia/anteros-email-editor';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';

export function Spacer() {
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2', '3']}>
        <Collapse.Item name='1' header='Dimensão'>
          <Space direction='vertical'>
            <Height />
            <Padding />
          </Space>
        </Collapse.Item>

        <Collapse.Item name='2' header='Fundo'>
          <ContainerBackgroundColor title='Cor fundo' />
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
