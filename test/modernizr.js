'use strict';
var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('modernizr feature', function () {
  describe('on', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({
          features: [
            'includeModernizr'
          ]
        })
        .on('end', done);
    });

    it('should add the correct dependencies', function () {
      assert.fileContent('bower.json', '"modernizr"');
    });

    it('should add modernizr into his own comment block', function () {
      assert.fileContent('app/index.html', 'build:js js/vendor/modernizr.js');
    });
  });

  describe('off', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({
          features: []
        })
        .on('end', done);
    });

    it('should add the correct dependencies', function () {
      assert.noFileContent('bower.json', '"modernizr"');
    });

    it('shouldn\'t add modernizr comment block', function () {
      assert.noFileContent('app/index.html', 'build:js js/vendor/modernizr.js');
    });
  });
});
