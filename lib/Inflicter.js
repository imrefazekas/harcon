var _ = require('lodash');

var Communication = require('../lib/Communication');
var Barrel = require('../lib/Barrel');
var Firestarter = require('../lib/Firestarter');
var FireFlamestarter = require('../lib/FireFlamestarter');

/**
* Main control point of the messaging subsystem
*
* @class Inflicter
* @constructor
*/
function Inflicter( logger ){
	this.logger = logger;
	this.barrel = new Barrel( logger );
}

var inflicter = Inflicter.prototype;

/**
* Registers a new object-type lister
*
* @method addicts
* @param {Object} object Object
* @param {Array of String} eventNames Array of eventnames
* @param {Array of Function} fns Array of listener functions
*/
inflicter.addicts = function( object, eventNames, fns ){
	var fireflamstarter = new FireFlamestarter( Firestarter, this.barrel, object, eventNames, fns, this.logger );

	this.barrel.affiliate( fireflamstarter );
};

/**
* Registers a new function-type lister
*
* @method addict
* @param {String} name Name of the listener - needed for logging
* @param {String} eventName Eventname subscription
* @param {Function} fn Listener function
*/
inflicter.addict = function( name, eventName, fn ){
	var firestarter = new Firestarter( this.barrel, name, eventName, fn, this.logger );

	this.barrel.affiliate( firestarter );
};

/**
* Creates a new event-flow by a starting-event.
* The parameter list is a vararg, see parameters below
*
* @method ignite
* @param {String} source Name of the listener - needed for logging, mandatory
* @param {String} event Name of the even to emit, mandatory
* @param {String} params A vararg element possessing the objects to be sent with the message. Can be empty
* @param {Function} callback Mandatory callback function as last element.
*/
inflicter.ignite = function( ){
	var source = arguments[ 0 ];
	var event = arguments[ 1 ];

	var hasCallback = _.isFunction( arguments[ arguments.length-1 ] );
	var params = [].slice.call(arguments, 2, hasCallback ? arguments.length-1 : arguments.length );
	var callback = hasCallback ? arguments[ arguments.length-1 ] : null;

	var comm = new Communication( null, null, null, source, event, params, callback );

	this.logger.debug('Initiate ignition: ', comm );

	this.barrel.intoxicate( comm );
};

module.exports = Inflicter;
