var fs = require('fs')
var watch = require('watch')
var mkdirp = require('mkdirp')

var path = require('path')

var events = ['created', 'removed', 'changed']

module.exports = {
	name: 'Publisher',
	context: 'Inflicter',
	files: [],
	init: function (options) {
		this.configs = {}
	},
	addConfig: function ( name, config ) {
		this.configs[name] = config
	},
	scheduleFile: function ( folder, fileName ) {
		var path = folder ? folder + '/' + fileName : fileName
		if ( this.files.indexOf( path ) === -1 )
			this.files.push( path )
	},
	igniteFiles: function ( ) {
		var self = this
		self.files.forEach( function (newFile) {
			var fn = function (err, res) {
				if ( err ) {
					console.error( err, newFile )
					self.inflicterContext.logger.error( 'Failed to publish', newFile, err )
				}
			}
			if ( fs.existsSync( newFile ) ) {
				var component = require( newFile.substring( 0, newFile.length - 3 ) )
				if ( !component.adequate || component.adequate() )
					self.ignite( 'Inflicter.addicts', component, self.configs[component.name], fn )
			} else
				self.ignite( 'Inflicter.detracts', path.basename( newFile, '.js'), fn )
		} )
		self.files = []
	},
	readFiles: function ( folder, matcher, callback ) {
		var self = this
		fs.readdir(folder, function (err, files) {
			if (err)
				console.error( err )
			else {
				for (var i = 0; i < files.length; i += 1) {
					if ( matcher(files[i]) ) {
						self.scheduleFile( folder, files[i] )
					}
				}
			}
			if ( callback )
				callback()
		})
	},
	watch: function ( folder, timeout, pattern ) {
		var self = this
		var extension = '.js'
		var matcher = function (filePath) { return pattern ? pattern.test(filePath) : filePath.endsWith( extension ) }

		self.close()

		folder = path.resolve( folder )

		if ( !fs.existsSync( folder ) )
			mkdirp.sync( folder )

		self.files = []

		var isComponent = function (filePath, stat) {
			return !stat.isDirectory() && matcher(filePath)
		}
		self.readFiles( folder, matcher, function () {
			watch.createMonitor( folder, function (monitor) {
				self.monitor = monitor
				var handler = function (f, stat) {
					if ( isComponent( f, stat ) )
						self.scheduleFile( null, f )
				}
				events.forEach(function (eventName) {
					monitor.on( eventName, handler )
				})
			})
			if ( timeout && timeout > 0 )
				self.intervalObject = setInterval( function () { self.igniteFiles( ) }, timeout )
			else
				self.igniteFiles( )
		})
	},
	close: function ( callback ) {
		if ( this.monitor )
			this.monitor.stop()

		if ( this.intervalObject )
			clearInterval( this.intervalObject )

		if ( callback )
			callback( null, 'Stopped' )
	}
}
