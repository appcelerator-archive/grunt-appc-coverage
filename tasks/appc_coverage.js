/*
 * grunt-appc-coverage
 * 
 *
 * Copyright (c) 2015 Appcelerator
 * Licensed under the MIT license.
 */

'use strict';

var NOT_FOUND = 'No src files could be found for coverage.appcelerator.com';

var coverage = require('../lib/appcCoverage');
var pkg = require('./package.json');
console.log(pkg.name);


module.exports = function (grunt) {

  function appcCoverage() {

    // Force task into async mode and grab a handle to the "done" function.
    var done = this.async(),
      force = this.options().force || this.data.force || false,
      filesProcessed = 0;

    if (this.filesSrc.length === 0) {
      if (force) {
        grunt.log.warn(NOT_FOUND);
        return done();
      }

      grunt.log.error(NOT_FOUND);
      return done(false);
    }
    for (var i = 0, max = this.filesSrc.length; i < max; i++) {
      processFile(this.filesSrc[i], function (err, status) {
        // increment
        filesProcessed++;
        // check for error
        if (err && !force) {
          grunt.log.error(err);
          return done(false);
        } else if (err) {
          // warn
          grunt.log.warn(err);
        } else {
          // log status
          grunt.log.ok(status);
        }

        // Check if all the files are processed
        if (filesProcessed === max) {
          return done();
        }
      });
    }
  }

  function processFile(coverageFile, callback) {

    // Check if file exists
    if (!grunt.file.exists(coverageFile)) {
      return callback(NOT_FOUND);
    }
    var objectToUpload = {};

    // Get options
    console.log(process.env);
    objectToUpload.project = process.env.npm_package_name;
    objectToUpload.modules = {};
    var options = coverage.getOptions();
    if(options.git.branch) {
      objectToUpload.branch = options.git.branch;
    }
    if(options.git.pullRequest) {
      objectToUpload.pull_request = options.git.pullRequest;
    }    
    //objectToUpload.options = coverage.getOptions();

    // parse Lcov
    coverage.parseLcov( grunt.file.read(coverageFile), function (err, data) {
      if (err) {
        return callback(err);
      }
      objectToUpload.coverage = Number((calculatePercentage(data)).toFixed(2));
      objectToUpload.modules = data;
      // Upload Data
      coverage.upload(objectToUpload, callback);
    });
  }

  function calculatePercentage(coverage) {
    var percentage = 0,
      max = coverage.length;

    for (var i = 0; i < max; i++) {
      var current = coverage[i],
        currentPercentage = parseFloat(current.lines.hit) / parseFloat(current.lines.found) * 100;
        percentage += currentPercentage;
    }
    percentage /= max;
    return percentage;
  }

  grunt.registerMultiTask('appcCoverage', 'Grunt task to submit coverage to coverage.appcelerator.com', appcCoverage);

};
