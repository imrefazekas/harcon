'use strict'

let fs = require('fs')
let watch = require('watch')
let mkdirp = require('mkdirp')

let path = require('path')

let events = ['created', 'removed', 'changed']

let RESERVATION = [ 'Barrel', 'Bender', 'Blower', 'Communication', 'Fire', 'Firestarter', 'Firestormstarter', 'FireBender', 'Flamestarter', 'FlowBuilder', 'FlowReader', 'Inflicter', 'Mortar', 'Warper' ]

module.exports = {
	name: 'Mortar',
	files: [],
	init: function (options = {}, callback) {
		let self = this

		self.options = options

		if (!this.configs)
			this.configs = {}
		if (!this.globalConfig)
			this.globalConfig = {}
		this.watchMonitors = []

		let extension = '.js'
		self.matcher = self.options.matcher || ( self.options.pattern ? function (filePath) { return self.options.pattern.test(filePath) } : function (filePath) { return filePath.endsWith( extension ) } )

		if ( !fs.existsSync( self.options.folder ) )
			mkdirp.sync( self.options.folder )

		self.files = []

		let isComponent = function (filePath, stat) {
			return !stat.isDirectory() && self.matcher(filePath)
		}
		self.readFiles( self.options.folder, function (err) {
			if (err) return callback(err)

			try {
				self.igniteFiles( )

				if ( self.options.liveReload ) {
					watch.createMonitor( self.options.folder, function (monitor) {
						self.watchMonitors.push( monitor )
						let handler = function (f, stat) {
							if ( isComponent( f, stat ) )
								self.scheduleFile( null, f )
						}
						events.forEach(function (eventName) {
							monitor.on( eventName, handler )
						})
					})
					self.setInterval( function () {
						self.harconlog( null, 'Mortar is checking for entity changes', null, 'trace' )
						self.igniteFiles( )
					}, self.options.liveReloadTimeout || 5000 )
				}

				callback()
			} catch (err) { return callback(err) }
		})
	},
	addGlobalConfig: function ( config ) {
		this.globalConfig = config

		return this
	},
	addConfig: function ( name, config ) {
		this.configs[name] = config

		return this
	},
	scheduleFile: function ( folder, fileName ) {
		let fPath = folder ? folder + path.sep + fileName : fileName
		if ( this.files.indexOf( fPath ) === -1 )
			this.files.push( fPath )
		return this
	},
	igniteFiles: function ( ) {
		let self = this

		let newFiles = self.files.slice()
		self.files.length = 0
		// liveReloadTimeout: -1
		newFiles.forEach( function (newFile) {
			let fn = function (err, res) {
				if ( err )
					self.harconlog( err, newFile )
			}
			if ( fs.existsSync( newFile ) ) {
				self.harconlog( null, '(Re)New entity file', newFile, 'info' )
				try {
					let component = require( newFile.substring( 0, newFile.length - 3 ) )
					if ( !component.name )
						return self.harconlog( new Error( 'Entity has no name' ), newFile )
					if ( RESERVATION.find( (name) => { return name.toLowerCase() === component.name.toLowerCase() } ) )
						return self.harconlog( new Error( 'Entity has forbidden name' ), newFile )
					if ( component.adequate && !component.adequate() )
						return self.harconlog( new Error( 'Entity failed to be adequate' ), newFile )
					self.ignite( 'Inflicter.addicts', component, self.configs[component.name] || self.globalConfig[component.name], fn )
				} catch ( reason ) {
					console.error( reason )
					self.harconlog( reason, newFile )
				}
			} else {
				self.harconlog( null, 'Removed entity file', newFile, 'info' )
				self.ignite( 'Inflicter.detracts', path.basename( newFile, '.js'), fn )
			}
		} )
	},
	readFiles: function ( folder, callback ) {
		let self = this
		fs.readdir(folder, function (err, files) {
			if (err) return callback( err )
			else
				for (let i = 0; i < files.length; i += 1)
					if ( self.matcher(files[i]) )
						self.scheduleFile( folder, files[i] )
			callback()
		})
	},
	close: function ( callback ) {
		this.watchMonitors.forEach( function ( monitor ) {
			monitor.stop()
		} )
		this.watchMonitors.length = 0

		if ( callback )
			callback( null, 'Stopped' )
	}
}
