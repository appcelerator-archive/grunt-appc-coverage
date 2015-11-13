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
	SERVER = 'http://coverage-preprod.cloud.appctest.com';

exports.SERVER = SERVER;

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
			pullRequest: true,
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

	if (process.env.JENKINS) {
		// service
		options.service.name = 'jenkins-ci';
		options.service.jobId = process.env.BUILD_NUMBER;
		// git info
		options.git.commit = process.env.GIT_COMMIT;
		options.git.branch = process.env.GIT_BRANCH;
		options.git.pullRequest = false;
		options.git.fullName = process.env.GIT_URL;
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
	console.log(data);
	var url = SERVER + '/api/v1/report/submit';
	request.post(url, {
		json: data,
		agentOptions: false
	}, function (err, response, body) {
		if (err || response.statusCode === 500 || response.statusCode === 400 || (typeof body === 'object' && body.hasOwnProperty('error'))) {
			console.log(body);
			return callback(FAILED_UPLOAD);
		}
		return callback(null, SUCCESS_UPLOAD);
	});
};
