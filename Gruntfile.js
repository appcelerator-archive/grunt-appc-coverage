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
		mocha_istanbul: {
			coverage: {
				src: 'test',
				options: {
					timeout: 30000,
					ignoreLeaks: false
				}
			}
		},

		appcJs: {
			src: ['lib/**/*.js']
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp']
		},

		// Configuration to be run (and then tested).
		appcCoverage: {
				default_options: {
				project: 'appcelerator-modules/grunt-appc-coverage',
				src: 'coverage/lcov.info',
				// force: false
			}
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-mocha-istanbul');
	grunt.loadNpmTasks('grunt-appc-js');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'appcJs', 'mocha_istanbul:coverage', 'appcCoverage']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['appcJs','mocha_istanbul:coverage']);
};
