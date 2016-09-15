'use strict'

let Communication = require('./Communication')
let Fire = require('./Fire')

let _ = require('isa.js')
let Proback = require('proback.js')

let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
let ARGUMENT_NAMES = /([^\s,]+)/g
function parameterNames ( func ) {
	let fnStr = func.toString().replace(STRIP_COMMENTS, '')
	let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
	if (result === null)
		result = []
	return result
}

function isLast (array, value) {
	if ( array.length === 0 ) return false

	let element = array.pop()
	let found = Array.isArray(value) ? value.indexOf(element) > -1 : element === value
	if ( !found )
		array.push( element )
	return found
}

/**
* Firestarter is an abstract type to define a wrapper for listeners
*
* @class Firestarter
* @constructor
*/
function Firestarter ( ) { }

let firestarter = Firestarter.prototype

firestarter.addTerms = function (externalID, terms) {
	if ( externalID && terms && !this.terms[ externalID ] )
		this.terms[ externalID ] = terms
}

/**
* Sets the Blwer object for this firestarter instance
*/
firestarter.setBlower = function ( blower ) {
	this.blower = blower
}


/**
* Retrieves the array of events it is listening
*/
firestarter.services = function ( ) {
	throw new Error('To be implemented...')
}

firestarter.parameters = function ( service ) {
	throw new Error('To be implemented...')
}

let cbList = ['callback', 'cb']
firestarter.parametersOf = function ( fn ) {
	if ( !fn ) return null

	let params = parameterNames( fn )
	if ( params.length === 0 ) return params

	isLast( params, cbList ) && isLast( params, 'ignite' ) && isLast( params, 'terms' )

	return params
}

/**
* Validates division of an incoming message
*/
firestarter.sameDivision = function ( division ) {
	let div = division || ''

	if ( div === '*' )
		return true

	if ( !this.divisionPath )
		this.divisionPath = this.division.split('.')

	let dPath = div.split('.'), i = 0
	for ( i = 0; i < this.divisionPath.length; i += 1 ) {
		if ( i >= dPath.length || (this.divisionPath[i] && this.divisionPath[i] !== dPath[i]) ) return false
	}
	return true
}

/**
* Matches the emited respose event with the interest of the entity encapsulated by this firestarter
*
* @method matchesRespose
* @param {Communication} comm The communication object
* @return {Boolean} Returns true on matching
*/
firestarter.matchesRespose = function ( comm ) {
	return (comm.source === this.name && comm.sourceDivision === this.division) && this.blower.known( comm.originalId )
}


/**
* Matches the emited event with the interest of the entity encapsulated by this firestarter
*
* @method matches
* @param {Communication} comm The communication object
* @return {Boolean} Returns true on matching
*/
firestarter.matches = function ( comm ) {
	throw new Error('To be implemented...')
}

function responseAsArray ( responseComms, attribute ) {
	let res = responseComms.map( function (responseComm) { return responseComm[attribute || 'response'] } ).filter( function (resp) { return resp })
	return res.length === 0 ? null : res
}
/*
function responseAsObject ( responseComms ) {
	let res = responseComms.map( function (responseComm) { return responseComm.response } ).filter( function (resp) { return resp })
	return res.length === 0 ? null : res
}
*/
function mapValues ( object, converter ) {
	let result = {}

	for ( let key of Object.keys( object ) )
		result[key] = converter( object[key] )

	return result
}

function indexBy ( array, attributeName ) {
	let result = {}

	array.forEach( function (object) {
		if ( object[ attributeName ] )
			result[ object[ attributeName ] ] = object
	} )

	return result
}

/**
* Conformise the response comm objects
*
* @method conformResponse
* @param {Communication} responseComms Response array containing Communication objects
* @return {Object} Return response
*/
firestarter.conformResponse = function ( error, responseComms ) {
	if ( error ) return { err: error, res: null }

	let err, res

	if ( Array.isArray(responseComms) ) {
		err = responseAsArray( responseComms, 'error' )
		if ( this.config.namedResponses ) {
			let indexed = indexBy(responseComms, 'responder')
			if ( err ) {
				err = new Fire( mapValues( indexed, function ( response ) {
					return response.error
				}) )
			}
			res = mapValues( indexed, function ( response ) {
				return response.response
			})
		}
		else {
			res = responseAsArray( responseComms, 'response' )
		}
	}
	else {
		err = responseComms.error
		res = responseComms.response
	}
	return { err: err, res: res }
}

/**
* Transfers a response event to the source
*
* @method appease
* @param {Communication} comm Communication response object to deliver
*/
firestarter.appease = function ( error, comm, responseComms ) {
	let self = this

	let bcomm = this.blower.comm( comm.id )
	if ( bcomm ) {
		try {
			let response = this.conformResponse( error, responseComms )
			if ( bcomm.callback )
				bcomm.callback( response.err, response.res )
		} catch (err) { self.logger.harconlog( err ) }
		this.blower.burnout( comm.id )
	}
}

firestarter.getServiceFn = function ( comm ) {
	throw new Error('To be implemented...')
}

firestarter.innerBurn = function ( comm, callback, serviceFn, igniteFn, params ) {
	throw new Error('To be implemented...')
}

