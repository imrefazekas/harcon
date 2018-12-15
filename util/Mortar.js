let fs = require('fs')
let mkdirp = require('mkdirp')

let path = require('path')

let { promisify } = require('util')
let readdir = promisify( fs.readdir )

let RESERVATION = [ 'Barrel', 'Bender', 'Blower', 'Communication', 'Fire', 'Firestarter', 'Firestormstarter', 'FireBender', 'Flamestarter', 'FlowBuilder', 'FlowReader', 'Inflicter', 'Mortar', 'Warper' ]

let Assigner = require('assign.js')
let assigner = new Assigner()

let { OK } = require('../lib/Static')

function Mortar () {
	this.name = 'Mortar'
	this.systemEntity = true
	this.files = []
}

let mortar = Mortar.prototype

let globalConfig = {}

mortar.init = async function (options = {}) {
	let self = this
	self.options = options

	if (!self.configs)
		self.configs = {}
	self.watchMonitors = []

	let extension = '.js'
	self.matcher = self.options.matcher || ( self.options.pattern ? function (filePath) { return self.options.pattern.test(filePath) } : function (filePath) { return filePath.endsWith( extension ) } )

	if ( !fs.existsSync( self.options.folder ) )
		mkdirp.sync( self.options.folder )

	self.files = []

	await self.firstRead()
	return OK
}
mortar.firstRead = async function () {
	let self = this

	if ( self.options.waitFor && self.options.waitFor.entity && !self.inflicterContext._barrel.firestarter( self.options.waitFor.entity ) ) {
		return setTimeout( () => {
			self.firstRead().then( () => {} ).catch( (reason) => { self.harconlog(reason) } )
		}, self.options.waitFor.timeout || 1000 )
	}

	let isComponent = function (filePath) {
		return self.matcher(filePath)
	}

	await self.readFiles( self.options.folder )

	await self.igniteFiles( )

	if ( self.options.liveReload ) {
		self.watchMonitors.push(
			fs.watch( self.options.folder, {
				persistent: true,
				recursive: false,
				encoding: 'utf8'
			}, (eventType, filename) => {
				let filePath = path.resolve( self.options.folder, filename )
				fs.exists( filePath, (exists) => {
					if ( !exists || !isComponent( filePath ) ) return
					self.scheduleFile( null, filePath )
				} )
			} )
		)

		self.setInterval( function () {
			self.harconlog( null, 'Mortar is checking for entity changes', null, 'trace' )
			self.igniteFiles( ).then( () => {} )
				.catch( self.harconlog )
		}, self.options.liveReloadTimeout || 5000 )
	}
	return OK
}
mortar.addConfig = function ( name, config ) {
	this.configs[name] = config

	return this
}
mortar.scheduleFile = function ( folder, fileName ) {
	let fPath = folder ? folder + path.sep + fileName : fileName
	if ( this.files.indexOf( fPath ) === -1 )
		this.files.push( fPath )
	return this
}
mortar.igniteFiles = async function ( ) {
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
			try {
				await self.request( 'Inflicter.deploy', component, assigner.assign( {}, globalConfig[component.name], self.configs[component.name] ) )
			} catch (err) {
				self.harconlog( err )
			}
		} else {
			self.harconlog( null, 'Removed entity file', newFile, 'info' )
			await self.request( 'Inflicter.conclude', path.basename( newFile, '.js') )
		}
	} )
	return OK
}
mortar.readFiles = async function ( folder ) {
	let files = await readdir( folder )
	for (let i = 0; i < files.length; i += 1)
		if ( this.matcher(files[i]) )
			this.scheduleFile( folder, files[i] )
	return OK
}
mortar.close = async function ( ) {
	this.watchMonitors.forEach( function ( watcher ) {
		watcher.close()
	} )
	this.watchMonitors.length = 0
	return 'Stopped'
}

module.exports = {
	addGlobalConfig: function ( config ) {
		globalConfig = config
	},
	newMortar: function () {
		return new Mortar()
	}
}
