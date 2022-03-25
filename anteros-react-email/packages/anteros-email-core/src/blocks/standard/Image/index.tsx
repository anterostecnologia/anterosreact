import { IBlock, IBlockData } from '@core/typings';
import { BasicType } from '@core/constants';
import { CSSProperties } from 'react';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';
import { getImg } from '@core/utils/getImg';

export type IImage = IBlockData<{
  alt?: string;
  src?: string;
  title?: string;
  href?: string;
  target?: string;
  border?: string;
  height?: string;
  'text-decoration'?: string;
  'text-transform'?: CSSProperties['textTransform'];
  align?: CSSProperties['textAlign'];
  'container-background-color'?: string;
  width?: string;
  padding?: string;
}>;

export const Image: IBlock<IImage> = createBlock({
  name: 'Imagem',
  type: BasicType.IMAGE,
  create: (payload) => {
    const defaultData: IImage = {
      type: BasicType.IMAGE,
      data: {
        value: {},
      },
      attributes: {
        align: 'center',
        height: 'auto',
        padding: '10px 25px 10px 25px',
        src: '',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
});
