/*
 * grunt-appc-coverage
 *
 *
 * Copyright (c) 2015 Appcelerator
 * Licensed under the MIT license.
 */

var request = require('request'),
	parse = require('lcov-parse');

const
	SUCCESS_UPLOAD = 'Successfully submitted coverage results to coverage.appcelerator.com',
	FAILED_UPLOAD = 'Failed to submit coverage results to coverage.appcelerator.com',
	SERVER = 'http://localhost:8080/v1';

/**
 * Get enviromental options such as service and git
 */
exports.getOptions = function () {
	var options = {
		service: {
			name: 'grunt-appc-coverage',
			jobId: null
		},
		git: {
			commit: null,
			branch: null,
			pullRequest: null,
			fullName: null
		}
	};

	if (process.env.TRAVIS) {
		// service
		options.service.name = 'travis-ci';
		options.service.jobId = process.env.TRAVIS_JOB_ID;
		// git info
		options.git.commit = process.env.TRAVIS_COMMIT;
		options.git.branch = process.env.TRAVIS_BRANCH;
		options.git.pullRequest = process.env.TRAVIS_PULL_REQUEST;
		options.git.fullName = process.env.TRAVIS_REPO_SLUG;
	}

	return options;
};

/**
 * Parse Lcov into something processable
 */
exports.parseLcov = function (lcovString, callback) {
	parse(lcovString, function (err, data) {
		//process the data here
		callback(err, data);
	});
};

/**
 * Upload the data to the coverage server
 */
exports.upload = function (data, callback) {
	request.post({
		url : SERVER + '/coverage',
		form : {
			type : 'grunt-appc-coverage',
			data: data
		},
		json: true
	}, function (err, response, body) {
		if (response.statusCode === 500 || err || body.hasOwnProperty('error')) {
			return callback(FAILED_UPLOAD);
		}

		return callback(null, SUCCESS_UPLOAD);
	});
};
