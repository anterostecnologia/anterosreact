/* eslint-disable */

module.exports = function (wallaby) {
  'use strict';
  return {
    files: [
      'src/**/*.js*',
      'utilities/**/*.js*',
      'test-files/**/*.js*',
      '!src/**/*.json',
      '!src/**/*.spec.js*',
      '!src/**/*.functional.spec.js'
    ],

    tests: [
      'src/**/*.spec.js'
    ],
    env: {
      type: 'node',
      runner: 'node',
      params: {
        env: 'NODE_ENV=test'
      }
    },
    compilers: {
      '**/*.js*': wallaby.compilers.babel({
        presets: ['latest', 'stage-1'],
        plugins: ['transform-object-rest-spread']
      })
    },
    setup: function () {
      global.navigator = {
        userAgent: 'node.js'
      };
    }
  };
};
