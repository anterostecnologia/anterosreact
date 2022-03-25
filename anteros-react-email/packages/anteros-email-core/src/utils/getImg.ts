import { ImageManager } from './ImageManager';

const defaultImagesMap = {
  IMAGE_01:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/JQNT2Dsr6ntExXA/download',
  IMAGE_02:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/AZ6CNtPYTHdCm4D/download',
  IMAGE_03:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/LteDFT6PSogDDPG/download',
  IMAGE_04:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/TBioobJk4cWgpYm/download',
  IMAGE_59:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/MZPr8r9RXxScSoL/download',
  IMAGE_09:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/cbdGkRFDmgskgqg/download',
  IMAGE_10:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/wTe9YXwdP2dwBjb/download',
  IMAGE_15:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/S2mAMxsYSzHmma8/download',
  IMAGE_16:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/XH3tQ3Jk4fjakYN/download',
  IMAGE_17:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/7FJWro6BZFrJAqT/download',
  IMAGE_31:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/wi2WeA5Kwy2xwD9/download',
};

ImageManager.add(defaultImagesMap);
export function getImg(name: keyof typeof defaultImagesMap) {
  return ImageManager.get(name);
}
