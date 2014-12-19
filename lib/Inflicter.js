var Communication = require('../lib/Communication');
var Barrel = require('../lib/Barrel');
var Firestormstarter = require('../lib/Firestormstarter');
var Flamestarter = require('../lib/Flamestarter');

var ES6Fixer = require('./ES6Fixer');

var VERSION = exports.VERSION = '0.9.22';

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
* Main control point of the messaging system
*
* @class Inflicter
* @constructor
*/
function Inflicter( options ){
	this.name = this.context = 'Inflicter';

	this.options = options || {};

	this.division = '';

	var self = this;

	self.logger = this.options.logger || new DummyLogger();
	self.logger.harconlog = function( err, message, obj, level ){
		this.log( err ? 'error' : (level || 'debug'), err ? err.message : message, extend( obj || {}, { 'harcon': VERSION } ) );
	}.bind( self.logger );

	this.barrel = new Barrel( this.name, this.logger );

	this.inflicterContext = (this.options.context || {});
	this.inflicterContext.logger = this.logger;

	Communication.setupSecurity( this.options.idLength || 16 );

	this.sliceArguments = function( ){
		var args = new Array(arguments.length);
		for(var i = 0; i < args.length; i+=1) {
			args[i] = arguments[i];
		}
		return args;
	};

	this.systemFirestarter = this.barrel.systemFirestarter = this.addicts( {
		name: self.name,
		options: self.options,
		barrel: self.barrel,
		logger: self.logger,
		division: self.division,
		context: self.context,
		detracts: self.detracts,
		addicts: self.addicts,
		addict: self.addict,
		sliceArguments: self.sliceArguments
	} );

	self.logger.harconlog( null, 'Harcon started.', { }, 'info' );
}

var inflicter = Inflicter.prototype;

inflicter.divisions = function(){
	return this.barrel.divisions( );
};

inflicter.listeners = function( division ){
	return this.barrel.listeners( division );
};

inflicter.listener = function( name ){
	return this.barrel.listener( name );
};

/**
* Activate a firestarter instance
*
* @method activate
* @param {String} name The name of the component to be activated
*/
inflicter.activate = function( name ){
	return this.barrel.activate( name );
};

/**
* Deactivates a firestarter instance
*
* @method deactivate
* @param {String} name The name of the component to be deactivated
*/
inflicter.deactivate = function( name ){
	return this.barrel.deactivate( name );
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
inflicter.addicts = function( object, options ){
	var self = this;
	this.detracts( object );

	object.inflicterContext = this.inflicterContext;
	var fss = new Firestormstarter( this.barrel, object, this.logger );
	fss.sliceArguments = this.sliceArguments;

	if( object.init ){
		try{
			var componentConfig = options || this.options[fss.name] || {};
			componentConfig.inflicter = this;
			object.init( componentConfig, function(err){ if(err){
				self.logger.harconlog( err );
			} } );
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
inflicter.addict = function( name, eventName, fn, division ){
	var flamestarter = new Flamestarter( this.barrel, division, name, eventName, fn, this.logger );
	flamestarter.sliceArguments = this.sliceArguments;

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
