import { ImageManager } from '@anterostecnologia/anteros-email-core';

const defaultImagesMap = {
  IMAGE_59:
    'https://versatil-salescloud.relevantsolutions.com.br/images/8e0e07e2-3f84-4426-84c1-2add355c558b-image.png',
};

ImageManager.add(defaultImagesMap);

export function getImg(name: keyof typeof defaultImagesMap) {
  return ImageManager.get(name);
}
