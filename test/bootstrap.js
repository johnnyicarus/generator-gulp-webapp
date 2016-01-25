'use strict';
var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Bootstrap feature', function () {
  describe('on', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({
          features: [
            'includeStyleFramework'
          ],
          framework: 'includeBootstrap'
        })
        .on('end', done);
    });

    it('should add the comment block', function () {
      assert.fileContent('app/index.html', 'build:js js/plugins.js')
    });

    it('should add Bootstrap Sass as dependency', function () {
      assert.fileContent('bower.json', '"bootstrap-sass"');
    });

    it('should output the correct <script> paths', function () {
      assert.fileContent('app/index.html', /src=\"(.*?)\/bootstrap-sass\/assets\/javascripts\/bootstrap\//);
    });

    // should add comment block in main.scss

    it('should contain the font icon path variable', function () {
      assert.fileContent('app/css/main.scss', '$icon-font-path');
    });

    it('should correctly override bootstrap\'s bower.json', function() {
      assert.fileContent('bower.json', '"overrides"');

      assert.fileContent('bower.json', 'assets/stylesheets/_bootstrap.scss');

      assert.fileContent('bower.json', 'assets/fonts/bootstrap/*');

      assert.fileContent('bower.json', 'assets/javascripts/bootstrap.js');
    });

    it('shouldn\'t add jQuery explicitly as a dependency', function () {
      assert.noFileContent('bower.json', '"jquery"');
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

    it('should add jQuery explicitly as a dependency', function () {
      assert.fileContent('bower.json', '"jquery"');
    });

    it('should add normalize.css explicitly as a dependency', function () {
      assert.fileContent('bower.json', '"normalize-css"')
    });

    it('shouldn\'t add Bootstrap Sass as dependency', function () {
      assert.noFileContent('bower.json', '"bootstrap-sass"');
    });

    it('shouldn\'t add the comment block', function () {
      assert.noFileContent('app/index.html', 'build:js js/plugins.js')
    });
  });
});
