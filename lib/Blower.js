var _ = require('isa.js');

/**
* Communication blower to keep them alive while operating
*
* @class Blower
* @constructor
*/
function Blower( ){
}
var blower = Blower.prototype;

/**
* Inits the blower instance
*
* @method init
*/
blower.init = function( config, callback ){
	this.config = config || {};
	this.barrel = this.config.barrel;
	this.commTimeout = this.config.commTimeout || 0;

	if( !this.config.tolerate ) this.config.tolerate = {};
	this.config.tolerate.sources = this.config.sources || [];
	this.config.tolerate.events = this.config.events || [];
	this.config.tolerate.divisions = this.config.divisions || [];
	this.config.tolerate.inspect = function( comm ){ return false; };

	this.comms = {};
	if(callback)
		callback();
};

/**
* Checks if a given ID is known
*
* @method known
*/
blower.known = function( id ){
	return !!this.comms[ id ];
};

/**
* Retrieves a comm by ID
*
* @method comm
*/
blower.comm = function( id ){
	return this.comms[ id ];
};

/**
* Removes a comm by ID
*
* @method burnout
*/
blower.burnout = function( id ){
	delete this.comms[ id ];
};

function innerTolerated( obj, pattern ){
	if( _.isString( pattern ) )
		return pattern.endsWith('*' ) ? (obj.startsWith( pattern.substring( 0, pattern.length-1 ) )) : (pattern === obj);
	else if( _.isRegExp( pattern ) )
		return pattern.test( obj );
	else if( _.isFunction( pattern ) )
		return pattern( obj );
	return false;
}
blower.tolerated = function( comm ){
	var i;
	for(i=0; i<this.config.tolerate.source.length; ++i){
		if( innerTolerated( comm.source, this.config.tolerate.source[i] ) )
			return true;
	}
	for(i=0; i<this.config.tolerate.event.length; ++i){
		if( innerTolerated( comm.event, this.config.tolerate.event[i] ) )
			return true;
	}
	for(i=0; i<this.config.tolerate.divisions.length; ++i){
		if( innerTolerated( comm.division, this.config.tolerate.divisions[i] ) )
			return true;
	}
	return this.config.tolerate.inspect( comm );
};

/**
* Stores a comm by ID
*
* @method blow
*/
blower.blow = function( comm ){
	var self = this;
	self.comms[ comm.id ] = { comm: comm, callback: comm.callback };
	if( self.commTimeout>0 && self.barrel && !self.tolerated( comm ) ){
		setTimeout( function(){
			if( self.known( comm.id ) )
				self.barrel.appease( comm, new Error('Communication has not been received answer withing the given timeframe.'), [] );
		}, self.commTimeout );
	}
};

module.exports = Blower;
