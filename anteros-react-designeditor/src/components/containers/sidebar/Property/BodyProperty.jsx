import React from 'react';
import Group from './Group';
import { Font, Color, NumberItem, Space } from './items';

const BodyProperty = ({ backgroundColor, width, fontFamily, containerPadding, onUpdate }) => <React.Fragment>
  <Group title="Geral">
    <Color title="Cor fundo" value={backgroundColor} attribute="backgroundColor" onUpdate={onUpdate} />
    <NumberItem title="Largura conteúdo" value={width} max={3000} attribute="width" onUpdate={onUpdate} />
    <Font title="Familia Fontes" fontFamily={fontFamily} onUpdate={onUpdate} />
    <Space title="Espaçamento container" value={containerPadding} attribute="containerPadding" onUpdate={onUpdate} />
  </Group>
</React.Fragment>;

export default BodyProperty;