'use strict';
var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('revving feature', function () {
  describe('on', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({
          features: [
            'includeRevving'
          ]
        })
        .on('end', done);
    });

    it('should add gulp-rev and gulp-rev-replace as dev dependencies', function () {
      assert.fileContent('package.json', 'gulp-rev');

      assert.fileContent('package.json', 'gulp-rev-replace');
    });

    it('should call gulp-rev and gulp-rev-replace in the html task', function () {
      assert.fileContent("gulpfile.babel.js", ".pipe($.if('*.js', $.rev()))");
      assert.fileContent("gulpfile.babel.js", ".pipe($.if('*.css', $.rev()))");
      assert.fileContent('gulpfile.babel.js', '.pipe($.revReplace())');
    });

    it('should add htaccess file', function () {
      assert.file('app/.htaccess');
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

    it('shouldn\'t add gulp-rev and gulp-rev-replace', function () {
      assert.noFileContent('package.json', 'gulp-rev');

      assert.noFileContent('package.json', 'gulp-rev-replace');
    });

    it('shouldn\'t call gulp-rev and gulp-useref', function () {
      assert.noFileContent("gulpfile.babel.js", ".pipe($.if('*.js', $.rev()))");
      assert.noFileContent("gulpfile.babel.js", ".pipe($.if('*.css', $.rev()))");
      assert.noFileContent('gulpfile.babel.js', '.pipe($.revReplace())');
    });

    it('shouldn\'t add htaccess file', function () {
      assert.noFile('app/.htaccess');
    });
  });
});
