var Communication = require('../lib/Communication');
var Barrel = require('../lib/Barrel');
var Firestormstarter = require('../lib/Firestormstarter');
var Flamestarter = require('../lib/Flamestarter');


var VERSION = exports.VERSION = '0.7.5';
var Logger = require('../lib/Logger');
/**
* Main control point of the messaging subsystem
*
* @class Inflicter
* @constructor
*/
function Inflicter( options ){
	this.name = this.context = 'Inflicter';

	this.options = options || {};

	this.logger = Logger.createLogger( 'harcon', { 'harcon': VERSION }, this.options.logger );

	this.barrel = new Barrel( this.logger );

	this.inflicterContext = (this.options.context || {});
	this.inflicterContext.logger = this.logger;

	Communication.setupSecurity( this.options.idLength || 16 );

	if( !Array.prototype.contains )
		Array.prototype.contains = function( object ){
			for( var i = 0; i<this.length; i+=1){
				if( object === this[i] ) return true;
			}
			return false;
		};
	if( !Array.prototype.find )
		Array.prototype.find = function( fn ){
			for( var i = 0; i<this.length; i+=1){
				if( fn(this[i], i, this) ) return this[i];
			}
			return null;
		};
	if( !Array.prototype.findIndex )
		Array.prototype.findIndex = function( fn ){
			for( var i = 0; i<this.length; i+=1){
				if( fn(this[i], i, this) ) return i;
			}
			return -1;
		};
	if (!String.prototype.endsWith) {
		Object.defineProperty(String.prototype, 'endsWith', {
			value: function (searchString, position) {
				var subjectString = this.toString();
				if (position === undefined || position > subjectString.length) {
					position = subjectString.length;
				}
				position -= searchString.length;
				var lastIndex = subjectString.indexOf(searchString, position);
				return lastIndex !== -1 && lastIndex === position;
			}
		});
	}

	var self = this;
	this.systemFirestarter = this.addicts( {
		name: self.name,
		barrel: self.barrel,
		logger: self.logger,
		context: self.context,
		detracts: self.detracts,
		addicts: self.addicts,
		addict: self.addict
	} );

	if( this.options.watch ){
		var Publisher = require('./Publisher');
		this.addicts( Publisher );
		Publisher.watch( this.options.watch.folder, this.options.watch.timeout );
	}
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
