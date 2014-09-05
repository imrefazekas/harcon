var _ = require('lodash');

var Communication = require('./Communication');

/**
* Firestarter is a wrapper for listeners defined as pure functions
*
* @class Firestarter
* @constructor
*/
function Firestarter( barrel, name, eventName, fn, logger ){
	this.isRegex = _.isRegExp( eventName );
	this.isString = _.isString( eventName );

	this.path = this.isString ? eventName.split( '.' ) : [];
	this.pathLength = this.path.length;

	this.barrel = barrel;
	this.name = name;
	this.event = eventName;
	this.fn = fn;

	this.logger = logger;

	this.comms = {};
}

var firestarter = Firestarter.prototype;

firestarter.innermatches = function( eventName ){
	if( this.event === '*' )
		return true;

	if( this.isRegex )
		return this.event.test( eventName );

	if( this.isString ){
		var eventPath = eventName.split( '.' );
		for(var i = 0, len = eventPath.length; i < len && i < this.pathLength; i+=1) {
			if( this.path[i] === '*' )
				return true;
			if( this.path[i] !== eventPath[i] )
				return false;
		}
		return true;
	}

	return false;
};
/**
* Matches the emited event with the interest of the entity encapsulated by this firestarter
*
* @method matches
* @param {String} eventName Tells if the given firestarter is listening to the given event
* @return {Boolean} Returns true on matching
*/
firestarter.matches = function( eventName ){
	var matches = this.innermatches( eventName );

	this.logger.harconlog(null, 'Matching: ', {event: this.event, eventName: eventName, matches: matches}, 'silly' );

	return matches;
};

firestarter.appease = function( comm, responseComms ){
	if( this.comms[ comm.id ] ){
		var err, res;

		if( Array.isArray(responseComms) ){
			err = _.filter( _.map( responseComms, function(responseComm){ return responseComm.error; } ), function(er){ return er; });
			if( err.length === 0 ) err = null;

			res = _.filter( _.map( responseComms, function(responseComm){ return responseComm.response; } ), function(resp){ return resp; });
			if( res.length === 0 ) res = null;
		}
		else{
			err = responseComms.error;
			res = responseComms.response;
		}

		this.comms[ comm.id ]( err, res );
		delete this.comms[ comm.id ];
	}
};

/**
* Distpaches the emited event to the listener
*
* @method burn
* @param {Communication} comm The communication object representing the event emited.
* @param {Function} callback Async callback function to be called when execution finished
*/
firestarter.burn = function( comm, callback ){
	var self = this;

	this.logger.harconlog(null, 'Burning: ', {comm: comm} );

	self.fn.apply(
		{ comm: comm, ignite: function( ){
				self.burst( comm, arguments );
		} },
		[].concat( comm.params ).concat( function(err, res){ callback( err, comm.twist(self.name, err, res) ); } )
	);
};

/**
* Distpaches the new event to be emited
*
* @method ignite
* @param varargs defining attributes of a communication: eventName [list of parameters] [callback]
*/
firestarter.ignite = function( ){
	var event = arguments[ 0 ];

	var hasCallback = _.isFunction( arguments[ arguments.length-1 ] );
	var params = [].slice.call(arguments, 1, hasCallback ? arguments.length-1 : arguments.length );
	var callback = hasCallback ? arguments[ arguments.length-1 ] : null;

	var comm = Communication.newCommunication( null, null, null, this.name, event, params, callback );

	this.logger.harconlog(null, 'Initiate ignition: ', {comm: comm} );

	if( comm.callback )
		this.comms[ comm.id ] = comm.callback;

	this.barrel.intoxicate( comm );

	return comm.id;
};

/**
* Distpaches the burst event to be emited within the flow of a previous event
*
* @method burst
* @param {Communication} comm The communication object representing the event to be emited.
* @param {Array} params Parameters associatd with the communication to send with
*/
firestarter.burst = function( comm, params ){
	var event = params[ 0 ];
	var hasCallback = _.isFunction( params[ params.length-1 ] );
	var call_params = [].slice.call(params, 1, hasCallback ? params.length-1 : params.length );
	var callback = hasCallback ? params[ params.length-1 ] : null;

	var newComm = comm.burst( this.name, event, call_params, callback );

	this.logger.harconlog( null, 'Igniting: ', {newComm: newComm, comm: comm} );

	if( newComm.callback )
		this.comms[ newComm.id ] = newComm.callback;

	this.barrel.intoxicate( newComm );
};

module.exports = Firestarter;
