let fs = require('fs')
let watch = require('watch')
let mkdirp = require('mkdirp')

let path = require('path')

let { promisify } = require('util')
let readdir = promisify( fs.readdir )

let Proback = require('proback.js')

let events = ['created', 'removed', 'changed']

let RESERVATION = [ 'Barrel', 'Bender', 'Blower', 'Communication', 'Fire', 'Firestarter', 'Firestormstarter', 'FireBender', 'Flamestarter', 'FlowBuilder', 'FlowReader', 'Inflicter', 'Mortar', 'Warper' ]

module.exports = {
	name: 'Mortar',
	files: [],
	init: async function (options = {}) {
		let self = this
		self.options = options

		if (!self.configs)
			self.configs = {}
		if (!self.globalConfig)
			self.globalConfig = {}
		self.watchMonitors = []

		let extension = '.js'
		self.matcher = self.options.matcher || ( self.options.pattern ? function (filePath) { return self.options.pattern.test(filePath) } : function (filePath) { return filePath.endsWith( extension ) } )

		if ( !fs.existsSync( self.options.folder ) )
			mkdirp.sync( self.options.folder )

		self.files = []

		if ( options.waitForEntity ) {
			await Proback.until( () => {
				return !!self.inflicterContext._barrel.firestarter( options.waitForEntity )
			} )
		}
		await self.firstRead()
		return 'ok'
	},
	firstRead: async function () {
		let self = this
		let isComponent = function (filePath, stat) {
			return !stat.isDirectory() && self.matcher(filePath)
		}

		await self.readFiles( self.options.folder )

		await self.igniteFiles( )

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
			self.setInterval( async function () {
				self.harconlog( null, 'Mortar is checking for entity changes', null, 'trace' )
				await self.igniteFiles( )
			}, self.options.liveReloadTimeout || 5000 )
		}
		return 'ok'
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
	igniteFiles: async function ( ) {
		let self = this

		let newFiles = self.files.slice()
		self.files.length = 0
		// liveReloadTimeout: -1
		newFiles.forEach( async function (newFile) {
			if ( fs.existsSync( newFile ) ) {
				self.harconlog( null, '(Re)New entity file', newFile, 'info' )
				let compName = newFile.substring( 0, newFile.length - 3 )
				delete require.cache[require.resolve( compName )]
				let component = require( compName )
				if ( self.options.entityPatcher )
					self.options.entityPatcher( component )
				if ( !component.name )
					throw new Error( 'Entity has no name', newFile )
				if ( RESERVATION.find( (name) => { return name.toLowerCase() === component.name.toLowerCase() } ) )
					throw new Error( 'Entity has forbidden name', newFile )
				if ( component.adequate && !component.adequate() )
					throw new Error( 'Entity failed to be adequate', newFile )
				await self.ignite( 'Inflicter.addicts', component, self.configs[component.name] || self.globalConfig[component.name] )
			} else {
				self.harconlog( null, 'Removed entity file', newFile, 'info' )
				await self.ignite( 'Inflicter.detracts', path.basename( newFile, '.js') )
			}
		} )
		return 'ok'
	},
	readFiles: async function ( folder ) {
		let files = await readdir( folder )
		for (let i = 0; i < files.length; i += 1)
			if ( this.matcher(files[i]) )
				this.scheduleFile( folder, files[i] )
		return 'ok'
	},
	close: async function ( ) {
		this.watchMonitors.forEach( function ( monitor ) {
			monitor.stop()
		} )
		this.watchMonitors.length = 0
		return 'Stopped'
	}
}
