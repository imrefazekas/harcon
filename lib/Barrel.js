var async = require('async');
var _ = require('lodash');

/**
* Message bus to deliver events to listeners
*
* @class Barrel
* @constructor
*/
function Barrel( logger ){
	this.firestarters = [ ];
	this.logger = logger;
}
var barrel = Barrel.prototype;

/**
* Registers a new firestarter instance
*
* @method affiliate
* @param {Firestarter or FireFlamestarter} firestarter The firestarter instance to add
*/
barrel.affiliate = function( firestarter ){
	this.logger.debug('Affiliate: ', firestarter.name, firestarter.event || firestarter.events );

	console.log( 'firestarter::::', firestarter );
	this.firestarters.push( firestarter );

	return firestarter;
};

/**
* Emits an response event in the bus
*
* @method appease
* @param {Communication} comm Communication response object to deliver
*/
barrel.appease = function( comm, err, responseComms ){
	var self = this;

	this.logger.debug('Appeasing', err, responseComms );

	if( err )
		return this.logger.error('Error occurred: ', err );

	_.each( self.firestarters, function( fs ){
		if( (comm.source === fs.name) || (fs.listeningToResponses && fs.matches( comm.event ) ) ){
			fs.appease( comm, responseComms );
		}
	} );
};

/**
* Emits an event in the bus
*
* @method intoxicate
* @param {Communication} comm Communication object to deliver
*/
barrel.intoxicate = function( comm ){
	var matching = _.filter( this.firestarters, function( fs ){ return fs.matches( comm.event ); } );

	if( matching.length === 0 )
		return this.logger.warn('Nobody is listening', comm);

	var self = this;

	var callChain = _.map( matching, function( fs ){
		return function( cb ){
			self.logger.debug('Emitting', fs.name, comm );
			fs.burn( comm, cb );
		};
	} );
	async.series( callChain,
		function(err, results){
			self.logger.debug('Emitted with: ', err, results);

			if( comm.callback )
				self.appease( comm, err, results );
		}
	);
};

barrel.close = function( ){
	var self = this;

	console.log( self.firestarters );
	_.each( self.firestarters, function( fs ){
		if( fs.close ){
			fs.close();
		}
	} );
};

module.exports = Barrel;
