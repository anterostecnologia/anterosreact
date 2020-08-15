import React from 'react';
import Group from './Group';
import { Color, Switch, Space, ImageEditor } from './items';

const RowProperty = ({ columnsBackgroundColor,
  backgroundColor, backgroundImage,
  noStackMobile, padding, fullWidth, repeat,
  center, _meta, onUpdate }) => <React.Fragment>
  <Group title="Geral">
    <Color title="Cor fundo" value={backgroundColor} attribute="backgroundColor" onUpdate={onUpdate} />
    <ImageEditor
      key={_meta.guid}
      attribute="backgroundImage"
      url={backgroundImage}
      fullWidth={fullWidth}
      repeat={repeat}
      center={center}
      options
      onUpdate={onUpdate}
    />
    <Space title="Espaçamento" value={padding} attribute="padding" onUpdate={onUpdate} />
  </Group>
  <Group title="Móvel">
    <Switch title="Não empilhe no celular" checked={noStackMobile} attribute="noStackMobile" onUpdate={onUpdate} />
  </Group>
  <Group title="Conteúdo">
    <Color title="Fundo das colunas" value={columnsBackgroundColor} attribute="columnsBackgroundColor" onUpdate={onUpdate} />
  </Group>
</React.Fragment>;


export default RowProperty;