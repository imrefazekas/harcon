let Firestarter = require('./Firestarter')
let _ = require('isa.js')

let Assigner = require('assign.js')
let assigner = new Assigner()

let { SEPARATOR } = require('./Static')

function isLast (array, value, defaultValue) {
	if ( array.length === 0 ) return false

	let element = array.pop()
	let found = Array.isArray(value) ? value.indexOf(element) > -1 : element === value
	if ( !found )
		array.push( element )
	return found || defaultValue
}

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
	this.path = this.isString ? eventName.split( SEPARATOR ) : []
	this.pathLength = this.path.length

	this.barrel = barrel
	this.division = division || ''
	this.context = ''
	this.name = name
	this.distinguishedName = this.name
	this.event = eventName
	this.fn = fn

	this.logger = logger

	this.terms = {}

	let params = _.parameterNames( fn )
	this._serviceInfo = {
		vargs: isLast(params, '...args'),
		params: params
	}

	this.blower = blower
}

Flamestarter.prototype = new Firestarter()
let flamestarter = Flamestarter.prototype

flamestarter.services = function ( ) {
	return [ this.event ]
}

flamestarter.parameters = function ( service ) {
	return _.parameterNames( this.fn )
}

flamestarter.innerMatches = function ( eventName ) {
	if ( this.event === '*' )
		return true

	if ( this.isRegex )
		return this.event.test( eventName )

	if ( this.isString ) {
		let eventPath = eventName.split( SEPARATOR )
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

	this.logger.harconlog(null, 'Matching', {event: this.event, eventName: comm.event, matches: matches}, 'trace' )

	return matches
}

flamestarter.getServiceInfo = async function ( comm ) {
	let copy = assigner.copyObject( this._serviceInfo )
	copy.service = this.fn
	return copy
}

module.exports = Flamestarter
