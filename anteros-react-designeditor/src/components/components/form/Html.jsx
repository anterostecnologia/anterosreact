import * as React from 'react';
import Editor from './html/react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/themes/prism.css';

export default ({ value, onChange, style = {} }) => (
  <div style={{ ...style, ...{ minHeight: 50 } }}>
    <Editor
      value={value}
      onValueChange={value => onChange(value)}
      highlight={code => { const a = highlight(code, languages.html); console.log(code, a); return a; }}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
      }}
    />
  </div>);
