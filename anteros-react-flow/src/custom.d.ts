declare module '*.css' {
  const content: { [className: string]};
  export default content;
}

interface SvgrComponent extends React.FunctionComponent {}

declare module '*.svg' {
  const svgUrl: string;
  const svgComponent: SvgrComponent;
  export default svgUrl;
  export { svgComponent as ReactComponent };
}

declare var __REACT_FLOW_VERSION__: string;
declare var __ENV__: string;
