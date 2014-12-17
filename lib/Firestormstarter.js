var Firestarter = require('./Firestarter');

function isFunction(value) {
	return typeof value === 'function' || false;
}
function functions(obj) {
	var res = [];
	for(var m in obj)
		if( isFunction(obj[m]) )
			res.push(m);
	return res;
}

/**
* Firestormstarter is a wrapper for listener object where its functions are the listeners routed by its 'context' property
*
* @class Firestormstarter
* @constructor
*/
function Firestormstarter( barrel, object, logger ){
	var self = this;

	this.division = object.division || '';

	this.name = object.name || 'Unknown flames';

	this.context = object.context || '';

	this.events = functions( object );

	this.barrel = barrel;
	this.object = object;
	if(!this.object.ignite)
		this.object.ignite = function(){
			var args = [ self.division ].concat( self.sliceArguments.apply( self, arguments ) );
			self.ignite.apply( self, args );
		};
	this.logger = logger;

	this.comms = {};
}

Firestormstarter.prototype = new Firestarter();

var firestorm = Firestormstarter.prototype;

firestorm.services = function( ){
	return this.events;
};

firestorm.matches = function( division, eventName ){
	if( !this.sameDivision( division ) ) return false;

	var index = eventName.lastIndexOf( '.' );
	if( index === -1 ){ index = eventName.length; }
	var matches = this.context === eventName.substring(0,index) && this.events.contains(eventName.substring(index+1) );

	this.logger.harconlog( null, 'Matching', {events: this.events, eventName: eventName, matches: matches}, 'silly' );

	return matches;
};

firestorm.getServiceFn = function( comm ){
	var index = comm.event.lastIndexOf( '.' );
	var eventName = comm.event.substring( index+1 );

	return this.object[ eventName ];
};

firestorm.innerBurn = function( comm, callback, serviceFn, igniteFn, params ){
	var self = this;

	try {
		serviceFn.apply( this.object, params );
	} catch (ex) {
		callback( ex, comm.twist(self.name, ex, null) );
	}
};

firestorm.close = function( ){
	if( this.object.close )
		this.object.close();
};

module.exports = Firestormstarter;
