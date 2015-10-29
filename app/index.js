'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    var testLocal;

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });

    if (this.options['test-framework'] === 'mocha') {
      testLocal = require.resolve('generator-mocha/generators/app/index.js');
    } else if (this.options['test-framework'] === 'jasmine') {
      testLocal = require.resolve('generator-jasmine/generators/app/index.js');
    }

    this.composeWith(this.options['test-framework'] + ':app', {
      options: {
        'skip-install': this.options['skip-install']
      }
    }, {
      local: testLocal
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('\'Allo \'allo! Out of the box I include HTML5 Boilerplate, SASS and a gulpfile to build your app.'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'A Sass Framework',
        value: 'includeStyleFramework',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      type: 'list',
      name: 'framework',
      message: 'Which framework would you like?',
      default: 'includeBourbon',
      choices: [{
        name: 'Bourbon\/Neat',
        value: 'includeBourbon'
      }, {
        name: 'Bootstrap',
        value: 'includeBootstrap'
      }],
      when: function (answers) {
        return !answers.features.indexOf('includeStyleFramework') !== -1;
      }
    }, {
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Would you like to include jQuery?',
      default: true,
      when: function (answers) {
        return answers.framework != 'includeBootstrap';
      }
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;
      var framework = answers.framework;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeStyleFramework = hasFeature('includeStyleFramework');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeJQuery = answers.includeJQuery;

      if (this.includeStyleFramework) {
        if (framework === 'includeBootstrap') {
          this.includeBourbon = false;
          this.includeBootstrap = true;
          this.includeJQuery = false;
        } else {
          this.includeBourbon = true;
          this.includeBootstrap = false;
        }
      } else {
        this.includeBourbon = false;
        this.includeBootstrap = false;
      }

      done();
    }.bind(this));
  },

  writing: {

    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('_gulpfile.babel.js'),
        this.destinationPath('gulpfile.babel.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          includeBootstrap: this.includeBootstrap,
          includeBabel: this.options['babel'],
          testFramework: this.options['test-framework']
        }
      );
    },

    packageJSON: function () {
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json')
        {
          includeBabel: this.options['babel']
        }
      );
    },

    babel: function () {
      this.fs.copy(
        this.templatePath('babelrc'),
        this.destinationPath('.babelrc')
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes')
      );
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (!this.includeBootstrap) {
        bowerJson.dependencies['normalize-css'] = '~3.0.3';
      }

      if (this.includeBootstrap) {
        bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
        bowerJson.overrides = {
          'bootstrap-sass': {
            'main': [
              'assets/stylesheets/_bootstrap.scss',
              'assets/fonts/bootstrap/*',
              'assets/javascripts/bootstrap.js'
            ]
          }
        };
      } else if (this.includeBourbon) {
        bowerJson.dependencies['bourbon'] = '~4.2.6';
        bowerJson.dependencies['neat'] = '~1.7.2';
      }

      if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.1';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      this.fs.writeJSON('bower.json', bowerJson);

      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    h5bp: function () {
      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('app/favicon.ico')
      );

      this.fs.copy(
        this.templatePath('apple-touch-icon.png'),
        this.destinationPath('app/apple-touch-icon.png')
      );

      this.fs.copy(
        this.templatePath('robots.txt'),
        this.destinationPath('app/robots.txt')
      );

      this.fs.copy(
        this.templatePath('browserconfig.xml'),
        this.destinationPath('app/browserconfig.xml')
      );

      this.fs.copy(
        this.templatePath('crossdomain.xml'),
        this.destinationPath('app/crossdomain.xml')
      );

      this.fs.copy(
        this.templatePath('tile.png'),
        this.destinationPath('app/tile.png')
      );

      this.fs.copy(
        this.templatePath('tile-wide.png'),
        this.destinationPath('app/tile-wide.png')
      );
    },

    styles: function () {
      this.fs.copyTpl(
        this.templatePath('main.scss'),
        this.destinationPath('app/css/main.scss'),
        {
          includeBourbon: this.includeBourbon,
          includeBootstrap: this.includeBootstrap
        }
      );

      if (this.includeBourbon) {
        this.fs.copy(
          this.templatePath('_base.scss'),
          this.destinationPath('app/css/base/_base.scss')
        );

        this.fs.copy(
          this.templatePath('_buttons.scss'),
          this.destinationPath('app/css/base/_buttons.scss')
        );

        this.fs.copy(
          this.templatePath('_forms.scss'),
          this.destinationPath('app/css/base/_forms.scss')
        );

        this.fs.copy(
          this.templatePath('_grid-settings.scss'),
          this.destinationPath('app/css/base/_grid-settings.scss')
        );

        this.fs.copy(
          this.templatePath('_lists.scss'),
          this.destinationPath('app/css/base/_lists.scss')
        );

        this.fs.copy(
          this.templatePath('_tables.scss'),
          this.destinationPath('app/css/base/_tables.scss')
        );

        this.fs.copy(
          this.templatePath('_typography.scss'),
          this.destinationPath('app/css/base/_typography.scss')
        );

        this.fs.copy(
          this.templatePath('_variables.scss'),
          this.destinationPath('app/css/base/_variables.scss')
        );
      }
    },

    scripts: function () {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('app/js/main.js')
      );
    },

    html: function () {
      var bsPath;

      // path prefix for Bootstrap JS files
      if (this.includeBootstrap) {
        bsPath = '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';
      }

      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('app/index.html'),
        {
          appname: this.appname,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          includeJQuery: this.includeJQuery,
          bsPath: bsPath,
          bsPlugins: [
            'affix',
            'alert',
            'dropdown',
            'tooltip',
            'modal',
            'transition',
            'button',
            'popover',
            'carousel',
            'scrollspy',
            'collapse',
            'tab'
          ]
        }
      );
    },

    misc: function () {
      mkdirp('app/img');
      mkdirp('app/fnt');
    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      exclude: ['bootstrap-sass', 'bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/index.html'
    });

    if (this.includeBootstrap) {
      // wire Bower packages to .scss
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        ignorePath: /^(\.\.\/)+/,
        src: 'app/css/*.scss'
      });
    }
  }
});
