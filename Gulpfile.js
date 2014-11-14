var gulp = global.gulp = require('gulp'),
	plugins = global.plugins = require("gulp-load-plugins")( { scope: ['devDependencies'] } );;

gulp.task( 'jshint', function(callback) {
	return gulp.src( './lib/*.js' )
		.pipe( global.plugins.jshint() )
		.pipe( global.plugins.jshint.reporter('default' ));
} );

gulp.task( 'mocha', function(callback) {
	return gulp.src( './test/mochaTest.js' ).pipe( global.plugins.mocha({reporter: 'nyan'}) );
} );

gulp.task( 'doc', function(callback) {
	var doccoOptions;
	return 	gulp.src("./test/mochaTest.js")
			.pipe( global.plugins.docco( doccoOptions ) )
			.pipe( gulp.dest('./doc') );
} );

var web = require('./test/web/build-web' );
gulp.task( 'build-web-test', web.buildTasks );

gulp.task( 'default', ['jshint', 'mocha', 'doc'] );
