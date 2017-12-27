import { expect } from 'chai';
import {
  parseRequiredProperties,
  missingRequiredFields
} from './requiredFields.js';

describe('Required Fields', () => {
  const argv = {
    email: 'oshalygin@gmail.com',
    registry: 'http://www.npmjs.org/npm',
    'secure-token': 'some-secure-api-key'
  };


  it('if argv is null, the default is an object with all three properties as false', () => {
    const expected = {
      email: false,
      registry: false,
      secureToken: false
    };

    const emptyArgv = {};
    const actual = parseRequiredProperties(emptyArgv);
    expect(actual).deep.equals(expected);
  });

  it('if all of the properties are set, everything is returned as true', () => {
    const expected = {
      email: true,
      registry: true,
      secureToken: true
    };

    const actual = parseRequiredProperties(argv);
    expect(actual).deep.equals(expected);
  });

  it('should return false for the email property if it was not set', () => {
    const {email, ...updatedArgv} = argv; //eslint-disable-line no-unused-vars

    const expected = {
      email: false,
      registry: true,
      secureToken: true
    };

    const actual = parseRequiredProperties(updatedArgv);
    expect(actual).deep.equals(expected);
  });

  it('should return false for the registry property if it was not set', () => {
    const {registry, ...updatedArgv} = argv; //eslint-disable-line no-unused-vars

    const expected = {
      email: true,
      registry: false,
      secureToken: true
    };

    const actual = parseRequiredProperties(updatedArgv);
    expect(actual).deep.equals(expected);
  });

  it('should return false for the secureToken property if it was not set', () => {
    const updatedArgv = { ...argv };
    delete updatedArgv['secure-token'];

    const expected = {
      email: true,
      registry: true,
      secureToken: false
    };

    const actual = parseRequiredProperties(updatedArgv);
    expect(actual).deep.equals(expected);
  });

  it('should return false if all fields were passed in to missingRequiredFields', () => {
    const requiredFields = {
      apikey: 'asdfasdf',
      authEmail: 'oshalygin@gmail.com',
      registry: 'http://www.npmjs.org/npm'
    };

    const actual = missingRequiredFields(requiredFields);
    expect(actual).equals(false);
  });

  it('should return true if the apikey is undefined', () => {
    const requiredFields = {
      authEmail: 'oshalygin@gmail.com',
      registry: 'http://www.npmjs.org/npm'
    };

    const actual = missingRequiredFields(requiredFields);
    expect(actual).equals(true);
  });

  it('should return true if the registry is undefined', () => {
    const requiredFields = {
      apikey: 'asdfasdf',
      authEmail: 'oshalygin@gmail.com'
    };

    const actual = missingRequiredFields(requiredFields);
    expect(actual).equals(true);
  });

  it('should return true if the email is undefined', () => {
    const requiredFields = {
      apikey: 'asdfasdf',
      registry: 'http://www.npmjs.org/npm'
    };

    const actual = missingRequiredFields(requiredFields);
    expect(actual).equals(true);
  });

  it('should return true if the the object passed in is empty', () => {
    const requiredFields = {};

    const actual = missingRequiredFields(requiredFields);
    expect(actual).equals(true);
  });


});
