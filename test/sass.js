'use strict';
var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('Sass framework', function () {
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

    it('shouldn\'t add Bourbon as dependency', function () {
      assert.noFileContent('bower.json', '"bourbon"');
    });

    it('shouldn\'t add Neat as a dependency', function () {
      assert.noFileContent('bower.json', '"neat"');
    });

    it('shouldn\'t include bitter files', function() {
      assert.noFile([
        'app/css/base/_base.scss',
        'app/css/base/_buttons.scss',
        'app/css/base/_forms.scss',
        'app/css/base/_grid-settings.scss',
        'app/css/base/_lists.scss',
        'app/css/base/_tables.scss',
        'app/css/base/_typography.scss',
        'app/css/base/_variables.scss'
      ]);
    });

    it('shouldn\'t include bourbon related includes at the top of main.scss', function () {
      assert.noFileContent('app/css/main.scss', /@import(.*?)bower_components\/bourbon\/app\/assets\/stylesheets\/bourbon/);
      assert.noFileContent('app/css/main.scss', /@import(.*?)base\/grid-settings/);
      assert.noFileContent('app/css/main.scss', /@import(.*?)bower_components\/neat\/app\/assets\/stylesheets\/neat/);
      assert.noFileContent('app/css/main.scss', /@import(.*?)base\/base/);
    });

    it('shouldn\'t add Bootstrap Sass as dependency', function () {
      assert.noFileContent('bower.json', '"bootstrap-sass"');
    });

    it('shouldn\'t add the comment block', function () {
      assert.noFileContent('app/index.html', 'build:js js/plugins.js')
    });
  });
});
