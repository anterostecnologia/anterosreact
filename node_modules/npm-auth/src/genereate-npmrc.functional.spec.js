/* eslint-disable max-len */
/* eslint-disable no-process-env */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import fs from 'fs';

const exec = require('child_process').exec;

describe('Generating .npmrc Functional Tests', () => {

  const sut = 'node ./dist/generate-npmrc.js';

  it('should fail and display an error message if none of the properties are set or passed in', (done) => {

    const expected = "Missing Secure Token Property:\nThe registry property, `--secure-token=aasd-123-zasdf-123-sfd` MUST be provided OR set as an Environment Variable.\nIf the registry is set as an environment variable, verify that it is `NPM_REGISTRY_API_KEY`.\nMissing Email Property:\nThe email property, `--email=you@email.com` MUST be provided OR set as an Environment Variable.\nIf the registry is set as an environment variable, verify that it is `NPM_REGISTRY_EMAIL`.\nMissing Registry Property:\nThe registry property, `--registry=http://www.your-private-registry/npm` MUST be provided OR set as an Environment Variable.\nIf the registry is set as an environment variable, verify that it is `NPM_REGISTRY`.\n"; //eslint-disable-line quotes

    exec(sut,
      (error, stdout, stderr) => {
        const actual = stderr;
        expect(actual).equals(expected);
        done();
      });

  });

  it('should fail and display an error message that the email was not set', (done) => {
    process.env['NPM_REGISTRY_API_KEY'] = 'abcd-some-key';
    process.env['NPM_REGISTRY'] = 'http://www.some-private-npm-repository/registry';

    const expected = "Missing Email Property:\nThe email property, `--email=you@email.com` MUST be provided OR set as an Environment Variable.\nIf the registry is set as an environment variable, verify that it is `NPM_REGISTRY_EMAIL`.\n"; //eslint-disable-line quotes

    exec(sut,
      (error, stdout, stderr) => {
        const actual = stderr;
        expect(actual).equals(expected);
        done();
      });

  });

  it('should create a local .npmrc file and set the environment variables', (done) => {
    process.env['NPM_REGISTRY_API_KEY'] = 'abcd-some-key';
    process.env['NPM_REGISTRY_EMAIL'] = 'oshalygin@gmail.com';
    process.env['NPM_REGISTRY'] = 'http://www.some-private-npm-repository/registry';

    const expected = 'Creating a temporary .npmrc file which will be used to authenticate\nSuccessfully updated the local .npmrc file\n';

    exec(sut,
      (error, stdout) => {
        const actual = stdout;
        expect(actual).equals(expected);

        fs.unlinkSync('.npmrc');
        done();
      });

  });

  it('should create a local .npmrc file and contain the api key that was set', (done) => {
    process.env['NPM_REGISTRY_API_KEY'] = 'abcd-some-key';
    process.env['NPM_REGISTRY_EMAIL'] = 'oshalygin@gmail.com';
    process.env['NPM_REGISTRY'] = 'http://www.some-private-npm-repository/registry';

    const expected = `_auth=${process.env['NPM_REGISTRY_API_KEY']}`;
    const authApiKeyIndex = 0;
    exec(sut,
      () => {
        const npmrc = fs.readFileSync('.npmrc', 'utf8').split('\n');
        const actual = npmrc[authApiKeyIndex];

        expect(actual).equals(expected);

        fs.unlinkSync('.npmrc');
        done();
      });
  });

  it('should create a local .npmrc file and contain the email key that was set', (done) => {
    process.env['NPM_REGISTRY_API_KEY'] = 'abcd-some-key';
    process.env['NPM_REGISTRY_EMAIL'] = 'oshalygin@gmail.com';
    process.env['NPM_REGISTRY'] = 'http://www.some-private-npm-repository/registry';

    const expected = `email=${process.env['NPM_REGISTRY_EMAIL']}`;
    const emailIndex = 2;
    exec(sut,
      () => {
        const npmrc = fs.readFileSync('.npmrc', 'utf8').split('\n');
        const actual = npmrc[emailIndex];

        expect(actual).equals(expected);

        fs.unlinkSync('.npmrc');
        done();
      });
  });

  it('should create a local .npmrc file and contain the registry endpoint that was set', (done) => {
    process.env['NPM_REGISTRY_API_KEY'] = 'abcd-some-key';
    process.env['NPM_REGISTRY_EMAIL'] = 'oshalygin@gmail.com';
    process.env['NPM_REGISTRY'] = 'http://www.some-private-npm-repository/registry';

    const expected = `registry=${process.env['NPM_REGISTRY']}`;
    const registryIndex = 3;
    exec(sut,
      () => {
        const npmrc = fs.readFileSync('.npmrc', 'utf8').split('\n');
        const actual = npmrc[registryIndex];

        expect(actual).equals(expected);
                fs.unlinkSync('.npmrc');
        done();
      });
  });

});
