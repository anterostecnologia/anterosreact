## Bloco personalizado

O que é um bloco personalizado? O bloco personalizado é composto por um ou mais blocos básicos.

Este é um bloco de seção com seus filhos

```tsx
<Section>
  <Column>
    <Text>Olá</Text>
  </Column>
</Section>
```

Mas também podemos encapsulá-lo e chamá-lo de bloco de seção personalizada.

```tsx
(<CustomSection></CustomSection>).isEqual(
  <Section>
    <Column>
      <Text>Olá</Text>
    </Column>
  </Section>
);
```

Existe essa regra de conversão

`IBlockData<T>` => `transformToMjml`=> `mjml-component<T>`

- transformToMjml(`IText`) === `<mj-text>xxx</mj-text>`
- transformToMjml(`ISection`) === `<mj-section>xxx</mj-section>`

E pode ser revertido

- `<mj-text>xxx</mj-text>` => `MjmlToJson` => `IText`


### Escreva um bloco personalizado

Um bloco personalizado deve ter a seguinte estrutura

```ts
{
  name: string; // nome do bloco
  type: BlockType; // Tipo personalizado
  validParentType: BlockType[]; // Arraste apenas para os blocos acima. Por exemplo, `Text` apenas arraste para `Colum` bloco e bloco `Hero`.
  create: (payload?: RecursivePartial<T extends IBlockData>) => T;
  render?: (
      data: IBlockData<T>, // dados do bloco atual
      idx: string | null,  // idx atual
      mode: 'testing' | 'production', // você pode retornar diferente
      context?: IPage,
      dataSource?: { [key: string]: any } // fonte de dados de JsonToMjml

  ) => IBlockData;
}

```

`create` é um método de geração de instância, digamos `Text`, ao arrastar e soltar no painel de edição e , chamaremos `addBlock`. Na verdade, ele apenas chama o `create` correspondente e gera blockData.

```ts
const create: CreateInstance<IText> = (payload) => {
  const defaultData: IText = {
    type: BasicType.TEXT,
    data: {
      value: {
        content: "Torne mais fácil para todos escrever e-mails!",
      },
    },
    attributes: {
      "font-size": "13px",
      padding: "10px 25px 10px 25px",
      "line-height": 1,
      align: "left",
    },
    children: [],
  };
  return merge(defaultData, payload);
};
```

`render` principalmente para renderizar seu bloco personalizado em um ou mais blocos básicos Quando `JsonToMjml` é chamado, se for encontrado um bloco personalizado, chamaremos seu método `render` para convertê-lo em blocos básicos.

Você pode construir seu bloco personalizado por meio de blocos básicos. Por exemplo,
um botão personalizado, apenas a cor de fundo e o texto podem ser modificados

```tsx
import { Button } from "anteros-email-editor";

const render = (
  data: ICustomButton,
  idx: string,
  context: IPage
): IBlockData => {
  const attributes = data.attributes;
  const { buttonText } = data.data.value;

  const instance = (
    <Button background-color={attributes["background-color"]}>
      {buttonText}
    </Button>
  );

  return instance;
};
```

