'use strict'

let Proback = require('proback.js')
const sequential = Proback.syncAll

let Communication = require('../lib/Communication')
let Barrel = require('../lib/Barrel')
let Blower = require('../lib/Blower')
let Firestormstarter = require('../lib/Firestormstarter')
let Flamestarter = require('../lib/Flamestarter')

let fs = require('fs')
let path = require('path')

let VERSION = exports.VERSION = JSON.parse( fs.readFileSync( path.join(__dirname, '..', 'package.json'), 'utf8' ) ).version

let _ = require('isa.js')

let Assigner = require('assign.js')
let assigner = new Assigner().primitives(['logger'])

function purify ( obj, config, level, path ) {
	if (!obj) return obj
	if ( _.isDate(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isString(obj) || _.isRegExp(obj) )
		return obj
	if ( _.isFunction(obj) )
		return null
	if ( _.isArray(obj) ) {
		let arr = []
		obj.forEach( function ( element ) {
			if ( path.includes( element ) ) return
			path.push( element )
			arr.push( arr.length > config.arrayMaxSize ? '...' : purifyObj( element, config, level + 1, path ) )
		} )
		return arr
	}
	if ( _.isObject(obj) ) {
		let res = {}
		for (let key in obj)
			if ( key && obj[key] ) {
				if ( path.includes( obj[key] ) ) continue
				path.push( obj[key] )
				let resObj = level > config.maxLevel ? '...' : purify( obj[key], config, level + 1, path )
				if (resObj)
					res[key] = resObj
			}
		return res
	}
	return '...'
}

function purifyObj ( obj, config, level, path ) {
	if (!obj) return {}
	if ( _.isDate(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isString(obj) || _.isRegExp(obj) || _.isFunction(obj) || _.isArray(obj) )
		return { message: obj }
	if ( _.isObject(obj) )
		return purify( obj, config, level, path )
	return {}
}

let PROJECT_ROOT = path.join(__dirname, '..')
function getStackInfo (level, err) {
	if (!err) return {}

	err = err.stack ? err : new Error( err )

	let stackIndex = level || 1
	let stacklist = err.stack.split('\n')
	// let stacklist = (new Error()).stack.split('\n').slice(3)

	let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
	let stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

	let s = stacklist[stackIndex] || stacklist[0]
	let sp = stackReg.exec(s) || stackReg2.exec(s)

	if (sp && sp.length === 5) {
		return { callstack: {
			method: sp[1],
			relativePath: path.relative(PROJECT_ROOT, sp[2]),
			line: sp[3],
			pos: sp[4],
			file: path.basename(sp[2]),
			stack: stacklist.join('\n')
		} }
	}
}

/**
* Main control point of the messaging system
*
* @class Inflicter
* @constructor
*/
function Inflicter ( options, callback ) {
	let self = this
	return new Promise( (resolve, reject) => {
		self.options = assigner.assign( {}, require('./DefaultConfig'), options || {} )

		self.setupInflicter()

		self.setupBarrel()

		if (!self.options.bender.privileged.includes('FireBender'))
			self.options.bender.privileged.push('FireBender')
		if (!self.options.bender.privileged.includes('Inflicter'))
			self.options.bender.privileged.push('Inflicter')

		let barrelConfig = assigner.assign(
			self.options.barrel || {},
			{ name: self.name, division: self.division, logger: self.logger, connectedDivisions: self.connectedDivisions, igniteLevel: self.options.igniteLevel, seals: self.options.seals, unfoldAnswer: self.options.unfoldAnswer }
		)

		self.barrel.init( barrelConfig )
		.then( function () {
			self.connectedDivisions.forEach(function ( division ) {
				self.barrel.newDivision( division, function (err) {
					if (err) self.logger.harconlog(err)
				} )
			})

			self.inflicterContext = (self.options.environment || {})
			self.inflicterContext.logger = self.logger

			return self
		} )
		.then( function () {
			self.inflicterEntity = {
				name: 'Inflicter',
				options: self.options,
				Barrel: self.Barrel,
				Blower: self.Blower,
				Firestormstarter: self.Firestormstarter,
				Flamestarter: self.Flamestarter,
				barrel: self.barrel,
				logger: self.logger,
				division: self.division,
				context: self.context,
				detracts: self.detracts,
				addicts: self.addicts,
				addict: self.addict,
				sliceArguments: self.sliceArguments,
				sendNotification: self.sendNotification,
				shifted: self.shifted,
				divisions: self.divisions,
				entities: self.entities,
				vivid: function ( cb ) {
					cb( null, 'Hello.' )
				}
			}
			return self
		} )
		.then( () => {
			return self.addicts( self.inflicterEntity, {} )
		} )
		.then( function (res) {
			self.barrel.systemFirestarter = self.systemFirestarter = self.barrel.firestarter( self.inflicterEntity.name )
			self.logger.harconlog( null, 'Harcon started.', { }, 'info' )

			if (self.options.bender.enabled && self.options.bender.entity) {
				self.addicts( require( self.options.bender.entity ), { unfoldAnswer: self.options.unfoldAnswer, igniteTermination: self.options.bender.igniteTermination }, (err) => {
					if (err) self.logger.harconlog( err )
				} )
			}

			if (self.options.mortar.enabled) {
				self.addicts( require( '../util/Mortar' ), self.options.mortar, (err) => {
					if (err) self.logger.harconlog( err )
				} )
			}

			return Proback.resolver( self, callback, resolve )
		} )
		.catch(function (reason) {
			if (callback) callback(reason)
			reject(reason)
		} )
	} )
}

let inflicter = Inflicter.prototype

inflicter.setupInflicter = function ( ) {
	let self = this

	self.options.name = self.options.name || 'Inflicter'
	self.options.context = self.options.context || self.options.name
	self.options.division = self.options.division || self.options.name

	self.options.millieu = self.options.millieu || {}

	self.name = self.options.name
	self.context = self.options.context
	self.division = self.options.division
	self.connectedDivisions = self.options.connectedDivisions || []

	Communication.setupSecurity( self.options.idLength || 16 )

	self.sliceArguments = function ( ) {
		let args = new Array(arguments.length)
		for (let i = 0; i < args.length; i += 1) {
			args[i] = arguments[i]
		}
		return args
	}
}

inflicter.setupBarrel = function ( ) {
	let self = this

	self.Blower = self.options.Blower || Blower

	self.purifyConfig = { arrayMaxSize: self.options.arrayMaxSize || 100, maxLevel: self.options.maxLevel || 3 }
	self.logger = self.options.logger

	if ( self.options.callStackExtension.enabled )
		self.logger.harconlog = function ( err, message, obj, level ) {
			this.log( err ? 'error' : (level || 'debug'), err ? (err.message || err.toString()) : message, assigner.assign( purifyObj(obj, self.purifyConfig, 0, []), { 'harcon': VERSION }, getStackInfo( self.options.callStackExtension.level, err ) ) )
		}.bind( self.logger )
	else
		self.logger.harconlog = function ( err, message, obj, level ) {
			this.log( err ? 'error' : (level || 'debug'), err ? (err.message || err.toString()) : message, assigner.assign( purifyObj(obj, self.purifyConfig, 0, []), { 'harcon': VERSION } ) )
		}.bind( self.logger )

	self.Barrel = self.options.Barrel || Barrel
	self.Firestormstarter = self.options.Firestormstarter || Firestormstarter
	self.Flamestarter = self.options.Flamestarter || Flamestarter

	self.barrel = new self.Barrel( )
}

inflicter.sendNotification = function ( payload, events ) {
	let self = this
	events.forEach( function ( event ) {
		self.ignite( event, payload, function (err) {
			if (err) self.harconlog(err)
		} )
	} )
}

inflicter.shifted = function ( component, callback ) {
	let self = this

	return new Promise( (resolve, reject) => {
		if ( _.isString( component.state ) )
			self.sendNotification( component.state, component.notifyTos[ component.state ] || [] )
		else Object.keys(component.state).forEach( function (key) {
			self.sendNotification( component.state[key], component.notifyTos[ key ] || [] )
		} )

		if (callback) callback(null, 'ok')
		resolve('ok')
	} )
}

inflicter.setWarper = function ( division, warper ) {
	return this.barrel.setWarper( division, warper )
}

inflicter.warpers = function () {
	return this.barrel.warpers( )
}

inflicter.divisions = function ( callback ) {
	let self = this
	return new Promise( function (resolve, reject) {
		let divisions = self.barrel.divisions( )
		Proback.returner( null, divisions, callback, resolve, reject )
	} )
}

inflicter.entities = function ( division, callback ) {
	let self = this
	return new Promise( function (resolve, reject) {
		if ( _.isFunction(division) ) {
			callback = division
			division = null
		}
		let entities = self.barrel.entities( division )
		Proback.returner( null, entities, callback, resolve, reject )
	} )
}

inflicter.listener = function ( name, callback ) {
	let self = this
	return new Promise( function (resolve, reject) {
		let listener = self.barrel.listener( name )
		Proback.returner( null, listener, callback, resolve, reject )
	} )
}

inflicter.pendingComms = function (callback) {
	let self = this
	return new Promise( function (resolve, reject) {
		let comms = self.barrel.firestarters.map( function (fs) {
			return fs.blower
		} ). filter( function (blower) { return !!blower } ).map( function (blower) {
			return blower.comms
		})
		Proback.resolver( comms, callback, resolve )
	} )
}

/**
* Activates a component
*
* @method activity
* @param {String} name The name of the component to be activated
*/
inflicter.activate = function ( name ) {
	return this.barrel.activity( name, true )
}

/**
* Deactivates a component
*
* @method activity
* @param {String} name The name of the component to be activated
*/
inflicter.deactivate = function ( name ) {
	return this.barrel.activity( name, false )
}

/**
* Unregisters an object-type lister
*
* @method detracts
* @param {Object} object Object
*/
inflicter.detracts = function ( object, callback ) {
	let self = this
	return new Promise( function (resolve, reject) {
		self.barrel.castOf( object.name, Proback.handler( callback, resolve, reject ) )
	} )
}

/**
* Registers a new object-type lister
*
* @method addicts
* @param {Object} object Object
*/
inflicter.addicts = function ( object, options, callback ) {
	if ( _.isFunction( options ) ) {
		callback = options
		options = null
	}

	let self = this

	return new Promise( function (resolve, reject) {
		self.detracts( object )
		.then( function () {
			if (!self.options.suppressing && object.division ) {
				if ( object.division !== self.division && !object.division.startsWith( self.division + '.' ) )
					object.division = self.division + '.' + object.division
			}
			else object.division = self.division

			object.inflicterContext = self.inflicterContext
			let blower = new self.Blower( )
			let fss = new self.Firestormstarter( self.options, self.barrel, object, blower, self.logger )
			fss.sliceArguments = self.sliceArguments

			let fns = []

			fns.push( function (previousResponse, responses, count) {
				return new Promise( (resolve, reject) => {
					blower.init( assigner.assign(self.options.blower || {}, { barrel: self.barrel }), Proback.handler(null, resolve, reject) )
				} )
			} )

			if ( object.init && _.isFunction( object.init ) ) {
				fns.push( function (previousResponse, responses, count) {
					return new Promise( (resolve, reject) => {
						let componentConfig = assigner.assign( {}, process.env, self.options.millieu, self.options[fss.name], options )
						componentConfig.inflicter = self
						try {
							if ( object.init.length === 1 ) {
								object.init( componentConfig )
								resolve()
							} else
								object.init( componentConfig, Proback.handler(null, resolve, reject) )
						} catch ( err ) {
							self.logger.error( err, 'Unable to initialize', fss.name )
							reject( err )
						}
					} )
				} )
			}

			fns.push( function (previousResponse, responses, count) {
				return new Promise( (resolve, reject) => {
					self.barrel.affiliate( fss, (err) => {
						if ( err ) {
							self.logger.error( err, 'Unable to affiliate entity', fss.name )
							reject(err)
						}
						else resolve( {
							harcon: self, name: fss.name, context: fss.context, division: fss.division, services: fss.services(), rest: !!object.rest, websocket: !!object.websocket
						} )
					} )
				} )
			} )

			sequential(fns)
			.then( (res) => {
				Proback.resolver( res[ res.length - 1 ], callback, resolve )
			} )
			.catch( (reason) => {
				Proback.rejecter( reason, callback, reject )
			} )
		} )
		.catch( function (reason) {
			Proback.rejecter( reason, callback, reject )
		} )
	})
}

/**
* Registers a new function-type lister
*
* @method addict
* @param {String} division, mandatory
* @param {String} name Name of the listener - needed for logging
* @param {String} eventName Eventname subscription
* @param {Function} fn Listener function
*/
inflicter.addict = function ( division, name, eventName, fn, callback ) {
	let self = this

	return new Promise( function (resolve, reject) {
		let fns = []
		let blower = new self.Blower( )

		fns.push( function (previousResponse, responses, count) {
			return new Promise( (resolve, reject) => {
				blower.init( self.options.blower || {}, Proback.handler(null, resolve, reject) )
			} )
		} )
		fns.push( function (previousResponse, responses, count) {
			return new Promise( (resolve, reject) => {
				let flamestarter = new self.Flamestarter( self.options, self.barrel, division || self.division, name, eventName, fn, blower, self.logger )
				flamestarter.sliceArguments = self.sliceArguments
				self.barrel.affiliate( flamestarter, Proback.handler(null, resolve, reject) )
			} )
		} )

		sequential(fns)
		.then( (res) => {
			Proback.resolver( res[ res.length - 1 ], callback, resolve )
		} )
		.catch( (reason) => {
			Proback.rejecter( reason, callback, reject )
		} )
	} )
}

/**
* Creates a new event-flow by a starting-event without external ID or division
* The parameter list is a vararg, see parameters below
*
* @method simpleIgnite
* @param {String} event Name of the even to emit, mandatory
* @param {String} params A vararg element possessing the objects to be sent with the message. Can be empty
* @param {Function} callback Mandatory callback function as last element.
*/
inflicter.simpleIgnite = function ( ) {
	let args = [ null, null, this.division ].concat( this.sliceArguments.apply( this, arguments ) )
	return this.systemFirestarter.ignite.apply( this.systemFirestarter, args )
}

/**
* Creates a new event-flow by a starting-event.
* The parameter list is a vararg, see parameters below
*
* @method erupt
* @param {String} external ID, mandatory, can be null
* @param {String} division, mandatory
* @param {String} event Name of the even to emit, mandatory
* @param {String} params A vararg element possessing the objects to be sent with the message. Can be empty
*/
inflicter.erupt = function ( ) {
	return this.systemFirestarter.erupt.apply( this.systemFirestarter, arguments )
}


/**
* Creates a new event-flow by a starting-event.
* The parameter list is a vararg, see parameters below
*
* @method ignite
* @param {String} external ID, mandatory, can be null
* @param {String} division, mandatory
* @param {String} event Name of the even to emit, mandatory
* @param {String} params A vararg element possessing the objects to be sent with the message. Can be empty
* @param {Function} callback Mandatory callback function as last element.
*/
inflicter.ignite = function ( ) {
	return this.systemFirestarter.ignite.apply( this.systemFirestarter, arguments )
}

/**
* Notifies the harcon event-system to close all open connection
*
* @method close
*/
inflicter.close = function ( callback ) {
	let self = this
	return new Promise( function (resolve, reject) {
		self.barrel.close( Proback.handler( callback, resolve, reject ) )
	} )
}


Inflicter.Communication = Communication
Inflicter.Barrel = Barrel
Inflicter.Blower = Blower
Inflicter.Firestormstarter = Firestormstarter
Inflicter.Flamestarter = Flamestarter


module.exports = Inflicter
