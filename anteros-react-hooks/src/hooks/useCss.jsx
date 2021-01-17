import { create } from 'nano-css';
import { addon as addonCSSOM } from 'nano-css/addon/cssom';
import { addon as addonVCSSOM } from 'nano-css/addon/vcssom';
import { cssToTree } from 'nano-css/addon/vcssom/cssToTree';
import { useMemo } from 'react';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';


const nano = create();
addonCSSOM(nano);
addonVCSSOM(nano);

let counter = 0;

const useCss = (css) => {
  const className = useMemo(() => 'react-use-css-' + (counter++).toString(36), []);
  const sheet = useMemo(() => new nano.VSheet(), []);

  useIsomorphicLayoutEffect(() => {
    const tree = {};
    cssToTree(tree, css, '.' + className, '');
    sheet.diff(tree);

    return () => {
      sheet.diff({});
    };
  });

  return className;
};

export default useCss;
