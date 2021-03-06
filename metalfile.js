var publish = require('metalsmith-publish');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var inPlace = require('metalsmith-in-place');
var swigHelpers = require('metalsmith-swig-helpers');
var ignore = require('metalsmith-ignore');
var headings = require('metalsmith-headings');
var headingsId = require('metalsmith-headings-identifier');
var fileMetadata = require('metalsmith-filemetadata');
var collections = require('metalsmith-collections');
var define = require('metalsmith-define');
var pagination = require('metalsmith-pagination');
var relativity = require('metalsmith-relativity');
var paths = require('metalsmith-paths');
var rewrite = require('metalsmith-rewrite');
var hierarchy = require('metalsmith-hierarchy');
var metadata = require('metalsmith-metadata');
var extlinks = require('metalsmith-external-links');

var _ = require('lodash');
var datagrab = require('date-grab');

module.exports = [
  swigHelpers({
    filters: {
      debug: function(c) {
        console.log(c);
      },
      
      slice: function(content, start, end) {
        return _.slice(content, start, end);
      },

      segment: function(content, page, per) {
        var start = (page - 1) * per;
        var end = page * per;
        return _.slice(content, start, end);
      },

      where: function(content, obj) {
        return _.where(content, obj);
      },

      sortby: function(content, obj) {
        return _.sortBy(content, obj);
      }
    }
  }),

  ignore([
    '**/.DS_Store',
    '_macros/**/*',
    '_modules/**/*',
    '_layouts/**/*'
  ]),

  publish(),
  markdown(),
  headings(),

  function(f,m,d) {
    Object.keys(f).forEach(function(filename) {
      var data = f[filename];
      var date = datagrab(['month', 'year'])(data.date);

      data.month = date.month;
      data.year = date.year;
    });

    d();
  },

  fileMetadata([{
    pattern: '**/*', 
    metadata: {
      layout: 'simple.swig'
    }
  }, {
    pattern: 'blog/**/*', 
    metadata: {
      parent: 'blog/index.html',
      section: 'blog', 
      layout: 'post.swig',
      type: 'post'
    }
  }, {
    pattern: 'blog/index.html', 
    metadata: {
      parent: 'index.html',
      layout: 'simple.swig'
    }
  }, {
    pattern: 'code/**/*', 
    metadata: {
      parent: 'code/index.html',
      section: 'code', 
      layout: 'post.swig',
      type: 'post'
    }
  }, {
    pattern: 'portfolio/**/*', 
    metadata: {
      parent: 'portfolio/index.html',
      layout: 'post.swig',
      section: 'portfolio'
    }
  }, {
    pattern: 'portfolio/casestudy/**/*', 
    metadata: {
      type: 'casestudy',
      sortidx: 0
    }
  }, {
    pattern: 'portfolio/project/**/*', 
    metadata: {
      type: 'project',
      sortidx: 1
    }
  }, {
    pattern: 'portfolio/personal/**/*', 
    metadata: {
      type: 'personal',
      sortidx: 2
    }
  }]),

  rewrite({
    pattern: 'portfolio/**/*.html',
    filename: 'portfolio/{type}-{slug}.html'
  }),

  collections({
    posts: 'blog/posts/**/*',
    portfolio: 'portfolio/**/*',
    code: 'code/**/*'
  }),

  // rewrite({
  //   pattern: 'blog/posts/**/*.html',
  //   filename: 'blog/{path.base}'
  // }),

  metadata({
    codes: 'data/packages.json'
  }),

  pagination({
    'collections.portfolio': {
      perPage: 1000,
      layout: 'archive.swig',
      first: 'portfolio/index.html',
      path: 'portfolio/page/:num.html',
      pageMetadata: {
        title: 'Portfolio',
        perPage: 1000,
        parent: 'index.html'
      }
    },

    'collections.code': {
      perPage: 1000,
      layout: 'archive.swig',
      first: 'code/index.html',
      path: 'code/page/:num.html',
      pageMetadata: {
        title: 'Code',
        perPage: 1000,
        parent: 'index.html'
      }
    }
  }),

  paths(),
  hierarchy(),

  rewrite([{
    copy: true,
    pattern: ['**', '**/*.html'],
    filename: './__headless/{path.dir}/{path.name}.html', // copy 
  }, {
    pattern: ['**', '!**/index.html'],
    filename: '{path.dir}/{path.name}/index.html'
  }]),  

  relativity({
    depth: 0
  }),

  layouts({
    engine: 'swig',
    directory: 'source/templates/_layouts'
  }),

  inPlace('swig'),

  fileMetadata([{
    pattern: '**/*', 
    metadata: {
      layout: 'wrapper.simple.swig'
    }
  }, {
    pattern: '__headless/**/*', 
    metadata: {
      layout: 'wrapper.headless.swig'
    }
  }]),

  layouts({
    engine: 'swig',
    directory: 'source/templates/_layouts'
  }),

  extlinks({
    domain: "stumptownbear.com"
  }),

  ignore([
    'data/**/*'
  ]),

  // headingsId()
];