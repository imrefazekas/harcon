'use strict';

var Firestarter = require('./Firestarter');

var ignorable = [ 'init', 'close', 'ignite' ];

function isFunction(value) {
	return typeof value === 'function' || false;
}
function functions(obj) {
	var res = [];
	for(var m in obj)
		if( !ignorable.includes(m) && isFunction(obj[m]) )
			res.push(m);
	return res;
}

/**
* Firestormstarter is a wrapper for listener object where its functions are the listeners routed by its 'context' property
*
* @class Firestormstarter
* @constructor
*/
function Firestormstarter( config, barrel, object, logger ){
	var self = this;

	this.config = config || {};
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
	if(!this.object.shifted)
		this.object.shifted = function(){
			var object = { division: self.division, context: self.context, name: self.name, state: arguments.length === 1 ? arguments[0] : arguments };
			self.ignite.call( self, null, self.barrel.systemFirestarter.division, self.barrel.systemFirestarter.name + '.' + 'shifted', object );
		};

	this.logger = logger;
	if(!this.object.harconlog)
		this.object.harconlog = logger.harconlog;

	this.terms = {};

	this.comms = {};
}

Firestormstarter.prototype = new Firestarter();

var firestorm = Firestormstarter.prototype;

firestorm.services = function( ){
	return this.events;
};

firestorm.parameters = function( service ){
	return this.parametersOf( this.object[service] );
};

firestorm.matches = function( division, eventName ){
	if( !eventName || !this.sameDivision( division ) ) return false;

	var index = eventName.lastIndexOf( '.' );
	var prefix = eventName.substring(0, index);
	var fnName = eventName.substring(index+1);

	var matches = fnName && this.events.includes( fnName );

	if( matches && this.name !== prefix ){
		var eventPath = index === -1 ? [] : prefix.split( '.' ), len = eventPath.length;
		for(var i = 0; i < len && i < this.pathLength; i+=1)
			if( this.path[i] !== eventPath[i] ){
				matches = false; break;
			}
	}

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
		callback( ex );
	}
};

firestorm.close = function( ){
	if( this.object.close )
		this.object.close();
};

module.exports = Firestormstarter;
