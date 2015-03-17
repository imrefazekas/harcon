var async = require('async');
var _ = require('lodash');

var Liner = require('./warpers/Liner');
var liner = new Liner();

var Stopper = require('./warpers/Stopper');
var stopper = new Stopper();

/**
* Message bus to deliver events to listeners
*
* @class Barrel
* @constructor
*/
function Barrel( systemName, logger, groupMessages ){
	this.firestarters = [ ];
	this.warpers = {};
	this.systemName = systemName;
	this.logger = logger;
	this.systemFirestarter = null;

	this.setWarper( '*', groupMessages ? liner : stopper );
}
var barrel = Barrel.prototype;

barrel.setWarper = function( division, warper ){
	var self = this;
	if( this.warpers[division] && warper ){
		this.warpers[division] = warper;
		warper.barrel = self;
	}
};

barrel.warpers = function(){
	return this.warpers;
};

barrel.addDivision = function( division ){
	this.setWarper( division, liner );
};

barrel.divisions = function(){
	return _.keys( this.warpers );
};

barrel.listeners = function( division ){
	var fss = division ? this.firestarters.filter(function(fs){ return fs.division === division; }) : this.firestarters;
	var names = fss.map( function(fs){ return fs.name; } );
	return names;
};

barrel.listener = function( name ){
	var fs = this.firestarters.find( function(fs){ return fs.name === name; } );
	return fs.fn ? fs.fn : fs.object;
};

barrel.isSystemEvent = function( eventName ){
	return this.systemFirestarter ? eventName.startsWith( this.systemFirestarter.name + '.' ) : false;
};

barrel.igniteSystemEvent = function(){
	if(this.systemFirestarter){
		var args = [ null, this.systemFirestarter.division, this.systemFirestarter.name + '.' + arguments[0] ];
		for(var i=1; i<arguments.length; i+=1)
			args.push( arguments[i] );
		this.systemFirestarter.ignite.apply( this.systemFirestarter, args );
	}
};

/**
* Activates a firestarter instance
*
* @method activate
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to activate
*/
barrel.activate = function( name ){
	this.logger.harconlog( null, 'Activate', { name: name }, 'info' );
	var index = this.firestarters.findIndex( function(element){ return element.name === name; } );
	if( index !== -1)
		this.firestarters[ index ].active = true;
};

/**
* Deactivates a firestarter instance
*
* @method deactivate
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to deactivate
*/
barrel.deactivate = function( name ){
	this.logger.harconlog( null, 'Deactivate', { name: name }, 'info' );
	var index = this.firestarters.findIndex( function(element){ return element.name === name; } );
	if( index !== -1)
		this.firestarters[ index ].active = false;
};


/**
* Deregisters a firestarter instance
*
* @method castOf
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to remove
*/
barrel.castOf = function( name ){
	this.logger.harconlog( null, 'CastOf', { name: name }, 'info' );
	var index = this.firestarters.findIndex( function(element){ return element.name === name; } );
	if( index !== -1) {
		var fs = this.firestarters[ index ];
		this.firestarters.splice(index, 1);
		this.igniteSystemEvent( 'castOf', name, fs );
		fs.close();
	}
};

/**
* Registers a new firestarter instance
*
* @method affiliate
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to add
*/
barrel.affiliate = function( firestarter ){
	this.logger.harconlog( null, 'Affiliate', { name: firestarter.name, division: firestarter.division, context: firestarter.context, events: firestarter.event || firestarter.events }, 'info' );

	if( this.firestarters.find( function(element){ return element.name === firestarter.name; } ) )
		throw new Error('There is a published component with such name', firestarter.name );

	this.igniteSystemEvent( 'affiliate', firestarter );

	this.firestarters.push( firestarter );
	this.addDivision( firestarter.division );
	return firestarter;
};

/**
* Collects matching firestarter instances to the passed {Communication} response object
*
* @method matchingResponse
* @param {Communication} comm The communication instance
*/
barrel.matchingResponse = function(comm){
	return this.firestarters.filter( function( fs ){ return fs.active && ( (comm.source === fs.name) || (fs.listeningToResponses && fs.matches( comm.division, comm.event ) ) ); } );
};

/**
* Collects matching firestarter instances to the passed {Communication} object
*
* @method matching
* @param {Communication} comm The communication instance
*/
barrel.matching = function(comm){
	return this.firestarters.filter( function( fs ){ return fs.active && fs.matches( comm.division, comm.event ); } );
};

/**
* Emits a response in the bus
*
* @method appease
* @param {Communication} comm Communication response object to deliver
*/
barrel.appease = function( comm, err, responseComms ){
	var self = this;

	this.logger.harconlog( err, 'Appeasing', { responseComms: responseComms } );

	self.matchingResponse( comm ).forEach( function( fs ){
		fs.appease( err, comm, responseComms );
	} );
};

/**
* Emits an event in the bus
*
* @method intoxicate
* @param {Communication} comm Communication object to deliver
*/
barrel.intoxicate = function( comm ){
	var self = this;

	if( this.warpers[ comm.division ] && !this.warpers[ comm.division ].allow(comm) )
		return self.appease( comm, new Error('Communication has been blocked.'), [] );

	var matching = this.matching( comm );

	if( matching.length === 0 ){
		if( self.isSystemEvent( comm.event ) ) return false;

		if( comm.callback )
			self.appease( comm, new Error('Nobody is listening'), null );
		return this.logger.harconlog( new Error('Nobody is listening'), 'Nobody is listening', {comm: comm.shallow() }, 'warn');
	}

	var callChain = matching.map( function( fs ){
		return function( cb ){
			self.logger.harconlog( null, 'Emitting', { name: fs.name, comm: comm.shallow() } );
			fs.burn( comm, cb );
		};
	} );
	async.series( callChain,
		function(err, results){
			self.logger.harconlog( err, 'Emitted with: ', { results: results } );

			if( comm.callback ){
				self.appease( comm, err, results );
			}
		}
	);
};

barrel.close = function( ){
	var self = this;

	this.logger.harconlog( null, 'Closing harcon...', { }, 'info' );

	this.igniteSystemEvent( 'close' );

	self.firestarters.forEach( function( fs ){
		if( fs.close ){
			fs.close();
		}
	} );
};

module.exports = Barrel;
