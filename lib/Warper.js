/**
* Type to protect divisions.
*
* @class Warper
* @constructor
*/
function Warper ( division, connectedDivisions, options ) {
	this.division = division
	this.connectedDivisions = connectedDivisions || []
	this.options = options || {}
}
let warper = Warper.prototype

/**
* Inposes information from other harcon nodes
*/
warper.inpose = function ( exposed ) {
	return ''
}

/**
* Exposes information to be distribute among harcon nodes
*/
warper.expose = function ( ) {
	return ''
}

/**
* Conforms a message to enclose all attributes necessary
*/
warper.conform = function ( comm ) {
	throw new Error('To be implemented...')
}

/**
* Sets the object as a basis for all decisions made by this wrapper
*/
warper.referenceMatrix = function ( object ) {
	throw new Error('To be implemented...')
}

/**
* Control function which decides to let a given comm to pass or blocks it
*/
warper.allow = function ( communication ) {
	throw new Error('To be implemented...')
}

module.exports = Warper
