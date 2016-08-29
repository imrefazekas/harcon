let Firestarter = require('./Firestarter')
let _ = require('isa.js')

/**
* Flamestarter is a wrapper for listeners defined as pure functions
*
* @class Flamestarter
* @constructor
*/
function Flamestarter ( config, barrel, division, name, eventName, fn, blower, logger ) {
	this.isRegex = _.isRegExp( eventName )
	this.isString = _.isString( eventName )

	this.active = true

	this.config = config || {}
	this.path = this.isString ? eventName.split( '.' ) : []
	this.pathLength = this.path.length

	this.barrel = barrel
	this.division = division || ''
	this.context = ''
	this.name = name
	this.event = eventName
	this.fn = fn

	this.logger = logger

	this.terms = {}

	this.blower = blower
}

Flamestarter.prototype = new Firestarter()
let flamestarter = Flamestarter.prototype

flamestarter.services = function ( ) {
	return [ this.event ]
}

flamestarter.parameters = function ( service ) {
	return this.parametersOf( this.fn )
}

flamestarter.innerMatches = function ( eventName ) {
	if ( this.event === '*' )
		return true

	if ( this.isRegex )
		return this.event.test( eventName )

	if ( this.isString ) {
		let eventPath = eventName.split( '.' )
		for (let i = 0, len = eventPath.length; i < len && i < this.pathLength; i += 1) {
			if ( this.path[i] === '*' )
				return true
			if ( this.path[i] !== eventPath[i] )
				return false
		}
		return true
	}
	return false
}

flamestarter.matches = function ( comm ) {
	if ( !this.sameDivision( comm.division ) ) return false

	let matches = this.innerMatches( comm.event )

	this.logger.harconlog(null, 'Matching', {event: this.event, eventName: comm.event, matches: matches}, 'silly' )

	return matches
}

flamestarter.getServiceFn = function ( comm ) {
	return this.fn
}

flamestarter.innerBurn = function ( comm, callback, serviceFn, igniteFn, params ) {
	try {
		serviceFn.apply( { comm: comm, ignite: igniteFn }, params )
	} catch (ex) {
		callback( ex )
	}
}

module.exports = Flamestarter
