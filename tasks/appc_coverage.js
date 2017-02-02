/*
* grunt-appc-coverage
*
* Copyright (c) 2015 Appcelerator
* Licensed under the MIT license.
*/
var debug = require('debug')('grunt-appc-coverage:grunt');

const NOT_FOUND = 'No src files could be found for coverage.appcelerator.com';

// NOTE:- Breaks module unit tests
// var pkg = require('./package.json');
// console.log(pkg.name);


module.exports = function (grunt) {
    var coverage,
        force;

    /**
     * Grunt Task
     */
    function appcCoverage() {
        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async(),
            filesProcessed = 0;

        force = this.options().force || this.data.force || false;
        debug('force: %s', force);
        // no files to process
        if (this.filesSrc.length === 0) {
            if (force) {
                grunt.log.warn(NOT_FOUND);
                return done();
            }

            grunt.log.error(NOT_FOUND);
            return done(false);
        }

        // initialize coverage library
        coverage = require('../lib/appcCoverage')(this.data.project || process.env.npm_package_name);

        for (var i = 0, max = this.filesSrc.length; i < max; ++i) {
            processFile(this.filesSrc[i], function (err, status) {
                filesProcessed++; // increment

                // check for error
                if (err && !force) {
                    grunt.log.error(err);
                    return done(false);
                }

                err && grunt.log.warn(err); // warn
                !err && status && grunt.log.ok(status); // log status

                // Check if all the files are processed
                if (filesProcessed === max) {
                    return done();
                }
            });
        }
    }

    /**
     * File Processing
     */
    function processFile(coverageFile, callback) {
        debug('processing file: %s', coverageFile);
        // Check if file exists
        if (!grunt.file.exists(coverageFile)) {
            debug('file not found');
            return callback(NOT_FOUND);
        }
        var objectToUpload = {};

        // Get options
        // console.log(process.env);
        // objectToUpload.project = process.env.npm_package_name;
        objectToUpload.project = coverage.project;
        objectToUpload.modules = {};
        coverage.git.branch && (objectToUpload.branch = coverage.git.branch);
        coverage.git.pullRequest && (objectToUpload.pull_request = coverage.git.pullRequest);

        // parse Lcov
        coverage.parseLcov(grunt.file.read(coverageFile), function (err, data) {
            if (err) {
                return callback(err);
            }
            objectToUpload.coverage = Number((calculatePercentage(data)).toFixed(2));
            objectToUpload.modules = data;
            debug('objectToUpload:', objectToUpload);

            function finish() {
                // Upload Data
                if (!coverage.isLocal()) {
                    coverage.submit(objectToUpload, callback);
                } else {
                    callback(null, null);
                }
            }

            // Show Coverage Information
            coverage.getCoverage(function (err, masterCoverage) {
                if (err) { return callback(err); }
                if (!masterCoverage) {
                    grunt.log.warn('This is the first time coverage has been run on this project');
                    grunt.log.ok('The project has a coverage of %s%', objectToUpload.coverage);
                    return finish();
                }
                grunt.log.ok('[master]  Coverage: %s%', masterCoverage);
                grunt.log.ok('[current] Coverage: %s%', objectToUpload.coverage);
                var diff = (objectToUpload.coverage - masterCoverage).toFixed(2),
                    threshold = 1, // percentage threshold
                    status = diff <= -threshold ? (force || coverage.isLocal() ? 'warn' : 'error') : 'ok',
                    message = 'The coverage for the project has changed ' + diff + '%';

                status !== 'error' && grunt.log[status](message);
                if (status === 'error') {
                    return callback(message);
                }
                finish();
            });
        });
    }

    /*
     * Calculate Percentage
     */
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

    /**
     * Register Task
     */
    grunt.registerMultiTask('appcCoverage', 'Grunt task to submit coverage to coverage.appcelerator.com', appcCoverage);
};
