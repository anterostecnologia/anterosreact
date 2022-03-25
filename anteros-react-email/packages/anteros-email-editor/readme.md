# anteros-email-editor

## Introduction

Email render and preview container.

## usage

```sh
$ npm install --save anteros-email-editor
```

or

```sh
$ yarn add anteros-email-editor
```

```js
import React from "react";
import { BlockManager } from "anteros-email-core";
import { EmailEditor, EmailEditorProvider } from "anteros-email-editor";
import "anteros-email-editor/lib/style.css";

const initialValues = {
  subject: "Welcome to anteros-email",
  subTitle: "Nice to meet you!",
  content: BlockManager.getBlockByType(BasicType.PAGE).create({}),
};

export function App() {
  return (
    <EmailEditorProvider data={initialValues} height={"calc(100vh - 72px)"}>
      {({ values }) => {
        return <EmailEditor />;
      }}
    </EmailEditorProvider>
  );
}
```

## customize

If you customize the UI yourself,maybe you need to know

- hooks

  - useActiveTab // current tab is edit or preview
  - useBlock // includes addBlock、moveBlock、removeBlock、undo, redo, etc.
  - useHoverIdx // hover block related, dragging status related, dragging direction related
  - useEditorProps // get props from EmailEditorProvider
  - useEditorContext // get form state and initialized status
  - useFocusIdx // focus block related

- utils (These are some very simple methods, it is best to look at the implementation)

  - getBlockNodeByIdx
  - getBlockNodes
  - getShadowRoot
  - scrollBlockEleIntoView

- components
  - BlockAvatarWrapper // allow drag and drop to editor
