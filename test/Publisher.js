'use strict'

let fs = require('fs')
let watch = require('watch')
let mkdirp = require('mkdirp')

let path = require('path')

let events = ['created', 'removed', 'changed']

module.exports = {
	name: 'Publisher',
	files: [],
	init: function (options) {
		if ( !this.configs )
			this.configs = {}

		if ( !this.globalConfig )
			this.globalConfig = {}

		this.watchMonitors = []

		return this
	},
	addGlobalConfig: function ( config ) {
		this.init()

		this.globalConfig = config

		return this
	},
	addConfig: function ( name, config ) {
		this.init()

		this.configs[name] = config

		return this
	},
	scheduleFile: function ( folder, fileName ) {
		let path = folder ? folder + '/' + fileName : fileName
		if ( this.files.indexOf( path ) === -1 )
			this.files.push( path )

		return this
	},
	igniteFiles: function ( ) {
		let self = this
		let newFiles = self.files.slice()
		self.files.length = 0
		newFiles.forEach( function (newFile) {
			let fn = function (err, res) {
				if ( err ) {
					console.error( err, newFile )
					self.inflicterContext.logger.error( 'Failed to publish', newFile, err )
				}
			}
			if ( fs.existsSync( newFile ) ) {
				console.log( newFile )
				let component = require( newFile.substring( 0, newFile.length - 3 ) )
				if ( !component.name ) return
				if ( !component.adequate || component.adequate() ) {
					self.ignite( 'Inflicter.addicts', component, self.configs[component.name] || self.globalConfig[component.name], fn )
				}
			} else
				self.ignite( 'Inflicter.detracts', path.basename( newFile, '.js'), fn )
		} )
	},
	readFiles: function ( folder, matcher, callback ) {
		let self = this
		fs.readdir(folder, function (err, files) {
			if (err) return callback( err )
			for (let i = 0; i < files.length; i += 1)
				if ( matcher(files[i]) )
					self.scheduleFile( folder, files[i] )
			if ( callback )
				callback()
		})
	},
	watch: function ( folder, pattern, timeout, callback ) {
		let self = this
		let extension = '.js'
		let matcher = function (filePath) { return pattern ? pattern.test(filePath) : filePath.endsWith( extension ) }

		self.close()

		if ( !fs.existsSync( folder ) )
			mkdirp.sync( folder )

		self.files = []

		let isComponent = function (filePath, stat) {
			return !stat.isDirectory() && matcher(filePath)
		}

		if ( timeout > 0 && !self.intervalObject )
			self.intervalObject = setInterval( function () { self.igniteFiles( ) }, timeout )

		self.readFiles( folder, matcher, function (err) {
			if (err) return callback(err)

			watch.createMonitor( folder, function (monitor) {
				self.watchMonitors.push( monitor )
				let handler = function (f, stat) {
					if ( isComponent( f, stat ) )
						self.scheduleFile( null, f )
				}
				events.forEach(function (eventName) {
					monitor.on( eventName, handler )
				})
			})

			self.igniteFiles( )

			if ( callback )
				callback()
		})
	},
	close: function ( callback ) {
		this.watchMonitors.forEach( function ( monitor ) {
			monitor.stop()
		} )
		this.watchMonitors.length = 0

		if ( this.intervalObject )
			clearInterval( this.intervalObject )

		if ( callback )
			callback( null, 'Stopped' )
	}
}
