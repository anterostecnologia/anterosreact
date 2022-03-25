import { ImageManager } from '@anterostecnologia/anteros-email-core';

const defaultImagesMap = {
  IMAGE_59:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/MZPr8r9RXxScSoL/download',
};

ImageManager.add(defaultImagesMap);

export function getImg(name: keyof typeof defaultImagesMap) {
  return ImageManager.get(name);
}
