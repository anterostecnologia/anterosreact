import fs from 'fs';
import path from 'path';

import {
  // missingTypeArgument,
  // typeArgumentIsNullOrWhiteSpace,
  missingEmailProperty,
  missingApiTokenProperty,
  missingRegistryProperty,
  filePathArgumentIsNullOrWhiteSpace,
  filePathIsInvalid
} from './messages.js';

/**
 * @export {function}
 * @param {any} argv command line args
 * @returns {Object} returns a hash object of utility properties
 */
export function parseRequiredProperties(argv) {
  const utilityProperties = {
    email: false,
    registry: false,
    secureToken: false
  };

  const hasProperty = Object.prototype.hasOwnProperty;
  const hasEmailProperty = hasProperty.call(argv, 'email');
  const hasRegistryProperty = hasProperty.call(argv, 'registry');
  const hasSecureTokenProperty = hasProperty.call(argv, 'secure-token');

  if (hasEmailProperty) {
    utilityProperties.email = true;
  }

  if (hasRegistryProperty) {
    utilityProperties.registry = true;
  }

  if (hasSecureTokenProperty) {
    utilityProperties.secureToken = true;
  }

  return utilityProperties;
}


/**
 * @export {function}
 * @param {any} requiredFields passed in fields object.
 * @returns {boolean} returns true/false based on whether or not the required fields were passed in.
 */
export function missingRequiredFields(requiredFields) {
  let missingRequiredField = false;

  if (!requiredFields.apikey) {
    missingApiTokenProperty();
    missingRequiredField = true;
  }
  if (!requiredFields.authEmail) {
    missingEmailProperty();
    missingRequiredField = true;
  }
  if (!requiredFields.registry) {
    missingRegistryProperty();
    missingRequiredField = true;
  }
  return missingRequiredField;
}

/**
 * @export {function}
 * @param {any} argv command line args
 * @param {string} filePathKey file path key that is used at the command line
 * @returns {boolean} returns true/false based on whether or not the required fields were passed in.
 */
export function parseRequiredFilePathArgument(argv, filePathKey) {
  const hasProperty = Object.prototype.hasOwnProperty;
  const hasFileArgument = hasProperty.call(argv, filePathKey);

  if (hasFileArgument && !argv[filePathKey]) {
    filePathArgumentIsNullOrWhiteSpace();
    return false;
  }

  const passedInPath = path.join(__dirname, argv[filePathKey]);
  if (!fs.existsSync(passedInPath)) {
    filePathIsInvalid(passedInPath);
    return false;
  }

  return true;
}



