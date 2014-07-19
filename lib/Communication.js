var Cerobee = require('clerobee');
var clerobee = new Cerobee( 16 );

/**
* Communication abstractation used for interaction between entities
*
* @class Communication
* @constructor
*/
function Communication(originalId, flowId, externalId, source, event, params, callback, err, response){
	this.id = clerobee.generate();
	this.originalId = originalId || this.id;
	this.flowId = flowId || clerobee.generate();

	this.externalId = externalId;

	this.date = Date.now();

	this.source = source;

	this.event = event;

	this.params = params || [];

	if( err )
		this.err = err;
	if( response )
		this.response = response;

	if( callback )
		this.callback = callback;
}

var commPrototype = Communication.prototype;

/**
* Check mandatory properies
*
* @method checkProperties
* @param {Array of String} names Attribute names to check
*/
commPrototype.checkProperties = function( names ){
	var i;
	for ( i=0; i<names.length; i+=1 )
		if( !global._.has( this, names[i]) )
			throw new Error( 'Invalid. The property %s must be present.', names[i] );
};

/**
* Validates the message integrity
*
* @method checkValidity
*/
commPrototype.checkValidity = function() {
	this.checkProperties( ['id', 'originalId', 'flowId', 'date', 'source', 'event'] );
	if( this.err || this.response ){
		if( this.err && this.response )
			throw new Error('Invalid comm: comm has both err and response attributes.');
		if( this.id === this.originalId )
			throw new Error('Invalid comm: originalId and Id must be different in a response.');
	}
};

/**
* Creates a clone of this message object
*
* @method spread
*/
commPrototype.spread = function( ) {
	var comm = new Communication( this.originalId, this.flowId, this.externalId, this.source, this.event, this.params );
	comm.id = this.id;
	comm.date = this.date;
	comm.params = this.params.slice();
	comm.callback = null;
	return comm;
};

/**
* Creates a new response object
*
* @method twist
* @param {String} name Name of the responding entity
* @param {Error} err Error object if occurred
* @param {Object} response Response object if exists
*/
commPrototype.twist = function( name, err, response ) {
	var comm = new Communication( this.id, this.flowId, this.externalId, name, this.event, this.params, this.callback, err, response );
	return comm;
};

/**
* Creates a sub-communication object within the same flow
*
* @method burst
* @param {String} name Name of the sending entity
* @param {String} event Name of the event to be sent
* @param {Array of Object} params Array of objects to be sent withing the event
* @param {Function} callback Callback function to deliver the response if exists
*/
commPrototype.burst = function( name, event, params, callback ) {
	var comm = new Communication( null, this.flowId, this.externalId, name, event, params, callback );
	return comm;
};

module.exports = Communication;
