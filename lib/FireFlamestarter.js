var _ = require('lodash');

/**
* FireFlamestarter is a wrapper for listeners encapsulated by an object
*
* @class FireFlamestarter
* @constructor
*/
function FireFlamestarter( Firestarter, barrel, object, eventNames, fns, logger ){
	var self = this;

	this.firestarters = [];

	this.name = object.name || 'Unknown flames';
	this.event = eventNames;

	_.each( eventNames, function(eventName, index, list){
		var firestarter = new Firestarter( barrel, object.name || 'Unknown flames', eventName, fns[index], logger, object );
		self.firestarters.push( firestarter );
	} );

	this.Firestarter = Firestarter;
	this.barrel = barrel;
	this.object = object;
	this.events = eventNames;
	this.fns = fns;

	this.logger = logger;
}

var firestarter = FireFlamestarter.prototype;

/**
* Matches the emited event with the interest of the entities encapsulated by this firestarter
*
* @method matches
* @param {String} eventName Tells if the given firestarter is listening to the given event
* @return {Boolean} Returns true on matching
*/
firestarter.matches = function( eventName ){
	this.logger.debug('Matching: ', this.events, eventName );

	return _.find( this.firestarters, function(firestarter){
		return firestarter.matches( eventName );
	} );
};

/**
* Distpaches the emited event to the listeners
*
* @method burn
* @param {Communication} comm The communication object representing the event emited.
* @param {Function} callback Async callback function to be called when execution finished
*/
firestarter.burn = function( comm, callback ){
	var firestarter = _.find( this.firestarters, function(firestarter){
		return firestarter.matches( comm.event ) ? firestarter : null;
	} );

	this.logger.debug('Burning: ', comm );

	this.object.comm = comm;
	this.object.ignite = function( ){
		firestarter.ignite( comm, arguments );
	};

	firestarter.burn( comm, callback );
};

module.exports = FireFlamestarter;
