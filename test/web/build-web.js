var gulp = global.gulp;

var gutil = require("gulp-util");
var webpack = require("webpack");

var path = require( 'path' );

var config = {
	cache: true,
	entry: './test/web/src/test.js',
	output: {
		path: './test/web/js',
		filename: 'test.js'
	}
};

gulp.task( 'webpack', function( callback ) {
	webpack( config, function(err, stats) {
		if(err){
			throw new gutil.PluginError("webpack", err);
		}
		gutil.log("[webpack]", stats.toString({
			// output options
		}));
		callback();
	});
});

exports.buildTasks = [ 'webpack' ];
