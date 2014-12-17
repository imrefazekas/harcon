var async = require('async');

/**
* Message bus to deliver events to listeners
*
* @class Barrel
* @constructor
*/
function Barrel( systemName, logger ){
	this.firestarters = [ ];
	this.systemName = systemName;
	this.logger = logger;
	this.systemFirestarter = null;
}
var barrel = Barrel.prototype;

barrel.listeners = function( ){
	var names = this.firestarters.map( function(fs){ return fs.name; } );
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
		var args = [ this.systemFirestarter.division, this.systemFirestarter.name + '.' + arguments[0] ];
		for(var i=1; i<arguments.length; i+=1)
			args.push( arguments[i] );
		this.systemFirestarter.ignite.apply( this.systemFirestarter, args );
	}
};

/**
* Deregisters a firestarter instance
*
* @method castOf
* @param {Firestarter or FireFlamestarter} firestarter The firestarter instance to remove
*/
barrel.castOf = function( name ){
	this.logger.harconlog( null, 'CastOf', { name: name } );
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
* @param {Firestarter or FireFlamestarter} firestarter The firestarter instance to add
*/
barrel.affiliate = function( firestarter ){
	this.logger.harconlog( null, 'Affiliate', { name: firestarter.name, events: firestarter.event || firestarter.events } );

	if( this.firestarters.find( function(element){ return element.name === firestarter.name; } ) )
		throw new Error('There is a published component with such name', firestarter.name );

	this.igniteSystemEvent( 'affiliate', firestarter );

	this.firestarters.push( firestarter );
	return firestarter;
};

/**
* Emits a response event in the bus
*
* @method appease
* @param {Communication} comm Communication response object to deliver
*/
barrel.appease = function( comm, err, responseComms ){
	var self = this;

	this.logger.harconlog( err, 'Appeasing', { responseComms: responseComms } );

	self.firestarters.forEach( function( fs ){
		if( (comm.source === fs.name) || (fs.listeningToResponses && fs.matches( comm.division, comm.event ) ) ){
			fs.appease( err, comm, responseComms );
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
	var self = this;
	var matching = this.firestarters.filter( function( fs ){ return fs.matches( comm.division, comm.event ); } );

	if( matching.length === 0 ){
		if( self.isSystemEvent( comm.event ) ) return;

		if( comm.callback )
			self.appease( comm, new Error('Nobody is listening'), null );
		return this.logger.harconlog( new Error('Nobody is listening'), 'Nobody is listening', {comm: comm }, 'warn');
	}

	var callChain = matching.map( function( fs ){
		return function( cb ){
			self.logger.harconlog( null, 'Emitting', { name: fs.name, comm: comm } );
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

	this.igniteSystemEvent( 'close' );

	self.firestarters.forEach( function( fs ){
		if( fs.close ){
			fs.close();
		}
	} );
};

module.exports = Barrel;
