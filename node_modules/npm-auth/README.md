# NPM-Auth

[![Build Status](https://travis-ci.org/oshalygin/npm-auth.svg?branch=master)](https://travis-ci.org/oshalygin/npm-auth)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4d47986f49e94df8a4d33ac07853ab0e)](https://www.codacy.com/app/oshalygin/npm-auth?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=oshalygin/npm-auth&amp;utm_campaign=Badge_Grade)

This utility is used to set the credentials in `.npmrc` locally to authenticate against any public/private NPM Repository.

## Requirements

* This utility depends on various environment variables being set, specifically:
* `NPM_REGISTRY_API_KEY` => the value of `_auth`.
* `NPM_REGISTRY_EMAIL` => the email used to authenticate with.  The default value will be used if this environment variable is not set.
* `NPM_REGISTRY` => the registry that the utility will authenticate against. 

####Installation
---
```bash
    npm install npm-auth
```
####Usage
---
```bash
    # This is the first task that needs to run prior to "npm install"
    npm-auth
```

If you are not setting the properties as environment variables, you are welcome to passing them via the CLI

```bash

  #arguments:
  #   registry        (required): the registry repository, eg: npmjs.org
  #   email           (required): your email address associated to this repositroy, format: you@email.com
  #   secure-token    (required): your api key  which is used to authenticate
  #   file-path       (optional): specify the location to output the configuration file
  #   print           prints the local configuration file


    # Example usage
    npm-auth --registry=http://www.your-private-registry/npm  --secure-token=aasd-123-zasdf-123-sfd --email=you@email.com
    # Note you may pass in just one of the three required parameters if the other parameters are set as Environment variables

    npm-auth --email=you@email.com
    # Also note that anythning passed via the CLI will OVERRIDE the Environment variables, which allows you to flexibibly configure within your CI environment.
    
```
Make sure to ignore the local `.npmrc` from the project solution
---
**.gitignore**
```
# Other ignore files above
.npmrc
``` 

####Development

Start with:
```bash
  npm install
```

Running tests:
```bash
  npm run test
  # Run test with coverage.  The coverage report by default is configured for lcov and can be located in the `./coverage` directory.
  npm run test:cover
```

Command: 
```bash
  npm run push
```

Building the application:
The resulting source code is built to a `./dist` directory which is where the transpiled source resides.  By default the test files are not built to this directory, only the underlying source.  

Command:
```bash
  npm run build
```

####Contributing

Looking to contribute to NPM-Auth?  I love seeing PR's and suggestions, please visit the [CONTRIBUTING](CONTRIBUTING.md) section for more information.