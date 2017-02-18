'use strict';

const gulp = require('gulp');
const bs = require('browser-sync').create();
// const babel = require('gulp-babel');
//del
//stylus
//minify css
//sourcemaps
//debug

//in command line "set NODE_ENV=prod" or "set NODE_ENV=dev"
const  isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';
// console.log('isDevelopment ===', isDevelopment);

// gulp.task('babel', () => {
//  gulp.src('dev/app/**/*.js', {since: gulp.lastRun('babel')})
// 	.pipe(babel({
// 		presets: ['es2015']
// 	}))
//   .on('error', (e) => {
//     console.log('[Babel]: ' + e);
//   })
// 	.pipe(gulpIf(!isDevelopment, uglify()))
// 	.pipe(gulp.dest('prod/app'));
//
// 	gulp.watch('dev/app/**/*.js', gulp.series('babel'));
// });

gulp.task('serve', () => {
	bs.init({
		server: {
			baseDir: '.'
		}
	});

	bs.watch('./**/*.*').on('change', bs.reload);
});
