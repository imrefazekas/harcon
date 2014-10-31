var Communication = require('./Communication');
var Firestarter = require('./Firestarter');

function isString(value) {
	return typeof value === 'string' || (value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object String]') || false;
}
function isObject(value) {
	var type = typeof value;
	return type === 'function' || (value && type === 'object') || false;
}
function isRegExp(value) {
	return (isObject(value) && Object.prototype.toString.call(value) === '[object RegExp]') || false;
}

/**
* Flamestarter is a wrapper for listeners defined as pure functions
*
* @class Flamestarter
* @constructor
*/
function Flamestarter( barrel, name, eventName, fn, logger ){
	this.isRegex = isRegExp( eventName );
	this.isString = isString( eventName );

	this.path = this.isString ? eventName.split( '.' ) : [];
	this.pathLength = this.path.length;

	this.barrel = barrel;
	this.name = name;
	this.event = eventName;
	this.fn = fn;

	this.logger = logger;

	this.comms = {};
}

Flamestarter.prototype = new Firestarter();
var flamestarter = Flamestarter.prototype;

flamestarter.innerMatches = function( eventName ){
	if( this.event === '*' )
		return true;

	if( this.isRegex )
		return this.event.test( eventName );

	if( this.isString ){
		var eventPath = eventName.split( '.' );
		for(var i = 0, len = eventPath.length; i < len && i < this.pathLength; i+=1) {
			if( this.path[i] === '*' )
				return true;
			if( this.path[i] !== eventPath[i] )
				return false;
		}
		return true;
	}
	return false;
};

flamestarter.matches = function( eventName ){
	var matches = this.innerMatches( eventName );

	this.logger.harconlog(null, 'Matching', {event: this.event, eventName: eventName, matches: matches}, 'silly' );

	return matches;
};

flamestarter.getServiceFn = function( comm ){
	return this.fn;
};

flamestarter.innerBurn = function( comm, callback, serviceFn, igniteFn, params ){
	var self = this;
	try {
		serviceFn.apply( { comm: comm, ignite: igniteFn }, params );
	} catch (ex) {
		callback( ex, comm.twist(self.name, ex, null) );
	}
};

module.exports = Flamestarter;
