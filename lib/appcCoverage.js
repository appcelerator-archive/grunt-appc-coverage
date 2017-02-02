/*
 * grunt-appc-coverage
 *
 *
 * Copyright (c) 2015 Appcelerator
 * Licensed under the MIT license.
 */

var request = require('request'),
	debug = require('debug')('grunt-appc-coverage:lib'),
	parse = require('lcov-parse');

const
	LOCAL = 'appc-local',
	INVALID_PROJECT = 'Please define the project name in the Gruntfile',
	SUCCESS_UPLOAD = 'Successfully submitted coverage results to coverage.appcelerator.com',
	FAILED_UPLOAD = 'Failed to submit coverage results to coverage.appcelerator.com',
	SERVER = 'http://coverage-preprod.cloud.appctest.com';

/**
 * AppcCoverage
 */
function AppcCoverage(project) {
	this.project = project;
	// initialize the service
	this.service = {
		name: LOCAL,
		jobId: null
	};
	// initialize the github information
	this.git = {
		commit: null,
		branch: null,
		pullRequest: true,
		fullName: null
	};
	// check enviroment for ci tool
	if (process.env.TRAVIS) {
		// service
		this.service.name = 'travis-ci';
		this.service.jobId = process.env.TRAVIS_JOB_ID;
		// git info
		this.git.commit = process.env.TRAVIS_COMMIT;
		this.git.branch = process.env.TRAVIS_BRANCH;
		this.git.pullRequest = process.env.TRAVIS_PULL_REQUEST;
		this.git.fullName = process.env.TRAVIS_REPO_SLUG;
	} else if (process.env.JENKINS) {
		// service
		this.service.name = 'jenkins-ci';
		this.service.jobId = process.env.BUILD_NUMBER;
		// git info
		this.git.commit = process.env.GIT_COMMIT;
		this.git.branch = process.env.GIT_BRANCH;
		this.git.pullRequest = false;
		this.git.fullName = process.env.GIT_URL;
	}
	debug('service', this.service);
	debug('git', this.git);
}

/**
 * Returns the project location
 */
AppcCoverage.prototype.isLocal = function isLocal() {
	return this.service.name === LOCAL;
};

/**
 * Get previous package coverage
 */
AppcCoverage.prototype.getCoverage = function getCoverage(opts, cb) {
	if (!this.project) {
		return cb(INVALID_PROJECT);
	}

	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	}

	// TODO:- add DESC order
	var q = {
			project: this.project,
			branch: opts.branch || 'master'
		},
		url = SERVER + '/api/v1/report/query.json?limit=1&where=' + JSON.stringify(q);
	debug('sending request: %s', url);
	request.get(url, {
		agentOptions: false,
		json: true
	}, function (err, response, body) {
		if (err || !!~[500, 400].indexOf(response.statusCode)) {
			debug('err:', err);
			debug('response:', response);
			debug('body:', body);
			return cb('Could not retrieve information from server');
		}
		var coverage = body.success && parseFloat(body[body.key].coverage);
		debug('coverage:', coverage);
		// coverage will be null if no previous coverage is found
		cb(null, coverage);
	});
};

/**
 * Parse Lcov into something processable
 */
AppcCoverage.prototype.parseLcov = function parseLcov(lcovString, callback) {
	parse(lcovString, function (err, data) {
		//process the data here
		callback(err, data);
	});
};

/**
 * Upload the data to the coverage server
 */
AppcCoverage.prototype.submit = function submit(data, cb) {
	if (!this.project) {
		return cb(INVALID_PROJECT);
	}
	var url = SERVER + '/api/v1/report/submit';
	debug('sending request: %s', url);
	debug(data);

	request.post(url, {
		json: data,
		agentOptions: false
		// TODO: if pullrequest is true, and we're offline, continue
	}, function (err, response, body) {
		if (err || !!~[500, 400].indexOf(response.statusCode) || (typeof body === 'object' && body.hasOwnProperty('error'))) {
			debug('err:', err);
			debug('response:', response);
			debug('body:', body);
			return cb(FAILED_UPLOAD);
		}
		return cb(null, SUCCESS_UPLOAD);
	});
};

module.exports = function (opts) {
	return new AppcCoverage(opts);
};

module.exports.LOCAL = LOCAL;
module.exports.INVALID_PROJECT = INVALID_PROJECT;
module.exports.SUCCESS_UPLOAD = SUCCESS_UPLOAD;
module.exports.FAILED_UPLOAD = FAILED_UPLOAD;
module.exports.SERVER = SERVER;
