/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-process-env */
import { writeFileSync } from 'fs';
// import { chalkSuccess } from './utilities/chalkConfiguration';
import {
  missingRequiredFields
} from './utilities/requiredFields.js';
import {
  successMessage
} from './utilities/messages';
const argv = require('minimist')(process.argv.slice(2));

const secureTokenKey = 'secure-token';
const filePathKey = 'file-path';

const apikey = argv[secureTokenKey] || process.env.NPM_REGISTRY_API_KEY;
const authEmail = argv.email || process.env.NPM_REGISTRY_EMAIL;
const registry = argv.registry || process.env.NPM_REGISTRY;

const requiredFields = {
  apikey,
  authEmail,
  registry
};

const missingFields = missingRequiredFields(requiredFields);
if (missingFields) {
  process.exit(1);
}

const outputPath = argv[filePathKey];
const nextLine = '\n';

console.log('Creating a temporary .npmrc file which will be used to authenticate');

const npmConfigurationFile = outputPath
  ? `${outputPath}/.npmrc`
  : './.npmrc';

const fileContent = (`_auth=${apikey}${nextLine}always-auth=true${nextLine}email=${authEmail}${nextLine}registry=${registry}`);

writeFileSync(npmConfigurationFile, fileContent);
successMessage();
