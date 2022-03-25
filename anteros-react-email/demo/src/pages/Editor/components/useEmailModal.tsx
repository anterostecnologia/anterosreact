import { JsonToMjml, IBlockData } from '@anterostecnologia/anteros-email-core';
import { IEmailTemplate } from '@anterostecnologia/anteros-email-editor';
import { Message, Modal } from '@arco-design/web-react';
import React, { useMemo, useState } from 'react';
import mjml from 'mjml-browser';
import { useDispatch } from 'react-redux';
import email from '@demo/store/email';
import * as Yup from 'yup';
import { Form } from 'react-final-form';
import { useLoading } from '@demo/hooks/useLoading';
import { useCallback } from 'react';
import { pushEvent } from '@demo/utils/pushEvent';
import mustache from 'mustache';
import { CustomBlocksType } from './CustomBlocks/constants';
import { cloneDeep, merge } from 'lodash';
import { TextAreaField, TextField } from '@anterostecnologia/anteros-email-extensions';

const schema = Yup.object().shape({
  toEmail: Yup.string().email('Unvalid email').required('Email required'),
});

export function useEmailModal() {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [emailData, setEmailData] = useState<IEmailTemplate | null>(null);
  const [mergeTags, setMergeTags] = useState<any>(null);
  const emailSendLoading = useLoading(email.loadings.send);

  const onSendEmail = useCallback(
    async (values: { toEmail: string; mergeTags: string; }) => {
      if (!emailData) return null;
      pushEvent({ action: 'SendTestEmail', name: values.toEmail });
      let mergeTagsPayload = {};
      try {
        mergeTagsPayload = JSON.parse(values.mergeTags);
      } catch (error) {
        Message.error('invalid JSON');
        return;
      }

      const mjmlContent = JsonToMjml({
        data: emailData.content,
        mode: 'production',
        context: emailData.content,
        dataSource: mergeTagsPayload,
      });

      const html = mjml(mustache.render(mjmlContent, mergeTagsPayload), {
        beautify: true,
        validationLevel: 'soft',
      }).html;

      dispatch(
        email.actions.send({
          data: {
            toEmail: values.toEmail,
            subject: emailData.subject,
            text: emailData.subTitle || emailData.subject,
            html: html,
          },
          success: () => {
            closeModal();
            Message.success('Email send!');
          },
        })
      );
    },
    [dispatch, emailData]
  );

  const openModal = (value: IEmailTemplate, mergeTags: any) => {
    setEmailData(value);
    setMergeTags(mergeTags);
    setVisible(true);
  };
  const closeModal = () => {
    setEmailData(null);
    setMergeTags(null);
    setVisible(false);
  };

  const modal = useMemo(() => {
    return (
      <Form
        validationSchema={schema}
        initialValues={{
          toEmail: '',
          mergeTags: JSON.stringify(mergeTags, null, 2),
        }}
        onSubmit={onSendEmail}
      >
        {({ handleSubmit }) => (
          <Modal
            style={{ zIndex: 9999 }}
            title='Send test email'
            okText='Send'
            visible={visible}
            confirmLoading={emailSendLoading}
            onOk={() => handleSubmit()}
            onCancel={closeModal}
          >
            <TextField autoFocus name='toEmail' label='To email' />
            <TextAreaField
              rows={15}
              autoFocus
              name='mergeTags'
              label='Dynamic data'
            />
          </Modal>
        )}
      </Form>
    );
  }, [mergeTags, onSendEmail, visible, emailSendLoading]);

  return {
    modal,
    openModal,
  };
}
