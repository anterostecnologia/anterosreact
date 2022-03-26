import { ImageManager } from '@anterostecnologia/anteros-email-core';

const defaultImagesMap = {
  IMAGE_08:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/6n6A5qdqWCXDEAj/download',
  IMAGE_09:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/cbdGkRFDmgskgqg/download',
  IMAGE_10:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/wTe9YXwdP2dwBjb/download',
  IMAGE_11:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/ZyZBfcwcZHF8pHL/download',
  IMAGE_12:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/677bMz3C8qnoEZB/download',
  IMAGE_13:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/tKxgJ5EPSi6gd4b/download',
  IMAGE_14:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/J8kFCd9Ab9t4Bm9/download',
  IMAGE_15:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/S2mAMxsYSzHmma8/download',
  IMAGE_16:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/XH3tQ3Jk4fjakYN/download',
  IMAGE_17:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/7FJWro6BZFrJAqT/download',
  IMAGE_18:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/GH26j2KCpZtHkPr/download',
  IMAGE_19:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/7rzDQkqZt8sKJGF/download',
  IMAGE_20:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/qbJRKoQ3K2RrB69/download',
  IMAGE_21:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/FAfTowy9QKFzE9w/download',
  IMAGE_22:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/2b8qixRbwtwZBk6/download',
  IMAGE_23:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/ctZ3NGBXxHJCEfF/download',
  IMAGE_24:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/faLogHSGA3pNDMk/download',
  IMAGE_25:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/cbgeQo6KY3r6zyZ/download',
  IMAGE_26:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/pTCJyDo5NYsHLLC/download',
  IMAGE_27:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/rjCF7SYpf9pLwL3/download',
  IMAGE_28:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/Rn2SzG6Rmf3GHJG/download',
  IMAGE_29:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/9jgnSSardzZeXs3/download',
  IMAGE_30:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/DTSdrk59qybs5fD/download',
  IMAGE_31:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/wi2WeA5Kwy2xwD9/download',
  IMAGE_32:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/qGJnzLfqeT54ebQ/download',
  IMAGE_33:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/3s3RY5Yz7w6fkLn/download',
  IMAGE_34:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/TFx8Kq2wHa7ADE9/download',
  IMAGE_35:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/MzqotxwmbTzZLry/download',
  IMAGE_36:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/L4astGca4yziaZn/download',
  IMAGE_37:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/z7A3oTYyDSe9T6M/download',
  IMAGE_38:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/aoQQcC4XGtqH87P/download',
  IMAGE_39:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/jWNHz8qWtYxaqLG/download',
  IMAGE_40:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/TFENAbNBbiXG6Dx/download',
  IMAGE_41:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/KyggGtjYXJWE5ap/download',
  IMAGE_42:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/qB6cCB6tkyqBofB/download',
  IMAGE_43:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/gt8M4ZQYLHH9nCr/download',
  IMAGE_44:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/dona7k5AP7AdmsZ/download',
  IMAGE_45:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/qB6cCB6tkyqBofB/download',
  IMAGE_46:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/iGQDByPrnRAyME4/download',
  IMAGE_47:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/XFzkM9Wn8eWL2bD/download',
  IMAGE_48:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/rrwHwLjaZJjNXpw/download',
  IMAGE_49:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/GfYrBYNfqSLeGCC/download',
  IMAGE_50:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/FxxqesFa55ZxTqT/download',
  IMAGE_51:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/y4PpwSEfaadKmJ5/download',
  IMAGE_52:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/GdjsoTRxyztWfjF/download',
  IMAGE_53:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/eQXd4tBcdxN88oA/download',
  IMAGE_54:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/dxQtiMeTm2fswJQ/download',
  IMAGE_55:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/tTJHcBQMMm9RCTD/download',
  IMAGE_56:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/gR6LL3BQNeYw7xe/download',
  IMAGE_57:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/BcysExtekgoY5y8/download',
  IMAGE_58:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/WMGiK42TdiJjf59/download',
  IMAGE_59:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/WNZoXHWeCnF8QkB/download',
  IMAGE_60:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/6k7FeELGMY2CxdZ/download',
  IMAGE_61:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/RTdFWyi5fNjBfta/download',
  IMAGE_62:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/QwWoreZwRqXtA3g/download',
  IMAGE_63:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/NPS98FM6nTieNLE/download',
  IMAGE_64:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/BWETPFGwBmXcMLH/download',
  IMAGE_65:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/r93moLRn8MJgzLT/download',
  IMAGE_66:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/bnA9Jbnt2L3qcWr/download',
  IMAGE_67:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/gDXcbip8iNeyzrP/download',
  IMAGE_68:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/88E3dRGLJLdtpsE/download',
  IMAGE_69:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/boi6pzEeJLwBWWc/download',
  IMAGE_70:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/55c6TNHoqer4xCD/download',
  IMAGE_71:
    'https://infra.relevantsolutions.com.br/nextcloud/index.php/s/NQYB9MMXXSaw3An/download',
};

ImageManager.add(defaultImagesMap);

export function getImg(name: keyof typeof defaultImagesMap) {
  return ImageManager.get(name);
}