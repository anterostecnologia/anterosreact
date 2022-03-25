import { IBlock, IBlockData } from '@core/typings';
import { BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';

export type IAccordionTitle = IBlockData<
  {
    color?: string;
    'background-color'?: string;
    'font-size'?: string;
    'font-family'?: string;
    padding?: string;
  },
  {}
>;

export const AccordionTitle: IBlock = createBlock({
  name: 'Título acordeão',
  type: BasicType.ACCORDION_TITLE,
  create: (payload) => {
    const defaultData: IAccordionTitle = {
      type: BasicType.ACCORDION_TITLE,
      data: {
        value: {
          content: 'Por que usar um acordeão?',
        },
      },
      attributes: {
        'font-size': '13px',
        padding: '16px 16px 16px 16px',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION],
});
