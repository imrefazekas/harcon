var gulp = global.gulp = require('gulp'),
	plugins = global.plugins = require("gulp-load-plugins")( { scope: ['devDependencies'] } );;

gulp.task( 'eslint', function(callback) {
	return gulp.src( './lib/*.js' )
		.pipe( global.plugins.eslint() )
		.pipe( global.plugins.eslint.format() )
		.pipe( global.plugins.eslint.failOnError() );
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

gulp.task( 'default', ['eslint', 'mocha', 'doc'] );
