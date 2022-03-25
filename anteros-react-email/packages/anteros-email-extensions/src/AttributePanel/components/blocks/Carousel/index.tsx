import React from 'react';
import {
  ColorPickerField,
  EditTabField,
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  SelectField,
  TextField,
} from '@extensions/components/Form';
import { IconLink } from '@arco-design/web-react/icon';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { Stack, useEditorProps, useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Align } from '@extensions/AttributePanel/components/attributes/Align';
import { ICarousel } from '@anterostecnologia/anteros-email-core';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';

const options = [
  {
    value: 'hidden',
    label: 'hidden',
  },
  {
    value: 'visible',
    label: 'visible',
  },
];

export function Carousel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3', '4']}>
        <Collapse.Item name='0' header='Dimensão'>
          <Space direction='vertical'>
            <InputWithUnitField
              label='Largura da miniatura'
              name={`${focusIdx}.attributes.tb-width`}
              quickchange
              inline
            />

            <RadioGroupField
              label='Miniaturas'
              name={`${focusIdx}.attributes.thumbnails`}
              options={options}
              inline
            />
            <Align inline />
          </Space>
        </Collapse.Item>
        <Collapse.Item name='4' contentStyle={{ padding: 0 }} header='Imagens'>
          <Stack vertical spacing='tight'>
            <EditTabField
              tabPosition='top'
              name={`${focusIdx}.data.value.images`}
              label=''
              labelHidden
              renderItem={(item, index) => (
                <CarouselImage item={item} index={index} />
              )}
              additionItem={{
                src: 'https://www.mailjet.com/wp-content/uploads/2016/11/ecommerce-guide.jpg',
                target: '_blank',
              }}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item name='3' header='Icon'>
          <Grid.Row>
            <Grid.Col span={11}>
              <TextField
                label='Icon esquerda'
                name={`${focusIdx}.attributes.left-icon`}
              />
            </Grid.Col>
            <Grid.Col offset={1} span={11}>
              <TextField
                label='Icone direita'
                name={`${focusIdx}.attributes.right-icon`}
              />
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col span={11}>
              <InputWithUnitField
                label='Largura icone'
                name={`${focusIdx}.attributes.icon-width`}
              />
            </Grid.Col>
            <Grid.Col offset={1} span={11} />
          </Grid.Row>
        </Collapse.Item>

        <Collapse.Item name='1' header='Borda'>
          <Grid.Row>
            <Grid.Col span={11}>
              <ColorPickerField
                label='Borda suspensa'
                name={`${focusIdx}.attributes.tb-hover-border-color`}
                alignment='center'
              />
            </Grid.Col>
            <Grid.Col offset={1} span={11}>
              <ColorPickerField
                label='Borda selecionada'
                name={`${focusIdx}.attributes.tb-selected-border-color`}
                alignment='center'
              />
            </Grid.Col>
          </Grid.Row>
          <Grid.Row>
            <Grid.Col span={11}>
              <TextField
                label='Borda das miniaturas'
                name={`${focusIdx}.attributes.tb-border`}
              />
            </Grid.Col>
            <Grid.Col offset={1} span={11}>
              <TextField
                label='Raio da borda das miniaturas'
                name={`${focusIdx}.attributes.tb-border-radius`}
              />
            </Grid.Col>
          </Grid.Row>
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

function CarouselImage({
  item,
  index,
}: {
  item: ICarousel['data']['value']['images'];
  index: number;
}) {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage, onGetImageGallery } = useEditorProps();
  return (
    <Space direction='vertical'>
      <ImageUploaderField
        label='Imagem'
        labelHidden
        name={`${focusIdx}.data.value.images.[${index}].src`}
        onGetImageGallery={onGetImageGallery}
        helpText='O sufixo da imagem deve ser .jpg, jpeg, png, gif, etc. Caso contrário, a imagem pode não ser exibida normalmente.'
        uploadHandler={onUploadImage}
      />
      <Grid.Row>
        <Grid.Col span={11}>
          <TextField
            prefix={<IconLink />}
            label='Url'
            name={`${focusIdx}.data.value.images.[${index}].href`}
          />
        </Grid.Col>
        <Grid.Col offset={1} span={11}>
          <SelectField
            label='Destino'
            name={`${focusIdx}.data.value.images.[${index}].target`}
            options={[
              {
                value: '',
                label: '_self',
              },
              {
                value: '_blank',
                label: '_blank',
              },
            ]}
          />
        </Grid.Col>
      </Grid.Row>

      <TextField
        label='Titulo'
        name={`${focusIdx}.data.value.image.[${index}].title`}
      />
    </Space>
  );
}
