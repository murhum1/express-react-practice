var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer');

var gulpSrc = 'static/src/*.js';


gulp.task("build", function() {

	var b = browserify('./static/src/index.js');
	b.transform(babelify, { presets: ['es2015', 'react'] } )
	b.bundle()
		.on('error', function(err) { console.log("ERROR:", err.message) })
		.pipe(source('./static/index.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./'))

})

gulp.task("watch", function() {
	gulp.watch(gulpSrc, ['build']);
})