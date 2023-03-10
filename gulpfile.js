const gulp = require('gulp');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
const svgmin = require('gulp-svgmin');
const svg2png = require('gulp-svg2png');
const potrace = require('potrace');
const through2 = require('through2');

const fontName = 'JIIcons';

function png2svg() {
  return through2.obj(function(file, encoding, callback) {
    const bmpData = file.contents;

    potrace.trace(bmpData, function(err, svgPath) {
      if (err) {
        console.error(err);
        return callback();
      }

      file.contents = Buffer.from(svgPath, 'utf8');
      file.path = file.path.replace(/\.png$/, '.svg');

      callback(null, file);
    });
  });
}

function renameFiles() {
  return through2.obj(function(file, enc, cb) {
    // Remove the prefix from the filename
    file.path = file.path.replace(/^.*?(\d{3}_)/, '');
    this.push(file);
    cb();
  });
}

gulp.task('iconfont', function(done){
  gulp.src('src/icons/*.svg')
    .pipe(svgmin())
    .pipe(renameFiles())
    .pipe(iconfontCss({
      fontName: fontName,
      cssClass: 'ji',
      path: 'src/templates/_icons.css',
      targetPath: '../jiicons.css',
      fontPath: './fonts/'
    }))
    .pipe(iconfont({
      fontName: fontName,
      prependUnicode: true, // recommended option
      formats: ['ttf', 'eot', 'woff', 'woff2'] // default, 'woff2' and 'svg' are available
     }))
    .pipe(gulp.dest('fonts/'));
  done();
});

gulp.task('svg-to-bmp', function() {
  return gulp.src('input/*.svg')
    .pipe(svg2png())
    .pipe(png2svg())
    .pipe(gulp.dest('./output'));
});

gulp.task('move', function() {
  return gulp.src('dist/**/*')
    .pipe(gulp.dest('docs'));
});

gulp.task('default', gulp.series("iconfont", "move"));
