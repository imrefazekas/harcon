let _ = require('isa.js')

let { OK } = require('./Static')

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
blower.init = async function ( config ) {
	let self = this

	self.config = config || {}
	self.barrel = self.config.barrel

	self.commTimeout = self.config.commTimeout

	if ( !self.config.tolerates ) self.config.tolerates = []
	else if ( !_.isArray( self.config.tolerates ) ) self.config.tolerates = [ self.config.tolerates ]

	self.timers = []
	self.comms = {}

	return OK
}

blower.addToleration = function ( toleation ) {
	this.config.tolerates.push( toleation )
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
		if ( innerTolerated( comm, this.config.tolerates[i].event || this.config.tolerates[i] ) )
			return this.config.tolerates[i].timeout || -1
	return this.commTimeout
}

/**
* Stores a comm by ID
*
* @method blow
*/
blower.blow = function ( comm ) {
	if (!comm.callback) return

	let self = this, timeout
	self.comms[ comm.id ] = { comm: comm, callback: comm.callback }
	if ( self.commTimeout && self.barrel && (timeout = self.tolerated( comm )) > 0 ) {
		let timer = setTimeout( async function () {
			if ( self.known( comm.id ) )
				await self.barrel.intoxicate( comm, new Error('No answer within the timeframe: ' + comm.event ), [] )
			self.timers.removeElement( timer )
		}, timeout )
		self.timers.push( timer )
	}
}

blower.close = async function () {
	for (let timer of this.timers)
		clearTimeout( timer )

	return OK
}

module.exports = Blower
