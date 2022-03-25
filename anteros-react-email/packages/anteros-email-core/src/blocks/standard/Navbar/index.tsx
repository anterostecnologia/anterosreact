import { IBlock, IBlockData } from '@core/typings';
import { BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { mergeBlock } from '@core/utils/mergeBlock';

export type INavbar = IBlockData<
  {
    align?: string;
    hamburger?: string;
    'ico-align'?: string;
    'ico-color'?: string;
    'ico-font-size'?: string;
    'ico-line-height'?: string;
    'ico-padding'?: string;
    'ico-text-decoration'?: string;
    'ico-text-transform'?: string;
  },
  {
    links: Array<{
      content: string;
      color?: string;
      href?: string;
      'font-family'?: string;
      'font-size'?: string;
      'font-style'?: string;
      'font-weight'?: string;
      'line-height'?: string;
      'text-decoration'?: string;
      target?: string;
      padding?: string;
    }>;
  }
>;

export const Navbar: IBlock<INavbar> = createBlock({
  name: 'Barra navegação',
  type: BasicType.NAVBAR,
  create: (payload) => {
    const defaultData: INavbar = {
      type: BasicType.NAVBAR,
      data: {
        value: {
          links: [
            {
              href: '/gettings-started-onboard',
              content: 'Começando',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
            {
              href: '/try-it-live',
              content: 'Experimente ao vivo',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
            {
              href: '/templates',
              content: 'Modelos',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
            {
              href: '/components',
              content: 'Componentes',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
          ],
        },
      },
      attributes: {
        align: 'center',
      },
      children: [],
    };
    return mergeBlock(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
});
