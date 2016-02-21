'use strict'

var Communication = require('./Communication')
var Fire = require('./Fire')

var _ = require('isa.js')

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
var ARGUMENT_NAMES = /([^\s,]+)/g
function parameterNames ( func ) {
	var fnStr = func.toString().replace(STRIP_COMMENTS, '')
	var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
	if (result === null)
		result = []
	return result
}

function isLast (array, value) {
	if ( array.length === 0 ) return false

	var element = array.pop()
	var found = Array.isArray(value) ? value.indexOf(element) > -1 : element === value
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

var firestarter = Firestarter.prototype

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

var cbList = ['callback', 'cb']
firestarter.parametersOf = function ( fn ) {
	if ( !fn ) return null

	var params = parameterNames( fn )
	if ( params.length === 0 ) return params

	isLast( params, cbList ) && isLast( params, 'ignite' ) && isLast( params, 'terms' )

	return params
}

/**
* Validates division of an incoming message
*/
firestarter.sameDivision = function ( division ) {
	var div = division || ''

	if ( div === '*' )
		return true

	if ( !this.divisionPath )
		this.divisionPath = this.division.split('.')

	var dPath = div.split('.'), i = 0
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
	return (comm.source === this.name) && this.blower.known( comm.originalId )
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
	var res = responseComms.map( function (responseComm) { return responseComm[attribute || 'response'] } ).filter( function (resp) { return resp })
	return res.length === 0 ? null : res
}
/*
function responseAsObject ( responseComms ) {
	var res = responseComms.map( function (responseComm) { return responseComm.response } ).filter( function (resp) { return resp })
	return res.length === 0 ? null : res
}
*/
function mapValues ( object, converter ) {
	var result = {}

	for ( let key of Object.keys( object ) )
		result[key] = converter( object[key] )

	return result
}

function indexBy ( array, attributeName ) {
	var result = {}

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

	var err, res

	if ( Array.isArray(responseComms) ) {
		err = responseAsArray( responseComms, 'error' )
		if ( this.config.namedResponses ) {
			var indexed = indexBy(responseComms, 'responder')
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
	var bcomm = this.blower.comm( comm.id )
	if ( bcomm ) {
		var response = this.conformResponse( error, responseComms )
		if ( bcomm.callback )
			bcomm.callback( response.err, response.res )
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
	var self = this

	self.logger.harconlog(null, 'Burning', {comm: comm.shallow()}, 'silly' )

	var serviceFn = self.getServiceFn( comm )

	var callbackFn = function (err, res) {
		callback( err, comm.twist(self.name, err, res) )
	}

	if ( self.parametersOf( serviceFn ).length !== comm.params.length )
		return callbackFn( new Error('Mind the parameter list!') )

	var igniteFn = self.auditor ? function () {
		return self.burst( comm, arguments )
	} : function () {
		var args = [ null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
		return self.burst( comm, args )
	}
	// var igniteFn = function( ) { self.burst( comm, arguments ) }
	var params = [].concat( comm.params ).concat( serviceFn.length > comm.params.length + 2 ? comm.terms : [] ).concat( serviceFn.length > comm.params.length + 1 ? igniteFn : [] ).concat( callbackFn )

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
	var self = this
	var externalID = params[ 0 ]
	var division = params[ 1 ] || self.division
	var event = params[ 2 ]
	var hasCallback = params.length > 0 && _.isFunction( params[ params.length - 1 ] )
	var callParams = self.sliceArguments.apply( self, params ).slice( 3, hasCallback ? params.length - 1 : params.length )
	var callback = hasCallback ? params[ params.length - 1 ] : null

	return new Promise( function (resolve, reject) {
		var newComm = comm.burst( self.name, externalID, division, event, callParams, self.callBacker( event, callback, resolve, reject ) )

		self.logger.harconlog( null, 'Igniting', {newComm: newComm.shallow(), comm: comm.shallow()}, 'silly' )

		if ( newComm.callback )
			self.blower.blow( newComm )

		self.barrel.intoxicate( newComm )
	} )
}

firestarter.callBacker = function ( eventName, callback, resolve, reject ) {
	if ( !callback && this.barrel.isSystemEvent( eventName ) )
		return null

	return function ( err, res ) {
		if ( err ) {
			if ( callback )
				callback( err, null )
			return reject( err )
		}
		if ( callback )
			callback( null, res )
		resolve( res )
	}
}

firestarter.innerIgnite = function ( ) {
	var self = this
	var externalId = arguments[ 0 ]
	var division = arguments[ 1 ] || self.division
	var event = arguments[ 2 ]
	var hasCallback = _.isFunction( arguments[ arguments.length - 1 ] )
	var params = self.sliceArguments.apply( self, arguments ).slice( 3, hasCallback ? arguments.length - 1 : arguments.length )
	var callback = hasCallback ? arguments[ arguments.length - 1 ] : null

	return new Promise( function (resolve, reject) {
		var comm = Communication.newCommunication( null, null, externalId, self.name, division, event, params, self.callBacker( event, callback, resolve, reject ) )

		if ( externalId && self.terms[externalId] ) {
			comm.terms = self.terms[externalId]
			delete self.terms[externalId]
		}

		self.logger.harconlog(null, 'Initiate ignition', {comm: comm.shallow()}, 'silly' )
		if ( comm.callback )
			self.blower.blow( comm )

		self.barrel.intoxicate( comm )
	} )
}

/**
* Distpaches the new event to be emited
*
* @method ignite
* @param varargs defining attributes of a communication: eventName [list of parameters] [callback]
*/
firestarter.ignite = function ( ) {
	var self = this
	var externalId = arguments[ 0 ]
	var division = arguments[ 1 ]
	var event = arguments[ 2 ]
	if ( _.isString(event) )
		return this.innerIgnite.apply( this, arguments )
	if ( Array.isArray(event) ) {
		var hasCallback = _.isFunction( arguments[ arguments.length - 1 ] )
		if ( !hasCallback ) {
			var promises = []
			var slicedArguments = self.sliceArguments.apply( self, arguments ).slice( 3 )
			event.forEach( function (ev) {
				var args = [externalId, division, ev].concat( slicedArguments )
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
