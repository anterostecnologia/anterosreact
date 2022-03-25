import { Modal } from '@arco-design/web-react';
import { Stack, useBlock, useEditorProps } from '@anterostecnologia/anteros-email-editor';
import React from 'react';
import { Form } from 'react-final-form';
import { v4 as uuidv4 } from 'uuid';
import { ImageUploaderField, TextAreaField, TextField } from '../Form';

export const AddToCollection: React.FC<{
  visible: boolean;
  setVisible: (v: boolean) => void;
}> = ({ visible, setVisible }) => {
  const { focusBlock: focusBlockData } = useBlock();
  const { onAddCollection, onUploadImage, onGetImageGallery } = useEditorProps();

  const onSubmit = (values: {
    label: string;
    helpText: string;
    thumbnail: string;
  }) => {
    if (!values.label) return;
    const uuid = uuidv4();
    onAddCollection?.({
      label: values.label,
      helpText: values.helpText,
      data: focusBlockData!,
      thumbnail: values.thumbnail,
      id: uuid,
    });
    setVisible(false);
  };

  return (
    <Form
      initialValues={{ label: '', helpText: '', thumbnail: '' }}
      onSubmit={onSubmit}
    >
      {({ handleSubmit }) => (
        <Modal
          maskClosable={false}
          style={{ zIndex: 2000 }}
          visible={visible}
          title='Adicionar a coleção'
          onOk={() => handleSubmit()}
          onCancel={() => setVisible(false)}
        >
          <Stack vertical>
            <Stack.Item />
            <TextField
              label='Titulo'
              name='label'
              validate={(val: string) => {
                if (!val) return 'Título requirido!';
                return undefined;
              }}
            />
            <TextAreaField label='Descrição' name='helpText' />
            <ImageUploaderField
              label='Miniatura'
              name={'thumbnail'}
              uploadHandler={onUploadImage}
              onGetImageGallery={onGetImageGallery}
              validate={(val: string) => {
                if (!val) return 'Miniatura requirida!';
                return undefined;
              }}
            />
          </Stack>
        </Modal>
      )}
    </Form>
  );
};
