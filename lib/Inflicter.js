var Communication = require('../lib/Communication')
var Barrel = require('../lib/Barrel')
var Blower = require('../lib/Blower')
var Firestormstarter = require('../lib/Firestormstarter')
var Flamestarter = require('../lib/Flamestarter')

require('./ES7Fixer')

var VERSION = exports.VERSION = '2.20.0'

var _ = require('isa.js')
var async = require('async')

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
			arr.push( arr.length > config.arrayMaxSize ? '...' : purify( element, config, level + 1, path ) )
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

function extend (obj, extension) {
	for (var key in extension) {
		if ( extension[key] )
			obj[key] = extension[key]
	}
	return obj
}

function DummyLogger () { }
var consoleFn = function () { console.log( arguments ) }
var dlp = DummyLogger.prototype
dlp.log = dlp.silly = dlp.debug = dlp.verbose = dlp.info = dlp.warn = consoleFn
DummyLogger.prototype.error = function () { console.error( arguments ) }


/**
* Main control point of the messaging system
*
* @class Inflicter
* @constructor
*/
function Inflicter ( options, callback ) {
	this.options = options || {}
	this.options.name = this.options.name || 'Inflicter'
	this.options.context = this.options.context || this.options.name
	this.options.division = this.options.division || this.options.name

	this.name = this.options.name
	this.context = this.options.context
	this.division = this.options.division
	this.divisionList = this.options.divisions || []

	var self = this

	this.Blower = this.options.Blower || Blower

	Communication.setupSecurity( self.options.idLength || 16 )

	self.purifyConfig = { arrayMaxSize: this.options.arrayMaxSize || 100, maxLevel: this.options.maxLevel || 3 }
	self.logger = this.options.logger || new DummyLogger()
	self.logger.harconlog = function ( err, message, obj, level ) {
		this.log( err ? 'error' : (level || 'debug'), err ? err.message : message, extend( purify(obj || {}, self.purifyConfig, 0, []), { 'harcon': VERSION } ) )
	}.bind( self.logger )

	this.Barrel = this.options.Barrel || Barrel
	this.Firestormstarter = this.options.Firestormstarter || Firestormstarter
	this.Flamestarter = this.options.Flamestarter || Flamestarter

	this.barrel = new this.Barrel( )
	var barrelConfig = extend(
		this.options.barrel || {},
		{ name: this.name, division: this.division, logger: this.logger }
	)
	this.barrel.init( barrelConfig, function (err) {
		if ( err ) return callback(err)

		self.divisionList.forEach(function ( division ) {
			self.barrel.addDivision( division )
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

inflicter.shifted = function ( component, callback ) {
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
		callback && callback( null, divisions )
		resolve( divisions )
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
		callback && callback( null, listeners )
		resolve( listeners )
	} )
}

inflicter.listener = function ( name, callback ) {
	var self = this
	return new Promise( function (resolve, reject) {
		var listener = self.barrel.listener( name )
		callback && callback( null, listener )
		resolve( listener )
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
	var self = this
	return new Promise( function (resolve, reject) {
		self.barrel.castOf( object.name, function ( err, res ) {
			callback && callback( err, res )
			if ( err ) reject( err )
			else resolve( res )
		} )
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
		function rejecter (err) {
			if ( callback )
				callback(err)
			reject( err )
		}
		function resolver (res) {
			if ( callback )
				callback( null, res )
			resolve( res )
		}

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
				blower.init( extend(self.options.blower || {}, {barrel: self.barrel}), function (err) {
					if ( err ) self.logger.error( err, 'Unable to init Blower' )
					cb( err )
				} )
			} )

			if ( object.init && _.isFunction( object.init ) ) {
				fns.push( function (cb) {
					var componentConfig = options || self.options[fss.name] || self.options.fireContext || {}
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
				if ( err ) return rejecter( err )
				resolver( res[ res.length - 1 ] )
			} )
		} )
		.catch( function (reason) {
			rejecter( reason )
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
		function rejecter (err) {
			if ( callback )
				callback(err)
			reject( err )
		}
		function resolver (res) {
			if ( callback )
				callback( null, res )
			resolve( res )
		}

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
			if ( err ) return rejecter( err )
			resolver( res[ res.length - 1 ] )
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
	var args = [ null, this.division ].concat( this.sliceArguments.apply( this, arguments ) )
	return this.systemFirestarter.ignite.apply( this.systemFirestarter, args )
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
		self.barrel.close( function (err, res) {
			if ( err ) {
				if ( callback )
					callback(err)
				return reject( err )
			}
			if ( callback )
				callback( null, res )
			resolve( res )
		} )
	} )
}


Inflicter.Communication = Communication
Inflicter.Barrel = Barrel
Inflicter.Blower = Blower
Inflicter.Firestormstarter = Firestormstarter
Inflicter.Flamestarter = Flamestarter


module.exports = Inflicter
