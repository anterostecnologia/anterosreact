import { BlockManager } from '../BlockManager';
import { BasicType } from '@core/constants';
import { createCustomBlock } from '../createCustomBlock';
import { merge } from 'lodash';
import { Section, Column, Text, Image, Button } from '../../components';
import { IBlockData } from '@core/typings';
import React from 'react';
import { JsonToMjml } from '..';

type IMyFirstBlock = IBlockData<
  {
    'background-color': string;
    'text-color': string;
  },
  {
    buttonText: string;
    imageUrl: string;
  }
>;

const myFirstBlock = createCustomBlock({
  name: 'My first block',
  type: 'MY_FIRST_BLOCK',
  create(payload) {
    const defaultData: IMyFirstBlock = {
      type: 'MY_FIRST_BLOCK',
      data: {
        value: {
          buttonText: 'Got it',
          imageUrl:
            'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/xwyw3TYqA7XSTD4/download',
        },
      },
      attributes: {
        'background-color': '#4A90E2',
        'text-color': '#ffffff',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE, BasicType.WRAPPER],
  render(data: IMyFirstBlock) {
    const { imageUrl, buttonText } = data.data.value;
    const attributes = data.attributes;

    const instance = (
      <Section padding='20px'>
        <Column>
          <Image padding='0px 0px 0px 0px' width='100px' src={imageUrl} />
          <Button
            background-color={attributes['background-color']}
            color={attributes['text-color']}
            href='#'
          >
            {buttonText}
          </Button>
        </Column>
      </Section>
    );
    return instance;
  },
});

describe('Test createCustomBlock', () => {
  BlockManager.registerBlocks({ myFirstBlock });

  const pageBlock = BlockManager.getBlockByType(BasicType.PAGE)!;

  it('should render as expected', () => {
    expect(
      JsonToMjml({
        data: pageBlock.create({
          children: [myFirstBlock.create()],
        }),
        mode: 'production',
      })
    ).toMatchSnapshot();
  });
});
