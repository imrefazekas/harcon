let Communication = require('./Communication')
let Fire = require('./Fire')

let Assigner = require('assign.js')
let assigner = new Assigner()

let _ = require('isa.js')
let Proback = require('proback.js')


const GLOBAL_TERMS = '*'

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
firestarter.appease = async function ( error, comm, responseComms ) {
	let self = this
	let bcomm = self.blower.comm( comm.id )
	if ( bcomm ) {
		let response = self.conformResponse( error, responseComms )
		if ( !response.err && !response.res ) response.err = new Error('Service returned without a value')
		if ( bcomm.callback )
			bcomm.callback( response.err, (!response.err && self.barrel.unfoldAnswer && response.res.length === 1) ? response.res[0] : response.res )
		self.blower.burnout( comm.id )
	}
	return 'ok'
}

firestarter.getServiceInfo = function ( comm ) {
	throw new Error('To be implemented...')
}

/**
* Distpaches the emited event to the listener
*
* @method burn
* @param {Communication} comm The communication object representing the event emited.
*/
firestarter.burn = async function ( comm ) {
	let self = this
	return new Promise( async (resolve, reject) => {
		self.logger.harconlog(null, 'Burning', {comm: comm.shallow()}, 'trace' )

		let serviceInfo = self.getServiceInfo( comm )

		let serviceFn = serviceInfo.service

		let callbackFn = function (err, res) {
			if ( comm.externalId && self.terms[ comm.externalId ] )
				delete self.terms[ comm.externalId ]
			if (err) reject(err)
			else resolve( comm.twist(self.name, self.barrel.nodeID, err, res) )
		}

		if ( !serviceInfo.vargs && serviceInfo.params.length !== comm.params.length )
			return callbackFn( new Error('Mind the parameter list! You have sent ' + comm.params.length + ' instead of ' + serviceInfo.params.length + ' for ' + self.name + '.' + comm.event ) )

		let igniteFn = self.auditor ? function () {
			return self.burst( comm, arguments )
		} : function () {
			let args = [ null, null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
			return self.burst( comm, args )
		}

		let terms = assigner.cloneObject( comm.terms )
		terms.sourceComm = comm.shallow()

		let params = serviceInfo.vargs
			? [].concat( serviceFn.length > 1 ? terms : [] ).concat( serviceFn.length > 0 ? igniteFn : [] ).concat( comm.params )
			: [].concat( comm.params ).concat( serviceFn.length > comm.params.length + 1 ? terms : [] ).concat( serviceFn.length > comm.params.length ? igniteFn : [] )
		try {
			let res = await serviceFn.apply( self.object || { comm: comm, ignite: igniteFn }, params )
			callbackFn( null, res )
		} catch ( err ) { callbackFn(err) }
	} )
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
	let callParams = self.sliceArguments.apply( self, params ).slice( 4, params.length )

	if (self.config.bender && self.config.bender.enabled && self.config.bender.forced && self.config.bender.privileged.indexOf(self.name) === -1 ) {
		// division, event, parameters
		let _division = self.config.division
		let _event = 'FireBender.exec'
		let _callParams = [ division, event, callParams ]

		division = _division
		event = _event
		callParams = _callParams
	}

	return new Promise( async function (resolve, reject) {
		let newComm = comm.burst( externalID, flowID, self.division, self.name, self.barrel.nodeID, division, event, callParams, Proback.handler(null, resolve, reject) )

		self.logger.harconlog( null, 'Igniting', {newComm: newComm.shallow(), comm: comm.shallow()}, 'trace' )

		self.blower.blow( newComm )

		try {
			await self.barrel.intoxicate( newComm )
		} catch (err) { reject(err) }
	} )
}

firestarter.innerIgnite = function ( ) {
	let self = this
	let externalId = arguments[ 0 ]
	let flowId = arguments[ 1 ]
	let division = arguments[ 2 ] || self.division
	let event = arguments[ 3 ]
	let params = self.sliceArguments.apply( self, arguments ).slice( 4, arguments.length )

	if (self.config.bender && self.config.bender.enabled && self.config.bender.forced && self.config.bender.privileged.indexOf(self.name) === -1 ) {
		// division, event, parameters
		let _division = self.config.division
		let _event = 'FireBender.exec'
		let _params = [ division, event, params ]

		division = _division
		event = _event
		params = _params
	}

	return new Promise( async function (resolve, reject) {
		let comm = Communication.newCommunication( null, flowId, externalId, self.division, self.name, self.barrel.nodeID, division, event, params, Proback.handler(null, resolve, reject) )

		if ( self.terms[ GLOBAL_TERMS ] )
			comm.terms = self.terms[ GLOBAL_TERMS ]

		if ( externalId && self.terms[externalId] ) {
			assigner.assign( comm.terms, self.terms[externalId] )
			// comm.terms = self.terms[externalId]
			// delete self.terms[externalId]
		}

		self.logger.harconlog(null, 'Initiate ignition', {comm: comm.shallow()}, 'trace' )

		self.blower.blow( comm )

		try {
			await self.barrel.intoxicate( comm )
		} catch (err) { reject(err) }
	} )
}

/**
* Distpaches the new event to be emited
*
* @method ignite
* @param varargs defining attributes of a communication: eventName [list of parameters]
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
		let promises = []
		let slicedArguments = self.sliceArguments.apply( self, arguments ).slice( 4 )
		for (let ev of event) {
			let args = [externalId, flowlId, division, ev].concat( slicedArguments )
			promises.push( this.innerIgnite.apply( this, args ) )
		}
		return Promise.all( promises )
	}

	throw new Error( 'Invalid parameters' )
}

firestarter.close = async function ( ) {
	return 'ok'
}

module.exports = Firestarter
