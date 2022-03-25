import React from 'react';
import { BasicType } from '@anterostecnologia/anteros-email-core';
import { Stack } from '@anterostecnologia/anteros-email-editor';

import { BlockMaskWrapper } from '@extensions/ShortcutToolbar/components/BlockMaskWrapper';
import { getImg } from '@extensions/ShortcutToolbar/utils/getImg';
import { Picture } from '@extensions/ShortcutToolbar/components/Picture';

export function HeroBlockItem() {
  return (
    <Stack.Item fill>
      <Stack vertical>
        {heroList.map((item, index) => {
          return (
            <BlockMaskWrapper
              key={index}
              type={BasicType.HERO}
              payload={item.payload}
            >
              <div style={{ position: 'relative' }}>
                <Picture src={item.thumbnail} />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                  }}
                />
              </div>
            </BlockMaskWrapper>
          );
        })}
      </Stack>
    </Stack.Item>
  );
}

const heroList = [
  {
    thumbnail: getImg('IMAGE_30'),
    payload: {
      type: 'hero',
      data: {
        value: {},
      },
      attributes: {
        'background-color': '#ffffff',
        'background-position': 'center center',
        mode: 'fluid-height',
        padding: '100px 0px 100px 0px',
        'vertical-align': 'top',
        'background-url': getImg('IMAGE_31'),
      },
      children: [
        {
          type: 'text',
          data: {
            value: {
              content: 'Servimos Saudável &amp; Comidas deliciosas',
            },
          },
          attributes: {
            'font-size': '45px',
            padding: '10px 25px 10px 25px',
            'line-height': '45px',
            align: 'center',
            color: '#ffffff',
          },
          children: [],
        },
        {
          type: 'text',
          data: {
            value: {
              content:
                'Os rios que eu encontro vão seguindo comigo. Rios são de água pouca, em que a água sempre está por um fio. Cortados no verão que faz secar todos os rios.<br>',
            },
          },
          attributes: {
            'font-size': '14px',
            padding: '10px 25px 10px 25px',
            'line-height': '1.5',
            align: 'center',
            color: '#ffffff',
          },
          children: [],
        },
        {
          type: 'button',
          data: {
            value: {
              content: 'Faça seu pedido aqui!',
            },
          },
          attributes: {
            align: 'center',
            'background-color': '#f3a333',
            color: '#ffffff',
            'font-size': '13px',
            'font-weight': 'normal',
            'border-radius': '30px',
            padding: '10px 25px 10px 25px',
            'inner-padding': '10px 25px 10px 25px',
            'line-height': '120%',
            target: '_blank',
            'vertical-align': 'middle',
            border: 'none',
            'text-align': 'center',
            href: '#',
          },
          children: [],
        },
      ],
    },
  },
  {
    thumbnail: getImg('IMAGE_32'),
    payload: {
      type: 'hero',
      data: {
        value: {
          content:
            'INVERNO\n      \n      \n        INVERNO está chegando\n      \n\n\n      \n        Um pequeno rio chamado Duden flui por seu lugar e fornece a água necessária.\n      \n\n      \n        Leia mais',
        },
      },
      attributes: {
        'background-color': '#ffffff',
        'background-position': 'center center',
        mode: 'fluid-height',
        padding: '0px 0px 100px 0px',
        'vertical-align': 'top',
        'background-url': getImg('IMAGE_33'),
        'padding-bottom': '100px',
      },
      children: [
        {
          type: 'button',
          data: {
            value: {
              content: 'INVERNO',
            },
          },
          attributes: {
            'font-size': '24px',
            padding: '10px 25px 10px 25px',
            'line-height': '45px',
            align: 'center',
            color: '#ffffff',
            border: '2px solid #ffffff',
            'font-weight': '500',
            'background-color': 'transparent',
            'inner-padding': '10px 15px 4px 15px',
            'font-family': '\'Josefin Sans\', sans-serif',
            'border-radius': '0px',
          },
          children: [],
        },
        {
          type: 'text',
          data: {
            value: {
              content: '\n        O INVERNO ESTÁ CHEGANDO\n      ',
            },
          },
          attributes: {
            align: 'center',
            'background-color': '#414141',
            color: '#ffffff',
            'font-size': '30px',
            'font-weight': 'normal',
            'border-radius': '3px',
            padding: '10px 25px 10px 25px',
            'inner-padding': '10px 25px 10px 25px',
            'line-height': '54px',
            target: '_blank',
            'vertical-align': 'middle',
            border: 'none',
            'text-align': 'center',
            href: '#',
          },
          children: [],
        },
        {
          type: 'text',
          attributes: {
            'font-size': '16px',
            padding: '10px 25px 10px 25px',
            'line-height': '1.5',
            align: 'center',
            color: '#ffffff',
          },
          data: {
            value: {
              content:
                '\n        Um pequeno rio chamado Duden flui por seu lugar e fornece a água necessária.\n      ',
            },
          },
          children: [],
        },
        {
          type: 'button',
          attributes: {
            'border-radius': '30px',
            'font-weight': '500',
            'background-color': '#448ef6',
            padding: '30px 25px 10px 25px',
          },
          data: {
            value: {
              content: 'Texto aqui',
            },
          },
          children: [],
        },
      ],
    },
  },
  {
    thumbnail: getImg('IMAGE_34'),
    payload: {
      type: 'hero',
      data: {
        value: {
          content:
            'INVERNO\n      \n      \n        O INVERNO ESTÁ CHEGANDO\n      \n\n\n      \n        Um pequeno rio chamado Duden flui por seu lugar e fornece a água necessária.\n      \n\n      \n        Leia mais',
        },
      },
      attributes: {
        'background-color': '#ffffff',
        'background-position': 'center center',
        mode: 'fluid-height',
        padding: '0px 0px 100px 0px',
        'vertical-align': 'top',
        'background-url': getImg('IMAGE_35'),
        'padding-bottom': '100px',
      },
      children: [
        {
          type: 'text',
          data: {
            value: {
              content: 'Até 50% de desconto em <div>&nbsp;Itens femininos</div>',
            },
          },
          attributes: {
            align: 'center',
            'background-color': '#414141',
            color: '#ffffff',
            'font-size': '30px',
            'font-weight': 'normal',
            'border-radius': '3px',
            padding: '80px 25px 10px 25px',
            'inner-padding': '10px 25px 10px 25px',
            'line-height': '1.4',
            target: '_blank',
            'vertical-align': 'middle',
            border: 'none',
            'text-align': 'center',
            href: '#',
            'font-family': '"Playfair Display", sans-serif',
          },
          children: [],
        },
        {
          type: 'text',
          attributes: {
            'font-size': '16px',
            padding: '10px 25px 10px 25px',
            'line-height': '1.5',
            align: 'center',
            color: '#ffffff',
          },
          data: {
            value: {
              content:
                'Um pequeno rio chamado Duden flui por seu lugar e fornece a água necessária.',
            },
          },
          children: [],
        },
        {
          type: 'button',
          attributes: {
            'border-radius': '5px',
            'font-weight': '500',
            'background-color': '#ffc0d0',
            padding: '30px 25px 10px 25px',
          },
          data: {
            value: {
              content: 'Start Shoping',
            },
          },
          children: [],
        },
      ],
    },
  },
  {
    thumbnail: getImg('IMAGE_36'),
    payload: {
      type: 'hero',
      attributes: {
        'background-color': '#ffffff',
        'background-position': 'center center',
        mode: 'fluid-height',
        padding: '100px 0px 100px 0px',
        'vertical-align': 'top',
        'background-url': getImg('IMAGE_38'),
      },
      data: {
        value: {
          content:
            'Nós Criamos Sites Modernos\n          \n        \n\n          \n           Um pequeno rio chamado Duden flui por seu lugar e fornece a água necessária. É um país paradisíaco, em que partes de frases voam para a boca.',
        },
      },
      children: [
        {
          type: 'text',
          attributes: {
            'font-size': '30px',
            padding: '10px 25px 10px 25px',
            'line-height': '54px',
            align: 'center',
            color: '#ffffff',
          },
          data: {
            value: {
              content: 'Nós Criamos Sites Modernos',
            },
          },
          children: [],
        },
        {
          type: 'text',
          attributes: {
            'font-size': '16px',
            padding: '10px 25px 10px 25px',
            'line-height': '1.5',
            align: 'center',
            color: '#ffffff',
          },
          data: {
            value: {
              content:
                'Um pequeno rio chamado Duden flui por seu lugar e fornece a água necessária. É um país paradisíaco, em que partes de frases voam para a boca.',
            },
          },
          children: [],
        },
        {
          type: 'image',
          attributes: {
            width: '60px',
            'padding-top': '30px',
            src: getImg('IMAGE_37'),
            target: '_blank',
            href: 'https://anteros-email-m-ryan.vercel.app/',
          },
          data: {
            value: {
              content: '',
            },
          },
          children: [],
        },
      ],
    },
  },
];
