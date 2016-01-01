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

/**
* Stores a comm by ID
*
* @method blow
*/
blower.blow = function( comm ){
	var self = this;
	self.comms[ comm.id ] = { comm: comm, callback: comm.callback };
	if( self.commTimeout>0 && self.barrel ){
		setTimeout( function(){
			if( self.known( comm.id ) )
				self.barrel.appease( comm, new Error('Communication has not been received answer withing the given timeframe.'), [] );
		}, self.commTimeout );
	}
};

module.exports = Blower;
