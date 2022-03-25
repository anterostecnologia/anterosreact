/* eslint-disable react/jsx-wrap-multilines */
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import template from '@demo/store/template';
import { useAppSelector } from '@demo/hooks/useAppSelector';
import { useLoading } from '@demo/hooks/useLoading';
import { Button, Message, PageHeader, Select } from '@arco-design/web-react';
import { useQuery } from '@demo/hooks/useQuery';
import { useHistory } from 'react-router-dom';
import { cloneDeep, set, isEqual } from 'lodash';
import { Loading } from '@demo/components/loading';
import mjml from 'mjml-browser';
import { copy } from '@demo/utils/clipboard';
import { useEmailModal } from './components/useEmailModal';
import services from '@demo/services';
import {
  IconGithub,
  IconMoonFill,
  IconSunFill,
} from '@arco-design/web-react/icon';
import { Liquid } from 'liquidjs';
import {
  EmailEditor,
  EmailEditorProvider,
  EmailEditorProviderProps,
  IEmailTemplate,
} from '@anterostecnologia/anteros-email-editor';

import { Stack } from '@demo/components/Stack';
import { pushEvent } from '@demo/utils/pushEvent';
import { FormApi } from 'final-form';
import { UserStorage } from '@demo/utils/user-storage';

import { useCollection } from './components/useCollection';
import {
  AdvancedType,
  BasicType,
  getPageIdx,
  IBlockData,
  JsonToMjml,
} from '@anterostecnologia/anteros-email-core';
import { BlockMarketManager, SimpleLayout } from '@anterostecnologia/anteros-email-extensions';
import { AutoSaveAndRestoreEmail } from '@demo/components/AutoSaveAndRestoreEmail';

// Register external blocks
import './components/CustomBlocks';

import 'anteros-email-editor/lib/style.css';
import 'anteros-email-extensions/lib/style.css';
import blueTheme from '@arco-themes/react-anteros-email-theme/css/arco.css?inline';
import purpleTheme from '@arco-themes/react-anteros-email-theme-purple/css/arco.css?inline';
import greenTheme from '@arco-themes/react-anteros-email-theme-green/css/arco.css?inline';
import { useState } from 'react';
import { testMergeTags } from './testMergeTags';
import { useMergeTagsModal } from './components/useMergeTagsModal';
import { getTemplate } from '@demo/config/getTemplate';

const imageCompression = import('browser-image-compression');

const fontList = [
  'Arial',
  'Tahoma',
  'Verdana',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Lato',
  'Montserrat',
  '黑体',
  '仿宋',
  '楷体',
  '标楷体',
  '华文仿宋',
  '华文楷体',
  '宋体',
  '微软雅黑',
].map((item) => ({ value: item, label: item }));

