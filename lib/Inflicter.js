var Communication = require('../lib/Communication');
var Barrel = require('../lib/Barrel');
var Firestormstarter = require('../lib/Firestormstarter');
var Flamestarter = require('../lib/Flamestarter');

var ES6Fixer = require('./ES6Fixer');

var VERSION = exports.VERSION = '1.4.0';

var _ = require('lodash');

function purify( obj, config, level, path ) {
	if(!obj) return obj;
	if( _.isDate(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isString(obj) || _.isRegExp(obj)  )
		return obj;
	if( _.isFunction(obj) )
		return 'fn(){}';
	if( _.isArray(obj) ){
		var arr = [];
		obj.forEach( function( element ){
			if( path.contains( element ) ) return;
			path.push( element );
			arr.push( arr.length > config.arrayMaxSize ? '...' : purify( element, config, level+1, path ) );
		} );
		return arr;
	}
	if( _.isObject(obj) ){
		var res = {};
		for(var key in obj)
			if( key && obj[key] ){
				if( path.contains( obj[key] ) ) continue;
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
function Inflicter( options ){
	this.name = this.context = 'Inflicter';

	this.options = options || {};

	this.division = this.options.division || '';
	this.divisionDeviation = !!this.options.divisionDeviation;

	var self = this;

	self.purifyConfig = { arrayMaxSize: this.options.arrayMaxSize || 100, maxLevel: this.options.maxLevel || 3 };
	self.logger = this.options.logger || new DummyLogger();
	self.logger.harconlog = function( err, message, obj, level ){
		this.log( err ? 'error' : (level || 'debug'), err ? err.message : message, extend( purify(obj || {}, self.purifyConfig, 0, []), { 'harcon': VERSION } ) );
	}.bind( self.logger );

	this.Barrel = this.options.Barrel || Barrel;
	this.Firestormstarter = this.options.Firestormstarter || Firestormstarter;
	this.Flamestarter = this.options.Flamestarter || Flamestarter;

	this.barrel = new this.Barrel( );
	this.barrel.init( this.name, this.logger, _.assign( this.options.barrel || {}, { groupMessages: !!this.options.groupMessages } ) );

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
		Barrel: self.Barrel,
		Firestormstarter: self.Firestormstarter,
		Flamestarter: self.Flamestarter,
		barrel: self.barrel,
		logger: self.logger,
		division: self.division,
		divisionDeviation: self.divisionDeviation,
		context: self.context,
		detracts: self.detracts,
		addicts: self.addicts,
		addict: self.addict,
		sliceArguments: self.sliceArguments
	} );

	self.logger.harconlog( null, 'Harcon started.', { }, 'info' );
}

var inflicter = Inflicter.prototype;

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

	if( !object.division )
		object.division = self.division;
	if( object.division !== self.division && !self.divisionDeviation )
		return this.logger.error( new Error('Object violates division deviation rule.'), object.name );

	object.inflicterContext = this.inflicterContext;
	var fss = new this.Firestormstarter( this.options, this.barrel, object, this.logger );
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
		}
	}

	return this.barrel.affiliate( fss );
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
	var flamestarter = new this.Flamestarter( this.options, this.barrel, division, name, eventName, fn, this.logger );
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
	var args = [ null, '' ].concat( this.sliceArguments.apply( this, arguments ) );
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
inflicter.close = function( ){
	this.barrel.close();
};


Inflicter.Communication = Communication;
Inflicter.Barrel = Barrel;
Inflicter.Firestormstarter = Firestormstarter;
Inflicter.Flamestarter = Flamestarter;


module.exports = Inflicter;
