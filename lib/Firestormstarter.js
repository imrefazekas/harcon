var Firestarter = require('./Firestarter');

var ignorable = [ 'init', 'close', 'ignite' ];

function isFunction(value) {
	return typeof value === 'function' || false;
}
function functions(obj) {
	var res = [];
	for(var m in obj)
		if( !ignorable.contains(m) && isFunction(obj[m]) )
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
	this.auditor = object.auditor;

	this.name = object.name || 'Unknown flames';

	this.active = true;

	this.context = object.context || '';
	this.path = this.context.split( '.' );
	this.pathLength = this.path.length;

	this.events = functions( object );

	this.barrel = barrel;
	this.object = object;
	if(!this.object.ignite)
		this.object.ignite =  this.auditor ? function(){
			self.ignite.apply( self, arguments );
		} : function(){
			var args = [ null, self.division ].concat( self.sliceArguments.apply( self, arguments ) );
			self.ignite.apply( self, args );
		};

	this.logger = logger;

	this.terms = {};

	this.comms = {};
}

Firestormstarter.prototype = new Firestarter();

var firestorm = Firestormstarter.prototype;

firestorm.services = function( ){
	return this.events;
};

firestorm.matches = function( division, eventName ){
	if( !this.sameDivision( division ) ) return false;

	var matches = true;

	var index = eventName.lastIndexOf( '.' );
	var eventPath = index === -1 ? [] : eventName.substring(0,index).split( '.' );

	for(var i = 0, len = eventPath.length; i < len && i < this.pathLength; i+=1)
		if( eventPath[i] === '*' ){
			if( i === eventPath.length-1 ) break;
			else continue;
		}
		else if( this.path[i] !== eventPath[i] ) matches = false;
		else if( i === eventPath.length-1 && i<this.path.length-1 ) matches = false;

	if( matches )
		matches = this.events.contains(eventName.substring(index+1) );

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
