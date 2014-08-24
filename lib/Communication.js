var Cerobee = require('clerobee');

var _ = require('lodash');

var clerobee;

/**
* Communication abstractation used for interaction between entities
*
* @class Communication
* @constructor
*/
function Communication(originalId, flowId, externalId, source, event, params, callback, target, error, response){
	this.id = clerobee.generate();
	this.originalId = originalId || this.id;
	this.flowId = flowId || clerobee.generate();

	this.externalId = externalId;

	this.date = Date.now();

	this.source = source;

	this.event = event;

	this.params = params || [];

	if( target )
		this.target = target;
	if( error )
		this.error = error;
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
	if( this.error || this.response ){
		if( this.error && this.response )
			throw new Error('Invalid comm: comm has both error and response attributes.');
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
* @param {Error} error Error object if occurred
* @param {Object} response Response object if exists
*/
commPrototype.twist = function( name, error, response ) {
	var comm = new Communication( this.id, this.flowId, this.externalId, this.source, this.event, this.params, this.callback,  name, error, response );
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

/**
* Extracts response objects from the response attribute
* @method flattenResponse
*/
commPrototype.flattenResponse = function(){
	if( !this.response ) return null;
	if( Array.isArray( this.response ) ){
		return _.map( this.response, function(comm){ return comm.response; } );
	}
	else{
		return this.response.response;
	}
};

exports.setupSecurity = function(idLength){
	clerobee = new Cerobee( idLength || 16 );
};
exports.newCommunication = function( originalId, flowId, externalId, source, event, params, callback, target, error, response ){
	return new Communication( originalId, flowId, externalId, source, event, params, callback, target, error, response );
};
