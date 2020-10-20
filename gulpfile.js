'use strict';

// IMPORT
// ----------------------------------------------------------------------------
const gulp = require('gulp');
const gulpTS = require('gulp-typescript');
const gulpTSLint = require('gulp-tslint').default;
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpNodemon = require('gulp-nodemon');
const tsLint = require('tslint');
const del = require('del');
const path = require('path');

// PREPARE PROJECT
// ----------------------------------------------------------------------------
const project = gulpTS.createProject('tsconfig.json');
const typeCheck = tsLint.Linter.createProgram('tsconfig.json');

// FUNCTIONS (StartBuild Build)
// ----------------------------------------------------------------------------
function startBuild() {
  // => Delete old files
  del.sync(['./dist/**/*.*', '!./dist/**/*.db']);
  // => Copy files
  gulp.src('./resources/**/*').pipe(gulp.dest('dist/'));
  //=> Compile TS files
  const tsCompile = gulp.src('./src/**/*.ts').pipe(gulpSourcemaps.init()).pipe(project());
  return tsCompile.js
    .pipe(
      gulpSourcemaps.write({
        sourceRoot: (file) => path.relative(path.join(file.cwd, file.path), file.base),
      })
    )
    .pipe(gulp.dest('dist/'));
}
// FUNCTIONS (StartWatch Watch)
// ----------------------------------------------------------------------------
function startWatch() {
  gulp.watch('./src/**/*.ts').on('change', function (path, stats) {
    console.log(path + ' changed!');
    startBuild();
  });
}
// FUNCTIONS (StartNodemon Start)
// ----------------------------------------------------------------------------
function startNodemon() {
  return gulpNodemon({
    script: './dist/Main.js',
    watch: './dist/Main.js',
  });
}

// LINT TASK
// ----------------------------------------------------------------------------
gulp.task('lint', function () {
  return gulp
    .src('./src/**/*.ts')
    .pipe(
      gulpTSLint({
        configuration: 'tslint.json',
        formatter: 'verbose',
        program: typeCheck,
      })
    )
    .pipe(gulpTSLint.report());
});

// BUILD
// ----------------------------------------------------------------------------
gulp.task(
  'build',
  gulp.series('lint', startBuild)
);

// WATCH
// ----------------------------------------------------------------------------
gulp.task(
  'watch',
  gulp.parallel('build', startWatch)
);

// START
// ----------------------------------------------------------------------------
gulp.task(
  'start',
  gulp.series('build', startNodemon)
);

// SERVE
// ----------------------------------------------------------------------------
gulp.task(
  'serve',
  gulp.series('build', gulp.parallel(startWatch, startNodemon))
);
