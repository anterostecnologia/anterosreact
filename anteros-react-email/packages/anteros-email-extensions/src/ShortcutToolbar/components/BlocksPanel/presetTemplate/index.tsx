import React from 'react';
import { BasicType } from '@anterostecnologia/anteros-email-core';
import { Stack, TextStyle } from '@anterostecnologia/anteros-email-editor';

import { TextBlockItem } from './TextBlockItem';
import { ImageBlockItem } from './ImageBlockItem';
import { SpacerBlockItem } from './SpacerBlockItem';
import { DividerBlockItem } from './DividerBlockItem';
import { HeroBlockItem } from './HeroBlockItem';
import { ButtonBlockItem } from './ButtonBlockItem';
import { AccordionBlockItem } from './AccordionBlockItem';
import { CarouselBlockItem } from './CarouselBlockItem';
import { NavbarBlockItem } from './NavbarBlockItem';
import { SocialBlockItem } from './SocialBlockItem';
import { WrapperBlockItem } from './WrapperBlockItem';
import { SectionBlockItem } from './SectionBlockItem';
import { GroupBlockItem } from './GroupBlockItem';
import { ColumnBlockItem } from './ColumnBlockItem';

export const defaultCategories = [
  {
    title: 'Conteúdo',
    name: 'CONTENT',
    blocks: [
      {
        type: BasicType.TEXT,
        title: 'Texto',
        description: 'Este bloco permite que você exiba texto em seu e-mail.',
        component: TextBlockItem,
      },
      {
        type: BasicType.IMAGE,
        title: 'Imagem',
        description: (
          <Stack vertical spacing='none'>
            <TextStyle>
              Exibe uma imagem responsiva em seu e-mail. É semelhante a marcação
              HTML "&lt;img/&gt;". Observe que, se nenhuma largura for fornecida, a
              imagem usará a largura da coluna pai.
            </TextStyle>
          </Stack>
        ),
        component: ImageBlockItem,
      },
      {
        type: BasicType.BUTTON,
        title: 'Botão',
        description: 'Exibe um botão personalizável.',
        component: ButtonBlockItem,
      },
      {
        type: BasicType.HERO,
        title: 'Herói',
        description: `Este bloco exibe uma imagem de herói. Ele se comporta como um
        'seção' com uma única 'coluna'.`,
        component: HeroBlockItem,
      },
      {
        type: BasicType.NAVBAR,
        title: 'Barra navegação',
        description: `Exibe um menu para navegação com um hambúrguer opcional
        modo para dispositivos móveis.`,
        component: NavbarBlockItem,
      },
      {
        type: BasicType.SPACER,
        title: 'Espaço',
        description: 'Exibe um espaço em branco.',
        component: SpacerBlockItem,
      },
      {
        type: BasicType.DIVIDER,
        title: 'Divisor',
        description: `Exibe um divisor horizontal que pode ser personalizado como uma
        borda HTML.`,
        component: DividerBlockItem,
      },
      {
        type: BasicType.ACCORDION,
        title: 'Acordeão',
        description: `Acordeão é um componente interativo para empilhar conteúdo em
        guias, para que as informações sejam recolhidas e apenas os títulos
        são visíveis. Os leitores podem interagir clicando nas abas
        revelar o conteúdo, proporcionando uma ótima experiência
        dispositivos móveis onde o espaço é escasso.`,
        component: AccordionBlockItem,
      },
      {
        type: BasicType.CAROUSEL,
        title: 'Carrossel',
        description: `Este bloco exibe uma galeria de imagens ou "carrossel".
        Os leitores podem interagir passando o mouse e clicando em
        miniaturas dependendo do cliente de e-mail que eles usam.`,
        component: CarouselBlockItem,
      },
      {
        type: BasicType.SOCIAL,
        title: 'Social',
        description: `Exibe frases de chamariz para várias redes sociais com
        seu logotipo associado.`,
        component: SocialBlockItem,
      },
    ],
  },
  {
    title: 'Layout',
    name: 'LAYOUT',
    blocks: [
      {
        type: BasicType.WRAPPER,
        title: 'Envólucro',
        description: `O envólucro permite agrupar várias seções. É especialmente útil para obter layouts aninhados com bordas compartilhadas ou imagens de fundo nas seções.
        `,
        component: WrapperBlockItem,
      },
      {
        type: BasicType.SECTION,
        title: 'Seção',
        description: (
          <Stack vertical spacing='none'>
            <TextStyle>
              As seções devem ser usadas como linhas em seu e-mail. Elas
              será usado para estruturar o layout.
            </TextStyle>
            <TextStyle>
              As seções não podem ser aninhadas em seções. As colunas podem ser aninhadas em seções;
              todo o conteúdo deve estar em uma coluna.
            </TextStyle>
          </Stack>
        ),
        component: SectionBlockItem,
      },
      {
        type: BasicType.GROUP,
        title: 'Grupo',
        description: `Grupo permite que você impeça o empilhamento de colunas
        Móvel. Para fazer isso, envolva as colunas dentro de um grupo
        bloco, para que fiquem lado a lado no celular.`,
        component: GroupBlockItem,
      },
      {
        type: BasicType.COLUMN,
        title: 'Coluna',
        description: (
          <Stack vertical spacing='none'>
            <TextStyle>
              As colunas permitem que você organize horizontalmente o conteúdo dentro
              suas seções. Eles devem estar localizados no bloco "Seção" para
              ser considerado pelo motor. Para serem responsivas, as colunas são
              expresso em porcentagem.
            </TextStyle>
            <TextStyle>
              Cada coluna tem que conter algo porque eles são
              contêineres responsivos e serão empilhados verticalmente em um celular
              visualizar.
            </TextStyle>
          </Stack>
        ),
        component: ColumnBlockItem,
      },
    ],
  },
];
