var _ = require('lodash');

/**
* Firestarter is a wrapper for listeners defined as pure functions
*
* @class Firestarter
* @constructor
*/
function Firestarter( barrel, name, eventName, fn, logger, context ){
	this.isRegex = _.isRegExp( eventName );
	this.isString = _.isString( eventName );

	this.path = this.isString ? eventName.split( '.' ) : [];
	this.pathLength = this.path.length;

	this.barrel = barrel;
	this.name = name;
	this.event = eventName;
	this.fn = fn;

	this.logger = logger;

	this.context = context;
}

var firestarter = Firestarter.prototype;

/**
* Matches the emited event with the interest of the entity encapsulated by this firestarter
*
* @method matches
* @param {String} eventName Tells if the given firestarter is listening to the given event
* @return {Boolean} Returns true on matching
*/
firestarter.matches = function( eventName ){
	this.logger.debug('Matching: ', this.event, eventName );

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
	}

	return false;
};

/**
* Distpaches the emited event to the listener
*
* @method burn
* @param {Communication} comm The communication object representing the event emited.
* @param {Function} callback Async callback function to be called when execution finished
*/
firestarter.burn = function( comm, callback ){
	var self = this;

	var sparkle = comm.spread();

	this.logger.debug('Burning: ', sparkle );

	sparkle.params.push( function(err, res){ callback( err, comm.twist(this.name, err, res) ); } );
	self.fn.apply(
		this.context ? this.context : { comm: sparkle, ignite: function( ){
				self.ignite( sparkle, arguments );
			} },
		sparkle.params
	);
};

/**
* Distpaches the event to be emited
*
* @method ignite
* @param {Communication} comm The communication object representing the event to be emited.
* @param {Array} params Parameters associatd with the communication to send with
*/
firestarter.ignite = function( comm, params ){
	this.logger.debug('Igniting: ', comm, params );

	var event = params[ 0 ];
	var hasCallback = _.isFunction( arguments[ arguments.length-1 ] );
	var call_params = [].slice.call(params, 1, hasCallback ? params.length-1 : params.length );
	var callback = hasCallback ? params[ params.length-1 ] : null;

	this.barrel.intoxicate( comm.burst( this.name, event, call_params, callback ) );
};

module.exports = Firestarter;
