var _ = require('lodash');

var Firestarter = require('./Firestarter');

/**
* Firestormstarter is a wrapper for listener object where its functions are the listeners routed by its 'context' property
*
* @class Firestormstarter
* @constructor
*/
function Firestormstarter( barrel, object, logger ){
	var self = this;

	this.name = object.name || 'Unknown flames';

	this.context = object.context || '';

	this.events = _.functions( object );

	this.barrel = barrel;
	this.object = object;

	this.logger = logger;
}

Firestormstarter.prototype = new Firestarter();

var firestorm = Firestormstarter.prototype;

firestorm.matches = function( eventName ){
	this.logger.debug('Matching: ', this.events, eventName );

	var index = eventName.lastIndexOf( '.' );
	if( index === -1 ){ index = eventName.length; }

	return index === -1 ? _.contains(this.events, eventName) : ( this.context === eventName.substring(0,index) && _.contains(this.events, eventName.substring(index+1) ) );
};

firestorm.burn = function( comm, callback ){
	var self = this;

	this.logger.debug('Burning: ', comm );

	var index = comm.event.lastIndexOf( '.' );
	var eventName = comm.event.substring( index+1 );

	this.object.comm = comm;
	this.object.ignite = function( ){
		self.burst( comm, arguments );
	};
	this.object[ eventName ].apply(
		this.object,
		[].concat( comm.params ).concat( function(err, res){ callback( err, comm.twist(self.name, err, res) ); } )
	);
};

firestorm.close = function( ){
	if( this.object.close )
		this.object.close();
};

module.exports = Firestormstarter;