export default function Editor() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState<'blue' | 'green' | 'purple'>('blue');
  const dispatch = useDispatch();
  const history = useHistory();
  const templateData = useAppSelector('template');
  const { addCollection, removeCollection, collectionCategory } =
    useCollection();
  const { openModal, modal } = useEmailModal();
  const { id, userId } = useQuery();
  const loading = useLoading(template.loadings.fetchById);
  const { modal: mergeTagsModal, openModal: openMergeTagsModal, mergeTags, setMergeTags } = useMergeTagsModal(testMergeTags);

  const isSubmitting = useLoading([
    template.loadings.create,
    template.loadings.updateById,
  ]);

  useEffect(() => {
    if (collectionCategory) {
      BlockMarketManager.addCategories([collectionCategory]);
      return () => {
        BlockMarketManager.removeCategories([collectionCategory]);
      };
    }
  }, [collectionCategory]);

  useEffect(() => {
    if (id) {
      if (!userId) {
        UserStorage.getAccount().then((account) => {
          dispatch(
            template.actions.fetchById({ id: +id, userId: account.user_id })
          );
        });
      } else {
        dispatch(template.actions.fetchById({ id: +id, userId: +userId }));
      }
    } else {
      dispatch(template.actions.fetchDefaultTemplate(undefined));
    }

    return () => {
      dispatch(template.actions.set(null));
    };
  }, [dispatch, id, userId]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }
  }, [isDarkMode]);

  const onUploadImage = async (blob: Blob) => {
    const compressionFile = await (
      await imageCompression
    ).default(blob as File, {
      maxWidthOrHeight: 1440,
    });
    return services.common.uploadByQiniu(compressionFile);
  };

  const onChangeTheme = useCallback((t) => {
    setTheme(t);
  }, []);

  const onChangeMergeTag = useCallback((path: string, val: any) => {
    setMergeTags((old) => {
      const newObj = cloneDeep(old);
      set(newObj, path, val);
      return newObj;
    });
  }, []);


  const onExportHtml = (values: IEmailTemplate) => {
    pushEvent({ name: 'ExportHtml' });
    const html = mjml(
      JsonToMjml({
        data: values.content,
        mode: 'production',
        context: values.content,
        dataSource: mergeTags,
      }),
      {
        beautify: true,
        validationLevel: 'soft',
      }
    ).html;

    copy(html);
    Message.success('Copiado para quadro!');
  };

  const onExportMJML = (values: IEmailTemplate) => {
    pushEvent({ name: 'ExportMJML' });
    const html = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: values.content,
      dataSource: mergeTags,
    });

    copy(html);
    Message.success('Copiado para quadro!');
  };

  const initialValues: IEmailTemplate | null = useMemo(() => {
    if (!templateData) return null;
    const sourceData = cloneDeep(templateData.content) as IBlockData;
    return {
      ...templateData,
      content: sourceData, // replace standard block
    };
  }, [templateData]);


  const onSubmit = useCallback(
    async (
      values: IEmailTemplate,
      form: FormApi<IEmailTemplate, Partial<IEmailTemplate>>
    ) => {
      pushEvent({ name: 'Save' });
      if (id) {
        const isChanged = !(isEqual(initialValues?.content, values.content) && isEqual(initialValues?.subTitle, values?.subTitle) && isEqual(initialValues?.subject, values?.subject));

        if (!isChanged) {
          Message.success('Envio bem sussedido!');
          form.restart(values);
          return;
        }
        dispatch(
          template.actions.updateById({
            id: +id,
            template: values,
            success() {
              Message.success('Atualizado com Sucesso!');
              form.restart(values);
            },
          })
        );
      } else {
        dispatch(
          template.actions.create({
            template: values,
            success(id, newTemplate) {
              Message.success('Salvo com sucesso!');
              form.restart(newTemplate);
              history.replace(`/editor?id=${id}`);
            },
          })
        );
      }
    },
    [dispatch, history, id, initialValues]
  );

  const onBeforePreview: EmailEditorProviderProps['onBeforePreview'] =
    useCallback((html: string, mergeTags) => {
      const engine = new Liquid();
      const tpl = engine.parse(html);
      return engine.renderSync(tpl, mergeTags);
    }, []);

  const themeStyleText = useMemo(() => {
    if (theme === 'green') return greenTheme;
    if (theme === 'purple') return purpleTheme;
    return blueTheme;
  }, [theme]);

  if (!templateData && loading) {
    return (
      <Loading loading={loading}>
        <div style={{ height: '100vh' }} />
      </Loading>
    );
  }

  if (!initialValues) return null;

  return (
    <div>
      <style>{themeStyleText}</style>
      <EmailEditorProvider
        key={id}
        height={'calc(100vh - 65px)'}
        data={initialValues}
        // interactiveStyle={{
        //   hoverColor: '#78A349',
        //   selectedColor: '#1890ff',
        // }}
        // onAddCollection={addCollection}
        // onRemoveCollection={({ id }) => removeCollection(id)}
        onUploadImage={onUploadImage}
        fontList={fontList}
        onSubmit={onSubmit}
        onChangeMergeTag={onChangeMergeTag}
        autoComplete
        enabledLogic
        // enabledMergeTagsBadge
        dashed={false}
        mergeTags={mergeTags}
        mergeTagGenerate={(tag) => `{{${tag}}}`}
        onBeforePreview={onBeforePreview}
      >
        {({ values }, { submit }) => {
          return (
            <>
              <PageHeader
                style={{ background: 'var(--color-bg-2)' }}
                backIcon
                title='Edit'
                onBack={() => history.push('/')}
                extra={
                  <Stack alignment='center'>
                    <Button
                      onClick={() => setIsDarkMode((v) => !v)}
                      shape='circle'
                      type='text'
                      icon={isDarkMode ? <IconMoonFill /> : <IconSunFill />}
                    ></Button>

                    <Select onChange={onChangeTheme} value={theme}>
                      <Select.Option value='blue'>Blue</Select.Option>
                      <Select.Option value='green'>Green</Select.Option>
                      <Select.Option value='purple'>Purple</Select.Option>
                    </Select>


                    <Button onClick={openMergeTagsModal}>
                      Update mergeTags
                    </Button>

                    <Button onClick={() => onExportMJML(values)}>
                      Export MJML
                    </Button>

                    <Button onClick={() => onExportHtml(values)}>
                      Export html
                    </Button>

                    <Button onClick={() => openModal(values, mergeTags)}>
                      Send test email
                    </Button>
                    <Button
                      loading={isSubmitting}
                      type='primary'
                      onClick={() => submit()}
                    >
                      Save
                    </Button>
                    <a
                      target='_blank'
                      href='https://github.com/m-Ryan/anteros-email'
                      style={{
                        color: '#000',
                        fontSize: 28,
                        width: 33,
                        height: 33,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                      }}
                      onClick={() => pushEvent({ name: 'Github' })}
                    >
                      <IconGithub />
                    </a>
                  </Stack>
                }
              />
              <SimpleLayout>
                <EmailEditor />
              </SimpleLayout>
              <AutoSaveAndRestoreEmail />
            </>
          );
        }}
      </EmailEditorProvider>
      {modal}
      {mergeTagsModal}
    </div>
  );
}

function replaceStandardBlockToAdvancedBlock(blockData: IBlockData) {
  const map = {
    [BasicType.TEXT]: AdvancedType.TEXT,
    [BasicType.BUTTON]: AdvancedType.BUTTON,
    [BasicType.IMAGE]: AdvancedType.IMAGE,
    [BasicType.DIVIDER]: AdvancedType.DIVIDER,
    [BasicType.SPACER]: AdvancedType.SPACER,
    [BasicType.SOCIAL]: AdvancedType.SOCIAL,
    [BasicType.ACCORDION]: AdvancedType.ACCORDION,
    [BasicType.CAROUSEL]: AdvancedType.CAROUSEL,
    [BasicType.NAVBAR]: AdvancedType.NAVBAR,
    [BasicType.WRAPPER]: AdvancedType.WRAPPER,
    [BasicType.SECTION]: AdvancedType.SECTION,
    [BasicType.GROUP]: AdvancedType.GROUP,
    [BasicType.COLUMN]: AdvancedType.COLUMN,
  };

  if (map[blockData.type]) {
    blockData.type = map[blockData.type];
  }
  blockData.children.forEach(replaceStandardBlockToAdvancedBlock);
  return blockData;
}
