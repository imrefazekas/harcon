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

/**
* Registers a new firestarter instance
*
* @method affiliate
* @param {Firestarter or FireFlamestarter} firestarter The firestarter instance to add
*/
Barrel.prototype.affiliate = function( firestarter ){
	this.logger.debug('Affiliate: ', firestarter.name, firestarter.event );

	this.firestarters.push( firestarter );
};

/**
* Emits an event in the bus
*
* @method intoxicate
* @param {Communication} comm Communication object to deliver
*/
Barrel.prototype.intoxicate = function( comm ){
	var matching = _.filter( this.firestarters, function(firestarter){ return firestarter.matches( comm.event ); } );

	if( matching.length === 0 )
		return this.logger.warn('Nobody is listening', comm);

	var self = this;

	var callChain = _.map( matching, function(firestarter){
		return function(callback){
			self.logger.debug('Emitting to:', firestarter.name );
			firestarter.burn( comm, callback );
		};
	} );
	async.series( callChain,
		function(err, results){
			self.logger.debug('Emitted with: ', err, results);

			if( comm.callback )
				comm.callback( err, results.length === 0 ? null : results );
		}
	);
};

module.exports = Barrel;
