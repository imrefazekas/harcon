var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')( { scope: ['devDependencies'] } )

gulp.task( 'eslint', function (callback) {
	return gulp.src( './lib/**/*.js' )
		.pipe( plugins.eslint() )
		.pipe( plugins.eslint.format() )
		.pipe( plugins.eslint.failOnError() )
} )

gulp.task( 'mocha', function (callback) {
	return gulp.src( [ './test/harcon.mocha.js', './test/harcon-bender.mocha.js' ] ).pipe( plugins.mocha({reporter: 'nyan'}) )
} )

gulp.task( 'doc', function (callback) {
	var doccoOptions
	return 	gulp.src('./test/*.mocha.js')
			.pipe( plugins.docco( doccoOptions ) )
			.pipe( gulp.dest('./doc') )
} )

gulp.task( 'default', gulp.series('eslint', 'mocha', 'doc') )
