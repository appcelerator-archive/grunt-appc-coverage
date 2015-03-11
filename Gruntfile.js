/*
 * grunt-appc-coverage
 * 
 *
 * Copyright (c) 2015 Appcelerator
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  // load all npm grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({

    mochaTest: {
      options: {
        timeout: 3000,
        reporter: 'spec',
        ignoreLeaks: false
      },
      unit: {
        src: ['test/**/*_test.js']
      },
    },

    appcJs: {
      src: ['lib/**/*.js']
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    kahvesi: { src: ['test/**/*_test.js'] },

    // Configuration to be run (and then tested).
    appc_coverage: {
      default_options: {
        src: 'coverage/lcov.info',
        force: true
      }
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-kahvesi');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-appc-js');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'appcJs','mochaTest:unit', 'kahvesi', 'appc_coverage']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'appcJs','mochaTest:unit']);

};
