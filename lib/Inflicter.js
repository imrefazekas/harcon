var Communication = require('../lib/Communication');
var Barrel = require('../lib/Barrel');
var Blower = require('../lib/Blower');
var Firestormstarter = require('../lib/Firestormstarter');
var Flamestarter = require('../lib/Flamestarter');

var ES7Fixer = require('./ES7Fixer');

var VERSION = exports.VERSION = '2.8.0';

var _ = require('isa.js');

function purify( obj, config, level, path ) {
	if(!obj) return obj;
	if( _.isDate(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isString(obj) || _.isRegExp(obj)  )
		return obj;
	if( _.isFunction(obj) )
		return 'fn(){}';
	if( _.isArray(obj) ){
		var arr = [];
		obj.forEach( function( element ){
			if( path.includes( element ) ) return;
			path.push( element );
			arr.push( arr.length > config.arrayMaxSize ? '...' : purify( element, config, level+1, path ) );
		} );
		return arr;
	}
	if( _.isObject(obj) ){
		var res = {};
		for(var key in obj)
			if( key && obj[key] ){
				if( path.includes( obj[key] ) ) continue;
				path.push( obj[key] );
				res[key] = level > config.maxLevel ? '...' : purify( obj[key], config, level+1, path );
			}
		return res;
	}
	return '...';
}

function extend(obj, extension){
	for(var key in extension){
		if( extension[key] )
			obj[key] = extension[key];
	}
	return obj;
}

function DummyLogger(){ }
var consoleFn = function() { console.log( arguments ); };
var dlp = DummyLogger.prototype;
dlp.log = dlp.silly = dlp.debug = dlp.verbose = dlp.info = dlp.warn = consoleFn;
DummyLogger.prototype.error = function() { console.error( arguments ); };


/**
* Main control point of the messaging system
*
* @class Inflicter
* @constructor
*/
function Inflicter( options, callback ){
	this.options = options || {};
	this.options.name = this.options.name || 'Inflicter';
	this.options.context = this.options.context || this.options.name;
	this.options.division = this.options.division || this.options.name;

	this.name = this.options.name;
	this.context = this.options.context;
	this.division = this.options.division;
	this.divisionList = this.options.divisions || [];

	var self = this;

	this.Blower = this.options.Blower || Blower;

	Communication.setupSecurity( self.options.idLength || 16 );

	self.purifyConfig = { arrayMaxSize: this.options.arrayMaxSize || 100, maxLevel: this.options.maxLevel || 3 };
	self.logger = this.options.logger || new DummyLogger();
	self.logger.harconlog = function( err, message, obj, level ){
		this.log( err ? 'error' : (level || 'debug'), err ? err.message : message, extend( purify(obj || {}, self.purifyConfig, 0, []), { 'harcon': VERSION } ) );
	}.bind( self.logger );

	this.Barrel = this.options.Barrel || Barrel;
	this.Firestormstarter = this.options.Firestormstarter || Firestormstarter;
	this.Flamestarter = this.options.Flamestarter || Flamestarter;

	this.barrel = new this.Barrel( );
	this.barrel.init( extend( this.options.barrel || {}, { name: this.name, division: this.division, logger: this.logger } ), function(err){
		self.divisionList.forEach(function( division ){
			self.barrel.addDivision( division );
		});

		self.inflicterContext = (self.options.environment || {});
		self.inflicterContext.logger = self.logger;

		self.sliceArguments = function( ){
			var args = new Array(arguments.length);
			for(var i = 0; i < args.length; i+=1) {
				args[i] = arguments[i];
			}
			return args;
		};

		self.systemFirestarter = self.barrel.systemFirestarter = self.addicts( {
			name: 'Inflicter',
			options: self.options,
			Barrel: self.Barrel,
			Blower: self.Blower,
			Firestormstarter: self.Firestormstarter,
			Flamestarter: self.Flamestarter,
			barrel: self.barrel,
			logger: self.logger,
			division: self.division,
			context: self.context,
			detracts: self.detracts,
			addicts: self.addicts,
			addict: self.addict,
			sliceArguments: self.sliceArguments,
			shifted: self.shifted
		}, {}, callback );

		self.logger.harconlog( null, 'Harcon started.', { }, 'info' );
	} );
}

var inflicter = Inflicter.prototype;

inflicter.shifted = function( component, callback ){
	callback();
};

inflicter.setWarper = function( division, warper ){
	return this.barrel.setWarper( division, warper );
};

inflicter.warpers = function(){
	return this.barrel.warpers( );
};

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
* Activates a component
*
* @method activity
* @param {String} name The name of the component to be activated
*/
inflicter.activate = function( name ){
	return this.barrel.activity( name, true );
};

/**
* Deactivates a component
*
* @method activity
* @param {String} name The name of the component to be activated
*/
inflicter.deactivate = function( name ){
	return this.barrel.activity( name, false );
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
inflicter.addicts = function( object, options, callback ){
	var self = this;
	this.detracts( object );

	if( object.division ){
		if( object.division !== self.division && !object.division.startsWith( self.division + '.' ) )
			object.division = self.division + '.' + object.division;
	}
	else object.division = self.division;

	object.inflicterContext = this.inflicterContext;
	var blower = new this.Blower( );
	blower.init( extend(this.options.blower || {}, {barrel: this.barrel}), function(err){
		if( err ) self.logger.error( err, 'Unable to init Blower' );
	} );
	var fss = new this.Firestormstarter( this.options, this.barrel, object, blower, this.logger );
	fss.sliceArguments = this.sliceArguments;

	if( object.init ){
		try{
			var componentConfig = options || this.options[fss.name] || this.options.fireContext || {};
			componentConfig.inflicter = this;
			object.init( componentConfig, function(err){ if(err){
				self.logger.harconlog( err );
			} } );
		} catch( err ){
			this.logger.error( err, 'Unable to initialize', fss.name );
			return callback( err );
		}
	}

	return this.barrel.affiliate( fss, function(err){
		if( callback )
			return callback( err, {
				harcon: self, name: fss.name, context: fss.context, division: fss.division, services: fss.services(), rest: !!object.rest, websocket: !!object.websocket
			} );
		if( err )
			this.logger.error( err, 'Unable to affiliate entity', fss.name );
	} );
};

/**
* Registers a new function-type lister
*
* @method addict
* @param {String} division, mandatory
* @param {String} name Name of the listener - needed for logging
* @param {String} eventName Eventname subscription
* @param {Function} fn Listener function
*/
inflicter.addict = function( division, name, eventName, fn ){
	var blower = new this.Blower( );
	blower.init( this.options.blower || {}, function(err){
		if( err ) self.logger.error( err, 'Unable to init Blower' );
	} );
	var flamestarter = new this.Flamestarter( this.options, this.barrel, division || this.division, name, eventName, fn, blower, this.logger );
	flamestarter.sliceArguments = this.sliceArguments;

	return this.barrel.affiliate( flamestarter );
};

/**
* Creates a new event-flow by a starting-event without external ID or division
* The parameter list is a vararg, see parameters below
*
* @method simpleIgnite
* @param {String} event Name of the even to emit, mandatory
* @param {String} params A vararg element possessing the objects to be sent with the message. Can be empty
* @param {Function} callback Mandatory callback function as last element.
*/
inflicter.simpleIgnite = function( ){
	var args = [ null, this.division ].concat( this.sliceArguments.apply( this, arguments ) );
	return this.systemFirestarter.ignite.apply( this.systemFirestarter, args );
};

/**
* Creates a new event-flow by a starting-event.
* The parameter list is a vararg, see parameters below
*
* @method ignite
* @param {String} external ID, mandatory, can be null
* @param {String} division, mandatory
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
inflicter.close = function( callback ){
	this.barrel.close( callback );
};


Inflicter.Communication = Communication;
Inflicter.Barrel = Barrel;
Inflicter.Blower = Blower;
Inflicter.Firestormstarter = Firestormstarter;
Inflicter.Flamestarter = Flamestarter;


module.exports = Inflicter;
