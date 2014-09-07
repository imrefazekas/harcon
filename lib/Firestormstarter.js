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

/**
* Matches the emited event with the interest of the entity encapsulated by this firestarter
*
* @method matches
* @param {String} eventName Tells if the given firestarter is listening to the given event
* @return {Boolean} Returns true on matching
*/
firestorm.matches = function( eventName ){
	var index = eventName.lastIndexOf( '.' );
	if( index === -1 ){ index = eventName.length; }

	var matches = index === -1 ? _.contains(this.events, eventName) : ( this.context === eventName.substring(0,index) && _.contains(this.events, eventName.substring(index+1) ) );

	this.logger.harconlog( null, 'Matching: ', {events: this.events, eventName: eventName, matches: matches}, 'silly' );

	return matches;
};

/**
* Distpaches the emited event to the listener
*
* @method burn
* @param {Communication} comm The communication object representing the event emited.
* @param {Function} callback Async callback function to be called when execution finished
*/
firestorm.burn = function( comm, callback ){
	var self = this;

	this.logger.harconlog(null, 'Burning: ', {comm: comm} );

	var index = comm.event.lastIndexOf( '.' );
	var eventName = comm.event.substring( index+1 );

	this.object.comm = comm;
	this.object.ignite = function( ){
		self.burst( comm, arguments );
	};
	try {
		this.object[ eventName ].apply(
			this.object,
			[].concat( comm.params ).concat( function(err, res){ callback( err, comm.twist(self.name, err, res) ); } )
		);
	} catch (ex) {
		callback( ex, comm.twist(self.name, ex, null) );
	}
};

/**
* Notifies the firestorm instance to close all open connection
*
* @method close
*/
firestorm.close = function( ){
	if( this.object.close )
		this.object.close();
};

module.exports = Firestormstarter;
