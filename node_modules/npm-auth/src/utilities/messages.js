//default messages will be displayed here for the CLI.

/* eslint-disable no-console */
/* eslint-disable max-len */
import { chalkError, chalkSuccess } from './chalkConfiguration';

export const helpDescription = () => {
  console.info('This utility is used to set the credentials in .npmrc locally to authenticate against any public/private NPM Repository.');
  console.info('You MUST set the registry, email, and secure-token properties.');
  console.info('    Ex: npm-auth --registry=http://registry.npmjs.org --email=oshalygin@gmail.com --secure-token=14602980-0211-408e-aae8-72e6f8b9eb36');
  console.info('\n');
  console.info('To obtain your secure-token, please consult with your private NPM registry on how to obtain the API token.  If using npmjs.org, this is retrieved when you invoke `npm adduser`.  The api token will be set in `~/.npmrc`, you can extract it if you choose to do so but it\'s typically unnecessary.');
  console.info('\n');
};


export const availableArguments = () => {
  console.info('arguments:');
  console.info('   registry        (required): the registry repository, eg: npmjs.org');
  console.info('   email           (required): your email address associated to this repositroy, format: you@email.com');
  console.info('   secure-token    (required): your api key  which is used to authenticate');
  console.info('   file-path       (optional): specify the location to output the configuration file');
  console.info('   print           prints the local configuration file');
};

export const missingEmailProperty = () => {
  console.error(chalkError('Missing Email Property:'));
  console.error('The email property, `--email=you@email.com` MUST be provided OR set as an Environment Variable.');
  console.error('If the registry is set as an environment variable, verify that it is `NPM_REGISTRY_EMAIL`.');
};

export const missingRegistryProperty = () => {
  console.error(chalkError('Missing Registry Property:'));
  console.error('The registry property, `--registry=http://www.your-private-registry/npm` MUST be provided OR set as an Environment Variable.');
  console.error('If the registry is set as an environment variable, verify that it is `NPM_REGISTRY`.');
};

export const missingApiTokenProperty = () => {
  console.error(chalkError('Missing Secure Token Property:'));
  console.error('The registry property, `--secure-token=aasd-123-zasdf-123-sfd` MUST be provided OR set as an Environment Variable.');
  console.error('If the registry is set as an environment variable, verify that it is `NPM_REGISTRY_API_KEY`.');
};

export const invalidEmailFormat = () => {
  console.error(chalkError('Invalid Email Format:'));
  console.error('The format passed into the email property is invalid, example: you@email.com');
};

export const invalidFilePath = () => {
  console.error(chalkError('Invalid File Path:'));
  console.error('The path you specified does not exist.  This utility does not create paths.');
};

export const invalidRegistry = () => {
  console.error(chalkError('Invalid Registry:'));
  console.error('The registry you specified returned a 404');
};

export const successMessage = () => {
  console.log(chalkSuccess('Successfully updated the local .npmrc file'));
};
