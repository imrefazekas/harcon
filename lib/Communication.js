let Cerobee = require('clerobee')
let clerobee = new Cerobee( 16 )

let VALVE_SEPARATOR = '|'
let VALVE_DEFAULT = '-'
let VALVE_GLOBAL = '*'

const _ = require( 'isa.js' )

/**
* Communication abstractation used for interaction between entities
*
* @class Communication
* @constructor
*/
function Communication (mode, originalId, flowId, externalId, sourceDivision, source, sourceNodeID, division, event, params, callback, responder, responderNodeID, error, response) {
	this.mode = mode || exports.MODE_REQUEST

	this.id = clerobee.generate()
	this.originalId = originalId || this.id
	this.flowId = flowId || clerobee.generate()

	this.externalId = externalId

	this.creationDate = Date.now()
	this.arrivalDate = -1
	this.dispatchDate = -1

	this.sourceDivision = sourceDivision
	this.source = source
	this.sourceNodeID = sourceNodeID

	this.division = division || ''

	this.event = event
	this.valve = VALVE_DEFAULT

	this.params = params || []

	this.terms = {}

	if ( responder )
		this.responder = responder
	if ( responderNodeID )
		this.responderNodeID = responderNodeID
	if ( error )
		this.error = error
	if ( typeof (response) !== 'undefined' && response !== null )
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
			throw new Error('Invalid comm: comm has both error and response attributes')
		if ( this.id === this.originalId )
			throw new Error('Invalid comm: originalId and Id must be different in a response')
	}
}

/**
* Creates a clone of this message object
*
* @method spread
*/
commPrototype.spread = function ( ) {
	let comm = new Communication( this.mode, this.originalId, this.flowId, this.externalId, this.sourceDivision, this.source, this.sourceNodeID, this.division, this.event, this.params )
	comm.id = this.id

	comm.creationDate = this.creationDate
	comm.arrivalDate = this.arrivalDate
	comm.dispatchDate = this.dispatchDate

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
commPrototype.twist = function ( name, responderNodeID, error, response ) {
	let comm = new Communication( this.mode, this.id, this.flowId, this.externalId, this.sourceDivision, this.source, this.sourceNodeID, this.division, this.event, this.params, this.callback, name, responderNodeID, error, response )
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
commPrototype.burst = function ( externalID, flowID, sourceDivision, source, sourceNodeID, division, event, params, callback ) {
	let comm = new Communication( this.mode, null, flowID || this.flowId, externalID || this.externalId, sourceDivision, source, sourceNodeID, division || this.division, event, params, callback )
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
commPrototype.shallow = function ( error, responseComms ) {
	let res = {
		id: this.id,
		originalId: this.originalId,
		flowId: this.flowId,
		externalId: this.externalId,

		creationDate: this.creationDate,
		arrivalDate: this.arrivalDate,
		dispatchDate: this.dispatchDate,

		sourceDivision: this.sourceDivision,
		source: this.source,
		sourceNodeID: this.sourceNodeID,
		division: this.division,
		event: this.event,
		valve: this.valve,
		responder: this.responder,
		responderNodeID: this.responderNodeID
	}
	if (error || responseComms) {
		res.error = error
		res.responses = responseComms.map( (response) => { return response.shallow() } )
	}
	return res
}

exports.MODE_REQUEST = 0
exports.MODE_INFORM = 1
exports.MODE_DELEGATE = 2

exports.VALVE_SEPARATOR = VALVE_SEPARATOR
exports.VALVE_DEFAULT = VALVE_DEFAULT
exports.VALVE_GLOBAL = VALVE_GLOBAL
exports.setupSecurity = function (idLength) {
	clerobee = new Cerobee( idLength || 16 )
}

let commKeys = Object.keys( new Communication( 'mode', 'originalId', 'flowId', 'externalId', 'sourceDivision', 'source', 'sourceNodeID', 'division', 'event', 'params', 'callback', 'responder', 'responderNodeID', 'error', 'response' ) ).filter( (key) => { return key !== 'callback' } )
let ignoreKeys = [ 'params' ]
exports.clean = function ( comm, ignore = false ) {
	return _.pick( comm, commKeys, ignore ? ignoreKeys : [] )
}

exports.newCommunication = function ( mode, originalId, flowId, externalId, sourceDivision, source, sourceNodeID, division, event, params, callback, responder, responderNodeID, error, response ) {
	let valveIndex = event.indexOf( VALVE_SEPARATOR )
	let valve = VALVE_DEFAULT
	if ( valveIndex > -1 ) {
		valve = event.substring( 0, valveIndex )
		event = event.substring( valveIndex + 1 )
	}

	let c = new Communication( mode, originalId, flowId, externalId, sourceDivision, source, sourceNodeID, division, event, params, callback, responder, responderNodeID, error, response )
	c.valve = valve
	return c
}

exports.importCommunication = function ( obj ) {
	let c = new Communication( obj.mode, obj.originalId, obj.flowId, obj.externalId, obj.sourceDivision, obj.source, obj.sourceNodeID, obj.division, obj.event, obj.params, obj.callback, obj.responder, obj.responderNodeID, obj.error, obj.response )

	c.id = obj.id
	c.valve = obj.valve || VALVE_DEFAULT
	c.terms = obj.terms || {}
	c.signature = obj.signature

	c.creationDate = obj.creationDate
	c.arrivalDate = obj.arrivalDate
	c.dispatchDate = obj.dispatchDate

	if ( obj.expose )
		c.expose = true

	return c
}

exports.narrowResponse = function ( obj ) {
	return _.pick( obj, [
		'mode', 'id', 'originalId', 'flowId', 'externalId', 'creationDate', 'arrivalDate',
		'dispatchDate', 'responder', 'responderNodeID', 'error', 'response'
	] )
}
