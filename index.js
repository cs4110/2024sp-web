var Metalsmith  = require('metalsmith');
var markdown    = require('@metalsmith/markdown');
var layouts     = require('@metalsmith/layouts');
var sass        = require('@metalsmith/sass');
var metadata    = require('@metalsmith/metadata');
var collections = require('@metalsmith/collections');
var filepath    = require('metalsmith-filepath');
var inplace     = require('@metalsmith/in-place');
var ignore      = require('metalsmith-ignore');
var define      = require('metalsmith-define');
var defaultVals = require('@metalsmith/default-values');

var url = require('url');

var serveMode = process.argv.indexOf('--serve') != -1;

var site = Metalsmith(__dirname)
  .source('./src')
  .destination('./build')
  .use(defaultVals({
    pattern: '*',
    serve: serveMode,
  }))
  .use(ignore(['**/.DS_Store']))
  .use(metadata({
    course: 'src/course.yaml',
    schedule: 'src/schedule.yaml',
    content: 'src/content.yaml',
  }))
  .use((files, metalsmith, done) => {
    // Merge schedule with content.
    var schedule = metalsmith._metadata.schedule;
    var content = metalsmith._metadata.content;
    var cont_i = 0;
    for (var sched_i = 0; sched_i < schedule.length; sched_i++) {
      var day = schedule[sched_i];
      if (!day.event && !day.canceled) {
        // Allocate a content element.
        Object.assign(day, content[cont_i]);
        cont_i++;
      }
    }
    done();
  })
  .use(collections({
    pages: {
      pattern: '*.{md,html,pug,hbs}',
      sort: 'order',
    }
  }))
  .use(define({
    resolve: url.resolve,  // Path join helper.
    relative: function (link) {
      if (link[0] === '/') {
        return link.slice(1);
      } else {
        return link;
      }
    },
  }))
  .use(inplace({
    transform: 'handlebars',
    setFilename: true,
  }))
  .use(inplace({
    transform: 'pug',
    setFilename: true,
  }))
  .use(markdown({
    smartypants: true,
  }))
  .use(sass())
  .use(filepath({
    absolute: true
  }))
  .use(layouts({
    default: 'layout.hbs',
    pattern: ['**/*.html'],
  }));

if (serveMode) {
  var serve = require('metalsmith-serve');
  var watch = require('metalsmith-watch');
  site = site
    .use(serve())
    .use(watch({
      paths: {
        "${source}/**/*": true,
        "layouts/**/*": "**/*.md",
        "${source}/**/*.yaml": "**/*",
      },
      livereload: true
    }));
}

site.build(function(err) {
  if (err) throw err;
});
