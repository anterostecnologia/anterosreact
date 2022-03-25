import { IBlockData } from '@core/typings';
import { BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { AccordionElement } from '../AccordionElement';
import { AccordionTitle } from '../AccordionTitle';
import { AccordionText } from '../AccordionText';
import { getImg } from '@core/utils/getImg';
import { mergeBlock } from '@core/utils/mergeBlock';

export type IAccordion = IBlockData<
  {
    'icon-width': string;
    'icon-height': string;
    'container-background-color'?: string;
    border?: string;
    padding: string;
    'inner-padding'?: string;
    'font-family'?: string;
    'icon-align'?: 'middle' | 'top' | 'bottom';
    'icon-position': 'left' | 'right';
    'icon-unwrapped-alt'?: string;
    'icon-unwrapped-url'?: string;
    'icon-wrapped-alt'?: string;
    'icon-wrapped-url'?: string;
  },
  {}
>;

export const Accordion = createBlock<IAccordion>({
  name: 'Acordeão',
  type: BasicType.ACCORDION,
  validParentType: [BasicType.COLUMN],
  create: (payload) => {
    const defaultData: IAccordion = {
      type: BasicType.ACCORDION,
      data: {
        value: {},
      },
      attributes: {
        'icon-height': '32px',
        'icon-width': '32px',
        'icon-align': 'middle',
        'icon-position': 'right',
        'icon-unwrapped-url': getImg('IMAGE_09'),
        'icon-wrapped-url': getImg('IMAGE_10'),
        padding: '10px 25px 10px 25px',
        border: '1px solid #d9d9d9',
      },
      children: [
        AccordionElement.create({
          children: [
            AccordionTitle.create({
              data: {
                value: {
                  content: 'Por que usar um acordeão?',
                },
              },
            }),
            AccordionText.create({
              data: {
                value: {
                  content:
                    'Como e-mails com muito conteúdo são na maioria das vezes uma experiência muito ruim no celular, o mj-accordion é útil quando você deseja fornecer muitas informações de maneira concisa.',
                },
              },
            }),
          ],
        }),
        AccordionElement.create({
          children: [
            AccordionTitle.create({
              data: {
                value: {
                  content: 'como funciona',
                },
              },
            }),
            AccordionText.create({
              data: {
                value: {
                  content:
                    'O conteúdo é empilhado em guias e os usuários podem expandi-los à vontade. Se estilos responsivos não forem suportados (principalmente em clientes de desktop), as guias serão expandidas e seu conteúdo poderá ser lido imediatamente.',
                },
              },
            }),
          ],
        }),
      ],
    };
    return mergeBlock(defaultData, payload);
  },
});
