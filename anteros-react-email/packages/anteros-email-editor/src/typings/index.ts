import { IPage } from '@anterostecnologia/anteros-email-core';

export interface IEmailTemplate {
  content: IPage;
  subject: string;
  subTitle: string;
}
