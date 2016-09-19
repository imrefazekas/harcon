let _ = require('isa.js')

let Proback = require('proback.js')

/**
* Communication blower to keep them alive while operating
*
* @class Blower
* @constructor
*/
function Blower ( ) {
}
let blower = Blower.prototype

/**
* Inits the blower instance
*
* @method init
*/
blower.init = function ( config, callback ) {
	this.config = config || {}
	this.barrel = this.config.barrel

	this.commTimeout = this.config.commTimeout || 0
	this.dynamicTimeout = this.commTimeout && _.isFunction( this.commTimeout )

	if ( !this.config.tolerates ) this.config.tolerates = []
	else if ( !_.isArray( this.config.tolerates ) ) this.config.tolerates = [ this.config.tolerates ]

	this.comms = {}

	return Proback.quicker( 'ok', callback )
}

/**
* Checks if a given ID is known
*
* @method known
*/
blower.known = function ( id ) {
	return !!this.comms[ id ]
}

/**
* Retrieves a comm by ID
*
* @method comm
*/
blower.comm = function ( id ) {
	return this.comms[ id ]
}

/**
* Removes a comm by ID
*
* @method burnout
*/
blower.burnout = function ( id ) {
	delete this.comms[ id ]
}

function innerTolerated ( comm, pattern ) {
	if ( _.isString( pattern ) )
		return pattern.endsWith('*' ) ? (comm.event.startsWith( pattern.substring( 0, pattern.length - 1 ) )) : (pattern === comm.event)
	else if ( _.isRegExp( pattern ) )
		return pattern.test( comm.event )
	else if ( _.isFunction( pattern ) )
		return pattern( comm )
	return false
}

/**
* Tells whether any delay for the answer of the given communication should be tolerated.
*
* @method tolerated
*/
blower.tolerated = function ( comm ) {
	let i
	for (i = 0; i < this.config.tolerates.length; ++i)
		if ( innerTolerated( comm, this.config.tolerates[i] ) )
			return true
	return false
}

/**
* Stores a comm by ID
*
* @method blow
*/
blower.blow = function ( comm ) {
	let self = this
	self.comms[ comm.id ] = { comm: comm, callback: comm.callback }
	if ( self.commTimeout && self.barrel && !self.tolerated( comm ) ) {
		let delay = self.dynamicTimeout ? self.commTimeout( comm ) : self.commTimeout
		if ( delay > 0 )
			setTimeout( function () {
				if ( self.known( comm.id ) )
					self.barrel.appease( comm, new Error('Communication has not been received answer withing the given timeframe: ' + comm.event ), [] )
			}, delay )
	}
}

module.exports = Blower
