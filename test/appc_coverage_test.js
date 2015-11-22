var test = require('unit.js'),
    AppcCoverage = require('../lib/appcCoverage'),
    coverage = AppcCoverage('grunt-appc-coverage'),
    fs = require('fs'),
    dns = require('dns'),
    url = require('url');

describe('library', function () {
    it('coverage options', function () {
        test.object(coverage)
            .hasProperty('service')
            .hasProperty('git');

        test.object(coverage.service)
            .hasProperty('name')
            .hasProperty('jobId');

        if (process.env.TRAVIS && !coverage.isLocal()) {
            test.assert(coverage.service.name === 'travis-ci', 'travis-ci not being set');
        }
    });

    it('coverage.parseLcov();', function (done) {
        var lcovString = fs.readFileSync('./test/fixtures/lcov.info').toString();
        coverage.parseLcov(lcovString, function(err, data) {
            test.assert(err === null, err);
            test.assert(JSON.stringify(data) === fs.readFileSync('./test/expected/coverage.txt').toString(), 'Files did not match');
            done();
        });
    });

    it('coverage.getCoverage()', function (done) {
        coverage.getCoverage(function (err, coverage) {
            test.assert(err === null, err);
            done();
        });
    });
});

describe('DNS Check', function() {
    it('dns.resolve(' + url.parse(AppcCoverage.SERVER).host + ')', function (done) {
        dns.resolve(url.parse(AppcCoverage.SERVER).host, function (err, addresses) {
            test.assert(err == null, err);
            test.assert(addresses.length > 0, 'No addresses found');
            done();
        });
    });
});
