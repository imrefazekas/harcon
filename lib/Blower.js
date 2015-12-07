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
	this.comms[ comm.id ] = { comm: comm, callback: comm.callback };
};

module.exports = Blower;
