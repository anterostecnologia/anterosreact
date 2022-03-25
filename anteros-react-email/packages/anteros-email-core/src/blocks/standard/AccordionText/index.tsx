import { IBlock, IBlockData } from '@core/typings';
import { BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';

export type IAccordionText = IBlockData<
  {
    color?: string;
    'background-color'?: string;
    'font-size'?: string;
    'font-family'?: string;
    padding?: string;
    'font-weight'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
  },
  {}
>;

export const AccordionText: IBlock = createBlock({
  name: 'Texto acordeão',
  type: BasicType.ACCORDION_TEXT,
  create: (payload) => {
    const defaultData: IAccordionText = {
      type: BasicType.ACCORDION_TEXT,
      data: {
        value: {
          content:
            'Como e-mails com muito conteúdo são na maioria das vezes uma experiência muito ruim no celular, o mj-accordion é útil quando você deseja fornecer muitas informações de maneira concisa',
        },
      },
      attributes: {
        'font-size': '13px',
        padding: '16px 16px 16px 16px',
        'line-height': '1',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION],
});
