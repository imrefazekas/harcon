'use strict'

var Proback = require('proback.js')

var Communication = require('../lib/Communication')
var Barrel = require('../lib/Barrel')
var Blower = require('../lib/Blower')
var Firestormstarter = require('../lib/Firestormstarter')
var Flamestarter = require('../lib/Flamestarter')

require('./ES7Fixer')

var VERSION = exports.VERSION = '3.20.0'

var _ = require('isa.js')
var async = require('async')

var Assigner = require('assign.js')
var assigner = new Assigner()

function purify ( obj, config, level, path ) {
	if (!obj) return obj
	if ( _.isDate(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isString(obj) || _.isRegExp(obj) )
		return obj
	if ( _.isFunction(obj) )
		return 'fn() {}'
	if ( _.isArray(obj) ) {
		var arr = []
		obj.forEach( function ( element ) {
			if ( path.includes( element ) ) return
			path.push( element )
			arr.push( arr.length > config.arrayMaxSize ? '...' : purifyObj( element, config, level + 1, path ) )
		} )
		return arr
	}
	if ( _.isObject(obj) ) {
		var res = {}
		for (var key in obj)
			if ( key && obj[key] ) {
				if ( path.includes( obj[key] ) ) continue
				path.push( obj[key] )
				res[key] = level > config.maxLevel ? '...' : purify( obj[key], config, level + 1, path )
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

/**
* Main control point of the messaging system
*
* @class Inflicter
* @constructor
*/
function Inflicter ( options, callback ) {
	this.options = assigner.assign( {}, require('./DefaultConfig'), options || {} )
	this.options.name = this.options.name || 'Inflicter'
	this.options.context = this.options.context || this.options.name
	this.options.division = this.options.division || this.options.name

	this.options.millieu = this.options.millieu || {}

	this.name = this.options.name
	this.context = this.options.context
	this.division = this.options.division
	this.connectedDivisions = this.options.connectedDivisions || []

	var self = this

	Communication.setupSecurity( self.options.idLength || 16 )

	this.Blower = this.options.Blower || Blower

	self.purifyConfig = { arrayMaxSize: this.options.arrayMaxSize || 100, maxLevel: this.options.maxLevel || 3 }
	self.logger = this.options.logger
	self.logger.harconlog = function ( err, message, obj, level ) {
		this.log( err ? 'error' : (level || 'debug'), err ? (err.message || err.toString()) : message, assigner.assign( purifyObj(obj, self.purifyConfig, 0, []), { 'harcon': VERSION } ) )
	}.bind( self.logger )

	this.Barrel = this.options.Barrel || Barrel
	this.Firestormstarter = this.options.Firestormstarter || Firestormstarter
	this.Flamestarter = this.options.Flamestarter || Flamestarter

	this.barrel = new this.Barrel( )
	var barrelConfig = assigner.assign(
		this.options.barrel || {},
		{ name: this.name, division: this.division, logger: this.logger, connectedDivisions: this.connectedDivisions, igniteLevel: this.options.igniteLevel }
	)
	this.barrel.init( barrelConfig, function (err) {
		if ( err ) return callback(err)

		self.connectedDivisions.forEach(function ( division ) {
			self.barrel.newDivision( division, function (err) {
				if (err) self.logger.harconlog(err)
			} )
		})

		self.inflicterContext = (self.options.environment || {})
		self.inflicterContext.logger = self.logger

		self.sliceArguments = function ( ) {
			var args = new Array(arguments.length)
			for (var i = 0; i < args.length; i += 1) {
				args[i] = arguments[i]
			}
			return args
		}

		self.addicts( {
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
			vivid: function ( cb ) {
				cb( null, 'Hello.' )
			}
		}, {}, function ( err, res ) {
			self.barrel.systemFirestarter = self.systemFirestarter = self.barrel.firestarter( res.name )
			self.logger.harconlog( null, 'Harcon started.', { }, 'info' )

			if ( callback )
				callback(err, res)
		} )
	} )
}

var inflicter = Inflicter.prototype

inflicter.sendNotification = function ( payload, events ) {
	var self = this
	events.forEach( function ( event ) {
		self.ignite( event, payload, function (err) {
			if (err) self.harconlog(err)
		} )
	} )
}

inflicter.shifted = function ( component, callback ) {
	var self = this

	if ( _.isString( component.state ) )
		self.sendNotification( component.state, component.notifyTos[ component.state ] || [] )
	else Object.keys(component.state).forEach( function (key) {
		self.sendNotification( component.state[key], component.notifyTos[ key ] || [] )
	} )

	callback()
}

inflicter.setWarper = function ( division, warper ) {
	return this.barrel.setWarper( division, warper )
}

inflicter.warpers = function () {
	return this.barrel.warpers( )
}

inflicter.divisions = function ( callback ) {
	var self = this
	return new Promise( function (resolve, reject) {
		var divisions = self.barrel.divisions( )
		Proback.returner( null, divisions, callback, resolve, reject )
	} )
}

inflicter.listeners = function ( division, callback ) {
	var self = this
	if ( _.isFunction(division) ) {
		callback = division
		division = null
	}
	return new Promise( function (resolve, reject) {
		var listeners = self.barrel.listeners( division )
		Proback.returner( null, listeners, callback, resolve, reject )
	} )
}

inflicter.listener = function ( name, callback ) {
	var self = this
	return new Promise( function (resolve, reject) {
		var listener = self.barrel.listener( name )
		Proback.returner( null, listener, callback, resolve, reject )
	} )
}

inflicter.pendingComms = function (callback) {
	var self = this
	var comms = self.barrel.firestarters.map( function (fs) {
		return fs.blower
	} ). filter( function (blower) { return !!blower } ).map( function (blower) {
		return blower.comms
	})
	callback( null, comms )
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
	var self = this
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

	var self = this

	return new Promise( function (resolve, reject) {
		self.detracts( object )
		.then( function () {
			if ( object.division ) {
				if ( object.division !== self.division && !object.division.startsWith( self.division + '.' ) )
					object.division = self.division + '.' + object.division
			}
			else object.division = self.division

			object.inflicterContext = self.inflicterContext
			var blower = new self.Blower( )
			var fss = new self.Firestormstarter( self.options, self.barrel, object, blower, self.logger )
			fss.sliceArguments = self.sliceArguments

			var fns = []
			fns.push( function (cb) {
				blower.init( assigner.assign(self.options.blower || {}, { barrel: self.barrel }), function (err) {
					if ( err ) self.logger.error( err, 'Unable to init Blower' )
					cb( err )
				} )
			} )

			if ( object.init && _.isFunction( object.init ) ) {
				fns.push( function (cb) {
					var componentConfig = assigner.assign( {}, self.options.millieu, self.options[fss.name], options )
					componentConfig.inflicter = self
					try {
						if ( object.init.length === 1 ) {
							object.init( componentConfig )
							cb()
						} else
							object.init( componentConfig, cb )
					} catch ( err ) {
						self.logger.error( err, 'Unable to initialize', fss.name )
						cb( err )
					}
				} )
			}

			fns.push( function (cb) {
				return self.barrel.affiliate( fss, function (err) {
					if ( err )
						self.logger.error( err, 'Unable to affiliate entity', fss.name )
					cb( err, {
						harcon: self, name: fss.name, context: fss.context, division: fss.division, services: fss.services(), rest: !!object.rest, websocket: !!object.websocket
					} )
				} )
			} )

			async.series( fns, function (err, res) {
				if ( err ) return Proback.rejecter( err, callback, reject )
				Proback.resolver( res[ res.length - 1 ], callback, resolve )
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
	var self = this

	return new Promise( function (resolve, reject) {
		var fns = []
		var blower = new self.Blower( )
		fns.push( function (cb) {
			blower.init( self.options.blower || {}, function (err) {
				if ( err ) self.logger.error( err, 'Unable to init Blower' )
				cb( err )
			} )
		} )
		fns.push( function (cb) {
			var flamestarter = new self.Flamestarter( self.options, self.barrel, division || self.division, name, eventName, fn, blower, self.logger )
			flamestarter.sliceArguments = self.sliceArguments
			self.barrel.affiliate( flamestarter, cb )
		} )
		async.series( fns, function (err, res) {
			if ( err ) return Proback.rejecter( err, callback, reject )
			Proback.resolver( res[ res.length - 1 ], callback, resolve )
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
	var args = [ null, null, this.division ].concat( this.sliceArguments.apply( this, arguments ) )
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
	var self = this
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