/**
* Distpaches the emited event to the listener
*
* @method burn
* @param {Communication} comm The communication object representing the event emited.
* @param {Function} callback Async callback function to be called when execution finished
*/
firestarter.burn = function ( comm, callback ) {
	let self = this

	self.logger.harconlog(null, 'Burning', {comm: comm.shallow()}, 'silly' )

	let serviceFn = self.getServiceFn( comm )

	let callbackFn = function (err, res) {
		if ( comm.externalId && self.terms[ comm.externalId ] )
			delete self.terms[ comm.externalId ]
		callback( err, comm.twist(self.name, err, res) )
	}

	let paramList = self.parametersOf( serviceFn )
	if ( paramList.length !== comm.params.length )
		return callbackFn( new Error('Mind the parameter list! You have sent ' + comm.params.length + ' instead of ' + paramList.length ) )

	let igniteFn = self.auditor ? function () {
		return self.burst( comm, arguments )
	} : function () {
		let args = [ null, null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
		return self.burst( comm, args )
	}
	// let igniteFn = function( ) { self.burst( comm, arguments ) }
	let terms = comm.terms
	terms.erupt = function (waterfall) {
		return function () {
			let _args = self.sliceArguments.apply( self, arguments )
			return waterfall ? function (_obj, cb) {
				_args.push( cb )
				igniteFn.apply( self, _args )
			} : function (cb) {
				_args.push( cb )
				igniteFn.apply( self, _args )
			}
		}
	}

	terms.sourceComm = comm.shallow()

	let params = [].concat( comm.params ).concat( serviceFn.length > comm.params.length + 2 ? terms : [] ).concat( serviceFn.length > comm.params.length + 1 ? igniteFn : [] ).concat( callbackFn )

	self.innerBurn( comm, callbackFn, serviceFn, igniteFn, params )
}

/**
* Distpaches the burst event to be emited within the flow of a previous event
*
* @method burst
* @param {Communication} comm The communication object representing the event to be emited.
* @param {Array} params Parameters associatd with the communication to send with
*/
firestarter.burst = function ( comm, params ) {
	let self = this
	let externalID = params[ 0 ]
	let flowID = params[ 1 ]
	let division = params[ 2 ] || self.division
	let event = params[ 3 ]
	let hasCallback = params.length > 0 && _.isFunction( params[ params.length - 1 ] )
	let callParams = self.sliceArguments.apply( self, params ).slice( 4, hasCallback ? params.length - 1 : params.length )
	let callback = hasCallback ? params[ params.length - 1 ] : null

	return new Promise( function (resolve, reject) {
		let newComm = comm.burst( externalID, flowID, self.division, self.name, division, event, callParams, self.callBacker( event, callback, resolve, reject ) )

		self.logger.harconlog( null, 'Igniting', {newComm: newComm.shallow(), comm: comm.shallow()}, 'silly' )

		if ( newComm.callback )
			self.blower.blow( newComm )

		self.barrel.intoxicate( newComm )
	} )
}

firestarter.callBacker = function ( eventName, callback, resolve, reject ) {
	if ( !callback && this.barrel.isSystemEvent( eventName ) )
		return null

	return Proback.handler( callback, resolve, reject )
}

firestarter.innerIgnite = function ( ) {
	let self = this
	let externalId = arguments[ 0 ]
	let flowId = arguments[ 1 ]
	let division = arguments[ 2 ] || self.division
	let event = arguments[ 3 ]
	let hasCallback = _.isFunction( arguments[ arguments.length - 1 ] )
	let params = self.sliceArguments.apply( self, arguments ).slice( 4, hasCallback ? arguments.length - 1 : arguments.length )
	let callback = hasCallback ? arguments[ arguments.length - 1 ] : null

	return new Promise( function (resolve, reject) {
		let comm = Communication.newCommunication( null, flowId, externalId, self.division, self.name, division, event, params, self.callBacker( event, callback, resolve, reject ) )

		if ( externalId && self.terms[externalId] ) {
			comm.terms = self.terms[externalId]
			// delete self.terms[externalId]
		}

		self.logger.harconlog(null, 'Initiate ignition', {comm: comm.shallow()}, 'silly' )
		if ( comm.callback )
			self.blower.blow( comm )

		self.barrel.intoxicate( comm )
	} )
}

/**
* Returns a function executing ignite when it is called
*
* @method erupt
* @param varargs defining attributes of a communication: eventName [list of parameters] [callback]
*/
firestarter.erupt = function () {
	let self = this
	let _args = self.sliceArguments.apply( self, arguments )
	return function (cb) {
		_args.push( cb )
		self.ignite.apply( self, _args )
	}
}


/**
* Distpaches the new event to be emited
*
* @method ignite
* @param varargs defining attributes of a communication: eventName [list of parameters] [callback]
*/
firestarter.ignite = function ( ) {
	let self = this
	let externalId = arguments[ 0 ]
	let flowlId = arguments[ 1 ]
	let division = arguments[ 2 ]
	let event = arguments[ 3 ]
	if ( _.isString(event) )
		return this.innerIgnite.apply( this, arguments )
	if ( Array.isArray(event) ) {
		let hasCallback = _.isFunction( arguments[ arguments.length - 1 ] )
		if ( !hasCallback ) {
			let promises = []
			let slicedArguments = self.sliceArguments.apply( self, arguments ).slice( 4 )
			event.forEach( function (ev) {
				let args = [externalId, flowlId, division, ev].concat( slicedArguments )
				promises.push( this.innerIgnite.apply( this, args ) )
			} )
			return promises
		}
		else throw new Error( 'Callback is not permitted when multiple events are sent.' )
	}
	throw new Error( 'Invalid parameters' )
}

firestarter.close = function ( callback ) {
	if ( callback )
		callback( null, 'OK.' )
}

module.exports = Firestarter
