import { BlockManager } from '@anterostecnologia/anteros-email-core';
import {
  BlockAttributeConfigurationManager,
  BlockMarketManager,
} from '@anterostecnologia/anteros-email-extensions';
import { CustomBlocksType } from './constants';
import {
  Panel as ProductRecommendationPanel,
  ProductRecommendation,
} from './ProductRecommendation';
import { Example as ProductRecommendationExample } from './ProductRecommendation/Example';

BlockManager.registerBlocks({
  ProductRecommendation: ProductRecommendation,
});

BlockAttributeConfigurationManager.add({
  [CustomBlocksType.PRODUCT_RECOMMENDATION]: ProductRecommendationPanel,
});

BlockMarketManager.addCategories([
  {
    title: 'Custom',
    name: 'Custom',
    blocks: [
      {
        type: CustomBlocksType.PRODUCT_RECOMMENDATION,
        title: ProductRecommendation.name,
        description: 'An custom block',
        component: ProductRecommendationExample,
        thumbnail:
          'https://assets.maocanhua.cn/c160738b-db01-4081-89e5-e35bd3a34470-image.png',
      },
    ],
  },
]);