Outra maneira é que você pode escrever [MJML](https://documentation.mjml.io/).

```ts
import { MjmlToJson } from '@anterostecnologia/anteros-email-editor';

const render = (
  data: ICustomButton,
  idx: string,
  mode: 'testing' | 'production',
  context?: IPage,
  dataSource?: { [key: string]: any }
) => {
  const attributes = data.attributes;
  const { buttonText } = data.data.value;

  const instance = MjmlToJson(
    `<mj-button background-color=${attributes['background-color']}>${buttonText}</mj-button>`
  );

  return instance;
};


```

### Registre este bloco
Somente após registrar este bloco, o mjml-parser pode convertê-lo em blocos básicos

```ts
import { BlocksMap } from "anteros-email-editor";

BlocksMap.registerBlocks({ "block-name": YourCustomBlock });
```


<br/>
<br/>

## Renderização dinâmica

```tsx
import {
  IBlockData,
  BasicType,
  components,
  createCustomBlock,
} from '@anterostecnologia/anteros-email-core';

import { CustomBlocksType } from '../constants';
import React from 'react';
import { merge } from 'lodash';

const { Column, Section, Wrapper, Text, Button, Image, Group } = components;

export type IProductRecommendation = IBlockData<
  {
    'background-color': string;
    'button-color': string;
    'button-text-color': string;
    'product-name-color': string;
    'product-price-color': string;
    'title-color': string;
  },
  {
    title: string;
    buttonText: string;
    quantity: number;
  }
>;

const productPlaceholder = {
  image:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/MZPr8r9RXxScSoL/download',
  title: 'Red Flock Buckle Winter Boots',
  price: '$59.99 HKD',
  url: 'https://infra.relevantsolutions.com.br',
};

export const ProductRecommendation = createCustomBlock<IProductRecommendation>({
  name: 'Recomendação de produto',
  type: CustomBlocksType.PRODUCT_RECOMMENDATION,
  validParentType: [BasicType.PAGE],
  create: (payload) => {
    const defaultData: IProductRecommendation = {
      type: CustomBlocksType.PRODUCT_RECOMMENDATION,
      data: {
        value: {
          title: 'você pode gostar também',
          buttonText: 'Compre Agora',
          quantity: 3,
        },
      },
      attributes: {
        'background-color': '#ffffff',
        'button-text-color': '#ffffff',
        'button-color': '#414141',
        'product-name-color': '#414141',
        'product-price-color': '#414141',
        'title-color': '#222222',
      },
      children: [
        {
          type: BasicType.TEXT,
          children: [],
          data: {
            value: {
              content: 'custom block title',
            },
          },
          attributes: {},
        },
      ],
    };
    return merge(defaultData, payload);
  },
  render: (data, idx, mode, context, dataSource) => {
    const { title, buttonText, quantity } = data.data.value;
    const attributes = data.attributes;

    const productList =
      mode === 'testing'
        ? new Array(quantity).fill(productPlaceholder)
        : (dataSource?.product_list || []).slice(0, quantity);

    const perWidth = quantity <= 3 ? '' : '33.33%';

    return (
      <Wrapper
        padding='20px 0px 20px 0px'
        border='none'
        direction='ltr'
        text-align='center'
        background-color={attributes['background-color']}
      >
        <Section padding='0px'>
          <Column padding='0px' border='none' vertical-align='top'>
            <Text
              font-size='20px'
              padding='10px 25px 10px 25px'
              line-height='1'
              align='center'
              font-weight='bold'
              color={attributes['title-color']}
            >
              {title}
            </Text>
          </Column>
        </Section>

        <Section padding='0px'>
          <Group vertical-align='top' direction='ltr'>
            {productList.map((item, index) => (
              <Column
                key={index}
                width={perWidth}
                padding='0px'
                border='none'
                vertical-align='top'
              >
                <Image
                  align='center'
                  height='auto'
                  padding='10px'
                  width='150px'
                  src={item.image}
                />
                <Text
                  font-size='12px'
                  padding='10px 0px 10px 0px '
                  line-height='1'
                  align='center'
                  color={attributes['product-name-color']}
                >
                  {item.title}
                </Text>
                <Text
                  font-size='12px'
                  padding='0px'
                  line-height='1'
                  align='center'
                  color={attributes['product-price-color']}
                >
                  {item.price}
                </Text>
                <Button
                  align='center'
                  padding='15px 0px'
                  background-color={attributes['button-color']}
                  color={attributes['button-text-color']}
                  target='_blank'
                  vertical-align='middle'
                  border='none'
                  text-align='center'
                  href={item.url}
                >
                  {buttonText}
                </Button>
              </Column>
            ))}
          </Group>
        </Section>
      </Wrapper>
    );
  },
});

export { Panel } from './Panel';



```


