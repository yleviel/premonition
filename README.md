# Premonition

This module is meant to help you (the developer) determine if it is safe to upgrade some or all of your packages to the latest.

This application is built on a number of other libraries like Underscore. These dependencies will be pulled in when
you do `npm install`.

## Installation

`npm install premonition --save-dev`

This will create a binary in your `node_modules/.bin` directory as well as a library that can be included in your
Node project. In order to limit the modules that updated, you should provide a configuration file to describe which modules
to use:

`node_modules/.bin/premonition <path-to-config-file.js>`

##Global Config Options <a name='config'></a>

An example of this configuration may look like the following:

```
'use strict';
module.exports = {
    filesToUpdate : ['package.json', 'bower.json'],
    modulesToUpdate: [ 'grunt' ]
};
```

###config.filesToUpdate
**default: ['package.json', 'bower.json'] **

The specific files to update.  This value should not be a pattern, but rather an exact path.

###config.modulesToUpdate
**default: null **

If specified, the value will contain a list of strings which will match the modules listed in the dependencies and devDependencies lists

##Component Overview

### premonition binary

The *premonition* binary will take your package.json file, create a backup file: `package.json.old`. After that, a list of all
permutations will be generated, an npm install will be run on the directory, 

`node_modules/.bin/premonition <path-to-config-file>`

### main.js

##Testing

`npm test`.

##Contributing

The source code can be browsed at https://github.com/yleviel/premonition. Pull requests are welcome.

### Pull Requests

Here are the steps you should follow when submitting a pull request. 

* Write at least one test for your feature.
* Verify that the test passes by running `npm test`.

##Filing Issues

All issues for this component are located here: https://github.com/yleviel/premonition/issues

## Release History

v0.1.0

* Initial commit
