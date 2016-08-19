'use strict'

var Firestarter = require('./Firestarter')

var ignorable = [ 'init', 'close', 'ignite' ]

function isFunction (value) {
	return typeof value === 'function' || false
}
function functions (obj) {
	var res = []
	for (var m in obj)
		if ( !ignorable.includes(m) && isFunction(obj[m]) )
			res.push(m)
	return res
}

/**
* Firestormstarter is a wrapper for listener object where its functions are the listeners routed by its 'context' property
*
* @class Firestormstarter
* @constructor
*/
function Firestormstarter ( config, barrel, object, blower, logger ) {
	var self = this

	this.config = config || {}
	this.division = object.division || ''
	this.auditor = object.auditor

	this.concealed = object.concealed

	this.name = object.name || 'Unknown flames'

	this.active = true

	this.context = object.context || ''
	this.path = this.context.split( '.' )
	this.pathLength = this.path.length

	this.barrel = barrel
	this.object = object

	if (!this.object.notify) {
		this.object.notifyTos = { }
		this.object.notify = function ( state, event, callback ) {
			if ( !this.notifyTos[ state ] )
				this.notifyTos[ state ] = []
			if ( this.notifyTos[ state ].indexOf(event) === -1 )
				this.notifyTos[ state ].push( event )
			if (callback)
				callback( null, event )
		}
	}
	this.events = functions( object )

	if (!this.object.erupt)
		this.object.erupt = this.auditor ? function () {
			return self.erupt.apply( self, arguments )
		} : function () {
			var args = [ null, null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
			return self.erupt.apply( self, args )
		}
	if (!this.object.ignite)
		this.object.ignite = this.auditor ? function () {
			return self.ignite.apply( self, arguments )
		} : function () {
			var args = [ null, null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
			return self.ignite.apply( self, args )
		}

	if (!this.object.shifted)
		this.object.shifted = function () {
			var state = arguments[0]
			var target = arguments[1] || '*'
			var object = { division: self.division, context: self.context, name: self.name, state: state, target: target, notifyTos: this.notifyTos }
			return self.ignite( null, null, self.barrel.systemFirestarter.division, self.barrel.systemFirestarter.name + '.' + 'shifted', object )
		}
	if (!this.object.setTimeout) {
		this.timeoutRefs = []
		this.object.setTimeout = function ( fn, timeout ) {
			var ref = setTimeout( function () {
				if (ref) {
					var index = self.timeoutRefs.indexOf( ref )
					if (index >= -1)
						self.timeoutRefs.splice(index, 1)
				}
				fn()
			}, timeout)
			self.timeoutRefs.push( ref )
		}
	}
	if (!this.object.setInterval) {
		this.intervalRefs = []
		this.object.setInterval = function ( fn, interval ) {
			var ref = setInterval( fn, interval )
			self.intervalRefs.push( ref )
		}
	}

	this.logger = logger
	if (!this.object.harconlog)
		this.object.harconlog = logger.harconlog

	this.terms = {}

	this.blower = blower
}

Firestormstarter.prototype = new Firestarter()

var firestorm = Firestormstarter.prototype

firestorm.services = function ( ) {
	return this.events
}

firestorm.parameters = function ( service ) {
	return this.parametersOf( this.object[service] )
}

firestorm.matches = function ( comm ) {
	if ( !comm.event || !this.sameDivision( comm.division ) ) return false

	var index = comm.event.lastIndexOf( '.' )
	var prefix = comm.event.substring(0, index)
	var fnName = comm.event.substring(index + 1)

	var matches = fnName && this.events.includes( fnName )

	if ( matches && this.name !== prefix ) {
		var eventPath = index === -1 ? [] : prefix.split( '.' ), len = eventPath.length
		for (var i = 0; i < len && i < this.pathLength; i += 1)
			if ( this.path[i] !== eventPath[i] ) {
				matches = false
				break
			}
	}

	this.logger.harconlog( null, 'Matching', {events: this.events, eventName: comm.event, matches: matches}, 'silly' )

	return matches
}

firestorm.getServiceFn = function ( comm ) {
	var index = comm.event.lastIndexOf( '.' )
	var eventName = comm.event.substring( index + 1 )

	return this.object[ eventName ]
}

firestorm.innerBurn = function ( comm, callback, serviceFn, igniteFn, params ) {
	try {
		serviceFn.apply( this.object, params )
	} catch (ex) {
		callback( ex )
	}
}

firestorm.close = function ( callback ) {
	try {
		this.timeoutRefs.forEach( function (ref) {
			clearTimeout(ref)
		} )
		this.timeoutRefs.length = 0
		this.intervalRefs.forEach( function (ref) {
			clearInterval(ref)
		} )
		this.intervalRefs.length = 0
	} catch (err) { this.logger.harconlog(err) }

	if ( this.object.close )
		this.object.close( callback )
	else if (callback)
		callback( null, 'Done.' )
}

module.exports = Firestormstarter
