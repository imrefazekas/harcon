let Cerobee = require('clerobee')

let clerobee = new Cerobee( 16 )

let VALVE_SEPARATOR = '>'
let VALVE_DEFAULT = '-'
let VALVE_GLOBAL = '*'


/**
* Communication abstractation used for interaction between entities
*
* @class Communication
* @constructor
*/
function Communication (originalId, flowId, externalId, sourceDivision, source, division, event, params, callback, responder, error, response) {
	this.id = clerobee.generate()
	this.originalId = originalId || this.id
	this.flowId = flowId || clerobee.generate()

	this.externalId = externalId

	this.date = Date.now()

	this.sourceDivision = sourceDivision
	this.source = source

	this.division = division || ''

	this.event = event
	this.valve = VALVE_DEFAULT

	this.params = params || []

	this.terms = {}

	if ( responder )
		this.responder = responder
	if ( error )
		this.error = error
	if ( response )
		this.response = response

	if ( callback )
		this.callback = callback
}

let commPrototype = Communication.prototype

/**
* Check mandatory properies
*
* @method checkProperties
* @param {Array of String} names Attribute names to check
*/
commPrototype.checkProperties = function ( names ) {
	let i
	for ( i = 0; i < names.length; i += 1 )
		if ( !Object.hasOwnProperty( this, names[i] ) )
			throw new Error( 'Invalid. The property %s must be present.', names[i] )
}

/**
* Validates the message integrity
*
* @method checkValidity
*/
commPrototype.checkValidity = function () {
	this.checkProperties( ['id', 'originalId', 'flowId', 'date', 'source', 'event'] )
	if ( this.error || this.response ) {
		if ( this.error && this.response )
			throw new Error('Invalid comm: comm has both error and response attributes.')
		if ( this.id === this.originalId )
			throw new Error('Invalid comm: originalId and Id must be different in a response.')
	}
}

/**
* Creates a clone of this message object
*
* @method spread
*/
commPrototype.spread = function ( ) {
	let comm = new Communication( this.originalId, this.flowId, this.externalId, this.sourceDivision, this.source, this.division, this.event, this.params )
	comm.id = this.id
	comm.date = this.date
	comm.valve = this.valve
	comm.params = this.params.slice()
	comm.callback = null
	return comm
}

/**
* Creates a new response object
*
* @method twist
* @param {String} name Name of the responding entity
* @param {Error} error Error object if occurred
* @param {Object} response Response object if exists
*/
commPrototype.twist = function ( name, error, response ) {
	let comm = new Communication( this.id, this.flowId, this.externalId, this.sourceDivision, this.source, this.division, this.event, this.params, this.callback, name, error, response )
	return comm
}

/**
* Creates a sub-communication object within the same flow
*
* @method burst
* @param {String} name Name of the sending entity
* @param {String} event Name of the event to be sent
* @param {Array of Object} params Array of objects to be sent withing the event
* @param {Function} callback Callback function to deliver the response if exists
*/
commPrototype.burst = function ( externalID, flowID, sourceDivision, source, division, event, params, callback ) {
	let comm = new Communication( null, flowID || this.flowId, externalID || this.externalId, sourceDivision, source, division || this.division, event, params, callback )
	comm.terms = this.terms
	return comm
}

/**
* Extracts response objects from the response attribute
* @method flattenResponse
*/
commPrototype.flattenResponse = function () {
	if ( !this.response ) return null
	if ( Array.isArray( this.response ) ) {
		return this.response.map( function (comm) { return comm.response } )
	}
	else {
		return this.response.response
	}
}

/**
* Create a shallow instence of the communication object
* @method shallow
*/
commPrototype.shallow = function () {
	return {
		id: this.id,
		originalId: this.originalId,
		flowId: this.flowId,
		externalId: this.externalId,
		division: this.division,
		event: this.event,
		valve: this.valve,
		sourceDivision: this.sourceDivision,
		source: this.source
	}
}

exports.VALVE_SEPARATOR = VALVE_SEPARATOR
exports.VALVE_DEFAULT = VALVE_DEFAULT
exports.VALVE_GLOBAL = VALVE_GLOBAL
exports.setupSecurity = function (idLength) {
	clerobee = new Cerobee( idLength || 16 )
}

exports.newCommunication = function ( originalId, flowId, externalId, sourceDivision, source, division, event, params, callback, responder, error, response ) {
	let valveIndex = event.indexOf( VALVE_SEPARATOR )
	let valve = VALVE_DEFAULT
	if ( valveIndex > -1 ) {
		valve = event.substring( valveIndex + 1 )
		event = event.substring( 0, valveIndex )
	}

	let c = new Communication( originalId, flowId, externalId, sourceDivision, source, division, event, params, callback, responder, error, response )
	c.valve = valve
	return c
}

exports.importCommunication = function ( obj ) {
	let c = new Communication( obj.originalId, obj.flowId, obj.externalId, obj.sourceDivision, obj.source, obj.division, obj.event, obj.params, obj.callback, obj.responder, obj.error, obj.response )
	c.id = obj.id
	c.valve = obj.valve || VALVE_DEFAULT
	c.terms = obj.terms
	if ( obj.expose )
		c.expose = true
	return c
}

exports.narrowResponse = function ( obj ) {
	return {
		id: obj.id,
		originalId: obj.originalId,
		flowId: obj.flowId,
		externalId: obj.externalId,
		date: obj.date,
		responder: obj.responder,
		error: obj.error,
		response: obj.response
	}
}
