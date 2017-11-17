const gulp = require('gulp');
const $ = require('gulp-load-plugins')({pattern: ["*"]});
const path = require('path');
const pkg = require('./package.json');

const paths = {
  DEV: pkg.paths.DEV,
  DIST: pkg.paths.DIST,
  sprites: pkg.paths.sprites,
  DEV_HTML: path.join(pkg.paths.DEV, pkg.paths.DIR_HTML),
  DEV_CSS: path.join(pkg.paths.DEV, pkg.paths.DIR_CSS),
  DEV_SCRIPT: path.join(pkg.paths.DEV, pkg.paths.DIR_SCRIPT),
  DEV_IMAGE: path.join(pkg.paths.DEV, pkg.paths.DIR_IMAGE),
  DIST_HTML: path.join(pkg.paths.DIST, pkg.paths.DIR_HTML),
  DIST_CSS: path.join(pkg.paths.DIST, pkg.paths.DIR_CSS),
  DIST_SCRIPT: path.join(pkg.paths.DIST, pkg.paths.DIR_SCRIPT),
  DIST_IMAGE: path.join(pkg.paths.DIST, pkg.paths.DIR_IMAGE)
};

const onError = function(err) {
  console.log('An Error Has Occurred \n', err.toString());
  this.emit('end');
};

let shouldNewer = true;

gulp.task('twig', ()=>{
  return gulp
    .src('./src/twig/**/!(_*).twig')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.if(shouldNewer, $.newer({dest: paths.DEV_HTML, ext: '.html'})))
    .pipe($.twig())
    .pipe(gulp.dest(paths.DEV_HTML))
    .pipe($.browserSync.stream());
});

gulp.task('scss', ()=>{
  return gulp
    .src('./src/scss/**/!(_*).scss')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.if(shouldNewer, $.newer({dest: paths.DEV_CSS, ext: '.css'})))
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.DEV_CSS))
    .pipe($.browserSync.stream());
});

gulp.task('js', ()=>{
  return gulp
    .src('./src/script/**/!(_*).js')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.if(shouldNewer, $.newer({dest: paths.DEV_SCRIPT, ext: '.js'})))
    .pipe($.preprocess())
    .pipe(gulp.dest(paths.DEV_SCRIPT))
    .pipe($.browserSync.stream());
});

gulp.task('image', ()=>{
  return gulp
    .src('./src/image/**/*.{png,jpg,gif,jpeg,svg}')
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.DEV_IMAGE));
});

gulp.task('sprites:del-prev-files', ()=>{
  return $.del('./src/sprites/**/*.{css,scss}');
});

gulp.task('sprites', ['sprites:del-prev-files'], ()=>{
  const taskStreams = [];

  paths.sprites.forEach(sprite=>{
    const stream = gulp
      .src(sprite.src)
      .pipe($.spritesmith({
        imgName: sprite.imgName,
        cssName: sprite.cssName,
      }));

    const imgStream = stream.img
      .pipe($.vinylBuffer())
      .pipe($.imagemin())
      .pipe(gulp.dest(paths.DEV_IMAGE));

    const cssStream = stream.css
      .pipe(gulp.dest('./src/sprites'));

      taskStreams.push(imgStream, cssStream);
  });

  return $.mergeStream(...taskStreams);
});

gulp.task('bower:js', ()=>{
  return gulp
    .src('./bower.json')
    .pipe($.mainBowerFiles('**/*.js'))
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest(paths.DEV_SCRIPT));
});

gulp.task('bower:css', ()=>{
  return gulp
    .src('./bower.json')
    .pipe($.mainBowerFiles('**/*.css'))
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest(paths.DEV_CSS));
});

gulp.task('bower', ['bower:js', 'bower:css']);

gulp.task('watch', ['sprites', 'bower', 'twig', 'scss', 'js'], ()=>{
  gulp.watch("src/**/!(_*).twig", ['twig']);
  gulp.watch("src/**/!(_*).scss", ['scss']);
  gulp.watch("src/**/!(_*).js", ['js']);

  const doWithoutNewer = taskName => ()=>{
    shouldNewer = false;
    return $.runSequence(taskName, ()=>{
      shouldNewer = true;
    });
  };

  gulp.watch("src/**/_*.twig", doWithoutNewer('twig'));
  gulp.watch("src/**/_*.scss", doWithoutNewer('scss'));
  gulp.watch("src/**/_*.js", doWithoutNewer('js'));
});

gulp.task('serve', ()=>{
  $.browserSync.init({server: paths.DEV, port: 8081});
  return $.runSequence('watch');
});

gulp.task('serve-r', ()=>{
  $.browserSync.init({server: paths.DEV, port: 8081, open: false});
  return $.runSequence('watch');
});

gulp.task('dev:del', ()=>{
  return $.del(path.join(paths.DEV, '**/*'));
});

gulp.task('dev', ()=>{
  return $.runSequence('dev:del', ['bower', 'twig', 'scss', 'js']);
});

gulp.task('build:js', ['bower', 'js'], ()=>{
  return gulp
    .src(path.join(paths.DEV_SCRIPT, '**/*.js'))
    .pipe($.uglify())
    .pipe($.size({showFiles: true}))
    .pipe(gulp.dest(paths.DIST_SCRIPT))
});

gulp.task('build:css', ['scss'], ()=>{
  return gulp
    .src(path.join(paths.DEV_CSS, '**/*.css'))
    .pipe($.autoprefixer())
    .pipe($.cleanCss())
    .pipe($.size({showFiles: true}))
    .pipe(gulp.dest(paths.DIST_CSS))
});

gulp.task('build:html', ['twig'], ()=>{
  return gulp
    .src(path.join(paths.DEV_HTML, '**/*.html'))
    .pipe($.jsbeautifier())
    .pipe($.size({showFiles: true}))
    .pipe(gulp.dest(paths.DIST_HTML));
});

gulp.task('build:image', ['image'], ()=>{
  return gulp
    .src(path.join(paths.DEV_IMAGE, '**/*.{png,jpg,gif,jpeg,svg}'))
    .pipe($.size({showFiles: true}))
    .pipe(gulp.dest(paths.DIST_IMAGE));
});

gulp.task('build:del', ()=>{
  return $.del(path.join(paths.DIST, '**/*'));
});

gulp.task('build', ()=>{
  shouldNewer = false;
  return $.runSequence('build:del', ['build:html', 'build:css', 'build:js', 'build:image'], ()=>shouldNewer = true);
});

gulp.task('clean', ['sprites:del-prev-files', 'dev:del', 'build:del']);

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
