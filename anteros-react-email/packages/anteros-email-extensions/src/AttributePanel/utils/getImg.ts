import { ImageManager } from '@anterostecnologia/anteros-email-core';

const defaultImagesMap = {
  IMAGE_59:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/WNZoXHWeCnF8QkB/download',
  AttributePanel_01:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/AD23SYimMkWcAPS/download',
  AttributePanel_02:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/6k7FeELGMY2CxdZ/download',
  AttributePanel_03:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/bKnzcTe6JNTapAp/download',
};

ImageManager.add(defaultImagesMap);

export function getImg(name: keyof typeof defaultImagesMap) {
  return ImageManager.get(name);
}
