var Communication = require('../lib/Communication');
var Barrel = require('../lib/Barrel');
var Firestormstarter = require('../lib/Firestormstarter');
var Flamestarter = require('../lib/Flamestarter');

var ES6Fixer = require('./ES6Fixer');

var VERSION = exports.VERSION = '0.7.5';

function extend(obj, extension){
	for(var key in extension){
		if( extension[key] )
			obj[key] = extension[key];
	}
	return obj;
}

function DummyLogger(){ }
var consoleFn = function() { console.log( arguments ); };
DummyLogger.prototype.log = consoleFn;
DummyLogger.prototype.silly = consoleFn;
DummyLogger.prototype.debug = consoleFn;
DummyLogger.prototype.verbose = consoleFn;
DummyLogger.prototype.info = consoleFn;
DummyLogger.prototype.warn = consoleFn;
DummyLogger.prototype.error = function() { console.error( arguments ); };


/**
* Main control point of the messaging subsystem
*
* @class Inflicter
* @constructor
*/
function Inflicter( options ){
	this.name = this.context = 'Inflicter';

	this.options = options || {};

	var self = this;

	self.logger = this.options.logger || new DummyLogger();
	self.logger.harconlog = function( err, message, obj, level ){
		this.log( err ? 'error' : (level || 'debug'), err ? err.message : message, extend( obj || {}, { 'harcon': VERSION } ) );
	}.bind( self.logger );

	this.barrel = new Barrel( this.name, this.logger );

	this.inflicterContext = (this.options.context || {});
	this.inflicterContext.logger = this.logger;

	Communication.setupSecurity( this.options.idLength || 16 );

	this.systemFirestarter = this.barrel.systemFirestarter = this.addicts( {
		name: self.name,
		options: self.options,
		barrel: self.barrel,
		logger: self.logger,
		context: self.context,
		detracts: self.detracts,
		addicts: self.addicts,
		addict: self.addict
	} );
}

var inflicter = Inflicter.prototype;

inflicter.listeners = function(){
	return this.barrel.listeners( );
};

inflicter.listener = function( name ){
	return this.barrel.listener( name );
};

/**
* Unregisters a new object-type lister
*
* @method detracts
* @param {Object} object Object
*/
inflicter.detracts = function( object ){
	return this.barrel.castOf( object.name );
};

/**
* Registers a new object-type lister
*
* @method addicts
* @param {Object} object Object
*/
inflicter.addicts = function( object ){
	this.detracts( object );

	object.inflicterContext = this.inflicterContext;
	var fss = new Firestormstarter( this.barrel, object, this.logger );

	if( object.init ){
		try{
			var componentConfig = this.options[fss.name] || {};
			componentConfig.inflicter = this;
			object.init( componentConfig );
		} catch( err ){
			this.logger.error( err, 'Unable to initialize', fss.name );
		}
	}

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
	var flamestarter = new Flamestarter( this.barrel, name, eventName, fn, this.logger );

	return this.barrel.affiliate( flamestarter );
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
