import { ImageManager } from '@anterostecnologia/anteros-email-core';

const defaultImagesMap = {
  IMAGE_59:
    'https://versatil-salescloud.relevantsolutions.com.br/images/06ca521d-9728-4de6-a709-1b75a828bfc3-2a9b1224-3d71-43b8-b52f-e7cdcdc9107b.png',
  AttributePanel_01:
    'https://versatil-salescloud.relevantsolutions.com.br/images/e22f78f2-aa76-408d-ba94-c95c7abe1908-image.png',
  AttributePanel_02:
    'https://versatil-salescloud.relevantsolutions.com.br/images/3e952a6e-2506-470e-b395-3e0d995157c5.png',
  AttributePanel_03:
    'https://versatil-salescloud.relevantsolutions.com.br/images/Fi_vI4vyLhTM-Tp6ivq4dR_ieGHk.png',
};

ImageManager.add(defaultImagesMap);

export function getImg(name: keyof typeof defaultImagesMap) {
  return ImageManager.get(name);
}
