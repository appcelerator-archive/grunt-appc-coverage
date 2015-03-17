# grunt-appc-coverage [![Build Status](https://travis-ci.org/appcelerator-modules/grunt-appc-coverage.svg?branch=master)](https://travis-ci.org/appcelerator-modules/grunt-appc-coverage) [![Coverage Status](https://coverage.appcelerator.com/appcelerator-modules/grunt-appc-coverage/label_master.svg)](https://coverage.appcelerator.com/appcelerator-modules#grunt-appc-coverage)

> Grunt task to load coverage results and submit them to coverage.appcelerator.com

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-appc-coverage --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-appc-coverage');
```

## The "appc_coverage" task

### Overview
In your project's Gruntfile, add a section named `appc_coverage` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  appcCoverage: {
    default_options: {
      src: ['paths', 'to', 'lcov.info'],
      force: true
    }
  }
})
```

## Contributing
Add unit tests for any new or changed functionality. Run npm test to ensure your added code matches existing style standards.

## License
Copyright (c) 2015 Appcelerator. Licensed under the MIT license.
