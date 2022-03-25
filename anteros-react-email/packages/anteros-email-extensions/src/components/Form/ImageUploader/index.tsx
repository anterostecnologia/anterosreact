import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Grid,
  Input,
  Message,
  Modal,
  Popover,
  Space,
  Spin,
} from '@arco-design/web-react';
import { IconPlus, IconEye, IconDelete } from '@arco-design/web-react/icon';
import styles from './index.module.scss';
import {
  Uploader,
  UploaderServer,
} from '@extensions/AttributePanel/utils/Uploader';
import { classnames } from '@extensions/AttributePanel/utils/classnames';
import { previewLoadImage } from '@extensions/AttributePanel/utils/previewLoadImage';
import { getImg } from '@extensions/AttributePanel/utils/getImg';
import { MergeTags } from '@extensions';
import { Button as ArcoButton } from '@arco-design/web-react';
import { IconFont, useEditorProps } from '@anterostecnologia/anteros-email-editor';

export interface ImageUploaderProps {
  onChange: (val: string) => void;
  value: string;
  label: string;
  uploadHandler?: UploaderServer;
  onGetImageGallery?: () => Promise<string>;
}

export function ImageUploader(props: ImageUploaderProps) {
  const { mergeTags } = useEditorProps();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const uploadHandlerRef = useRef<UploaderServer | null | undefined>(
    props.uploadHandler
  );

  const onChange = props.onChange;

  const onUpload = useCallback(() => {
    if (isUploading) {
      return Message.warning('Enviando...');
    }
    if (!uploadHandlerRef.current) return;

    const uploader = new Uploader(uploadHandlerRef.current, {
      limit: 1,
      accept: 'image/*',
    });

    uploader.on('start', (photos) => {
      setIsUploading(true);

      uploader.on('end', (data) => {
        const url = data[0]?.url;
        if (url) {
          onChange(url);
        }
        setIsUploading(false);
      });
    });

    uploader.chooseFile();
  }, [isUploading, onChange]);

  const onPaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!uploadHandlerRef.current) return;
      const clipboardData = e.clipboardData;

      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.kind == 'file') {
          const blob = item.getAsFile();

          if (!blob || blob.size === 0) {
            return;
          }
          try {
            setIsUploading(true);
            const picture = await uploadHandlerRef.current(blob);
            await previewLoadImage(picture);
            props.onChange(picture);
            setIsUploading(false);
          } catch (error: any) {
            Message.error(error?.message || error || 'Envio falhou');
            setIsUploading(false);
          }
        }
      }
    },
    [props]
  );

  const onRemove = useCallback(() => {
    props.onChange('');
  }, [props]);

  const onGetImage = useCallback(() => {
    if (props.onGetImageGallery) {
      props.onGetImageGallery().then((value)=>{
        props.onChange(value);
      });      
    }
  }, [props]);

  const content = useMemo(() => {
    if (isUploading) {
      return (
        <div className={styles['item']}>
          <div className={classnames(styles['info'])}>
            <Spin />
            <div className={styles['btn-wrap']} />
          </div>
        </div>
      );
    }

    if (!props.value) {
      return (
        <div className={styles['upload']} onClick={onUpload}>
          <IconPlus />
          <div>Upload</div>
        </div>
      );
    }

    return (
      <div className={styles['item']}>
        <div className={classnames(styles['info'])}>
          <img src={props.value} />
          <div className={styles['btn-wrap']}>
            <a title='Visualizar' onClick={() => setPreview(true)}>
              <IconEye />
            </a>
            <a title='Remover' onClick={() => onRemove()}>
              <IconDelete />
            </a>
          </div>
        </div>
      </div>
    );
  }, [isUploading, onRemove, onUpload, props.value]);

  if (!props.uploadHandler) {
    return <Input value={props.value} onChange={onChange} />;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles['container']}>
        {content}
        <Grid.Row style={{ width: '100%' }}>
          {mergeTags && (
            <Popover
              trigger='click'
              content={<MergeTags value={props.value} onChange={onChange} />}
            >
              <ArcoButton icon={<IconFont iconName='icon-merge-tags' />} />
            </Popover>
          )}
          <Input
            style={{ flex: 1 }}
            onPaste={onPaste}
            value={props.value}
            onChange={onChange}
            disabled={isUploading}
          />
          <ArcoButton
            onClick={onGetImage}
            icon={(
              <IconFont
                iconName={"icon-img"}
                style={{
                  textAlign: 'center',
                }}
              />
            )}
          />
        </Grid.Row>
      </div>
      <Modal visible={preview} footer={null} onCancel={() => setPreview(false)}>
        <img alt='Visualizar' style={{ width: '100%' }} src={props.value} />
      </Modal>
    </div>
  );
}
