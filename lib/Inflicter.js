var _ = require('lodash');

var Communication = require('../lib/Communication');
var Barrel = require('../lib/Barrel');
var Firestarter = require('../lib/Firestarter');
var Firestormstarter = require('../lib/Firestormstarter');


var VERSION = exports.VERSION = '0.7.0';
var winston = require('winston');
var harconlog = function( err, message, obj, level ){
	this.log( err ? 'error' : (level || 'debug'), err ? err.message : message, _.extend( obj || {}, { 'harcon': VERSION } ) );
};
var createWinstonLogger = function( options ){
	options = options || {};
	if( options.exceptionFile )
		winston.handleExceptions(new winston.transports.File({ filename: options.exceptionFile }));
	var transports = [
		new (winston.transports.Console)({ level: 'error', colorize: 'true' }),
		new (winston.transports.File)( {
			filename: options.file || 'server.log',
			level: options.level || 'info',
			maxsize: options.maxSize || 1000000,
			maxFiles: options.maxFiles || 1
		} )
	];
	return new (winston.Logger)({ transports: transports });
};

/**
* Main control point of the messaging subsystem
*
* @class Inflicter
* @constructor
*/
function Inflicter( options ){
	this.options = options || {};
	this.name = this.options.name || 'Inflicter';

	this.logger = this.options.logger ? ( this.options.logger.level ? createWinstonLogger( this.options.logger ) : this.options.logger ) : createWinstonLogger( {} );
	this.logger.harconlog = harconlog.bind( this.logger );

	this.barrel = new Barrel( this.logger );

	this.context = this.options.context || {};
	this.context.logger = this.logger;

	Communication.setupSecurity( this.options.idLength || 16 );

	this.systemFirestarter = this.addict( this.name, this.name, this.options.fn );
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
inflicter.addicts = function( object ){
	object.inflicterContext = this.context;
	var fss = new Firestormstarter( this.barrel, object, this.logger );

	return this.barrel.affiliate( fss );
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

	return this.barrel.affiliate( firestarter );
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
	return this.systemFirestarter.ignite.apply( this.systemFirestarter, arguments );
};

/**
* Notifies the harcon event-system to close all open connection
*
* @method close
*/
inflicter.close = function( ){
	this.barrel.close();
};

module.exports = Inflicter;
