'use strict';

const gulp = require('gulp');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

const stylus = require('gulp-stylus');
const cssmin = require('gulp-cssmin');

const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');

const bs = require('browser-sync').create();
const notify = require('gulp-notify');

//in command line "set NODE_ENV=prod" or "set NODE_ENV=dev"
const  isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';
console.log(process.env.NODE_ENV, 'isDevelopment ==>', isDevelopment);

gulp.task('styles', () => {
	return gulp.src('app/css/main.styl', {since: gulp.lastRun('styles')})
		.pipe(sourcemaps.init())
		.pipe(stylus())
		.on('error', notify.onError((e) => {
			return {
				title: 'Stylus',
				message: e.message
			}
		}))
		.pipe(gulpIf(!isDevelopment, cssmin()))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/css'));
});

gulp.task('js', () => {
 return gulp.src('app/js/*.es6.js', {since: gulp.lastRun('js')})
 	.pipe(sourcemaps.init())
	.pipe(babel({
		presets: ['es2015']
	}))
  .on('error', notify.onError((e) => {
		return {
			title: 'Babel',
			message: e.message
		}
	}))
	.pipe(rename(path => {
		//remove ".es6" before extension
		let pattern = /\.es6/;
		path.basename = path.basename.replace(pattern, '');
	}))
	.pipe(gulpIf(!isDevelopment, uglify()))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('app/js'));
});

gulp.task('watch', () => {
	gulp.watch('app/js/*.es6.js', gulp.series('js'));
	gulp.watch('app/css/*.styl', gulp.series('styles'));
});

gulp.task('serve', () => {
	bs.init({
		server: {
			baseDir: 'app'
		}
	});

	bs.watch(['app/**/*.*', '!app/**/*.{es6.js,styl}']).on('change', bs.reload);
});

gulp.task('default', gulp.series(gulp.parallel('watch', 'serve')));
