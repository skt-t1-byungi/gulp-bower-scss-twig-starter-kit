const gulp = require('gulp');
const browserSync = require('browser-sync');
const $ = require('gulp-load-plugins')({pattern: ["*"]});

const onError = function(err) {
  console.log('An Error Has Occurred \n', err.toString());
  this.emit('end');
};

gulp.task('twig', ()=>{
  return gulp
    .src('./src/twig/!(_*).twig')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.twig())
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

gulp.task('scss', ()=>{
  return gulp
    .src('./src/scss/!(_*).scss')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('js', ()=>{
  return gulp
    .src('./src/javascript/!(_*).js')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.newer({dest: './dist/assets', ext: '.js'}))
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('bower:js', ()=>{
  return gulp
    .src('./bower.json')
    .pipe($.mainBowerFiles('**/*.js'))
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest('./dist/assets'));
});

gulp.task('bower:css', ()=>{
  return gulp
    .src('./bower.json')
    .pipe($.mainBowerFiles('**/*.css'))
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest('./dist/assets'));
});

gulp.task('bower', ['bower:js', 'bower:css'])

gulp.task('dev', ['bower', 'twig', 'scss', 'js'], ()=>{
  browserSync.init({
    server: "./dist",
    port: 8081
  });

  gulp.watch("src/**/*.twig", ['twig']);
  gulp.watch("src/**/*.scss", ['scss']);
  gulp.watch("src/**/*.js", ['js']);
});

gulp.task('del', ()=>{
  return $.del('./dist/**/*');
});

gulp.task('del-maps', ()=>{
  return $.del('./dist/**/*.map');
});

gulp.task('build:js', ['bower', 'js'], ()=>{
  return gulp
    .src('./dist/assets/**/*.js', {base: './'})
    .pipe($.uglify())
    .pipe(gulp.dest('./'))
});

gulp.task('build:css', ['scss'], ()=>{
  return gulp
    .src('./dist/assets/**/*.css', {base: './'})
    .pipe($.autoprefixer())
    .pipe($.cleanCss())
    .pipe(gulp.dest('./'))
});

gulp.task('build:html', ['twig'], ()=>{
  return gulp
    .src('./dist/**/*.html', {base: './'})
    .pipe($.jsbeautifier())
    .pipe(gulp.dest('./'))
});

gulp.task('build', ['del'], ()=>{
  return $.runSequence(
    ['build:js', 'build:css', 'build:html'],
    'del-maps'
  );
});

gulp.task('bump', ()=>{
  return gulp
  .src(['./bower.json', './package.json'])
  .pipe($.bump())
  .pipe(gulp.dest('./'));
});

gulp.task('w3c', function () {
  gulp.src('./dist/*.html')
		.pipe($.w3cjs())
		.pipe($.w3cjs.reporter());
});
