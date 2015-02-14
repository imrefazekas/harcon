var Communication = require('./Communication');

function isFunction(value) {
	return typeof value === 'function' || false;
}

var toString = Object.prototype.toString;
function isString(obj) {
	return "[object String]" === toString.call(obj);
}

/**
* Firestarter is an abstract type to define a wrapper for listeners
*
* @class Firestarter
* @constructor
*/
function Firestarter( division ){
	this.division = division || '';
	this.active = true;
	this.terms = {};
}

var firestarter = Firestarter.prototype;

firestarter.addTerms = function(externalID, terms){
	if( externalID && terms && !this.terms[ externalID ] )
		this.terms[ externalID ] = terms;
};

/**
* Retrieves the array of events it is listening
*/
firestarter.services = function( ){
	throw new Error('To be implemented...');
};


/**
* Validates division of an incoming message
*/
firestarter.sameDivision = function( division ){
	var div = division || '';

	if( div === '*' )
		return true;

	if( !this.divisionPath )
		this.divisionPath = this.division.split('.');

	var dPath = div.split('.'), i = 0;
	for( i=0; i<this.divisionPath.length; i+=1 ){
		if( i >= dPath.length || (this.divisionPath[i] && this.divisionPath[i] !== dPath[i]) ) return false;
	}
	return true;
};

/**
* Matches the emited event with the interest of the entity encapsulated by this firestarter
*
* @method matches
* @param {String} eventName Tells if the given firestarter is listening to the given event
* @return {Boolean} Returns true on matching
*/
firestarter.matches = function( division, eventName ){
	throw new Error('To be implemented...');
};

/**
* Conformise the response comm objects
*
* @method conformResponse
* @param {Communication} responseComms Response array containing Communication objects
* @return {Object} Return response
*/
firestarter.conformResponse = function( error, responseComms ){
	if( error ) return { err: error, res: null };

	var err, res;

	if( Array.isArray(responseComms) ){
		err = responseComms.map( function(responseComm){ return responseComm.error; } ).filter( function(er){ return er; });
		err = err.length === 0 ? null : err[0];

		res = responseComms.map( function(responseComm){ return responseComm.response; } ).filter( function(resp){ return resp; });
		if( res.length === 0 ) res = null;
	}
	else{
		err = responseComms.error;
		res = responseComms.response;
	}
	return { err: err, res: res };
};

/**
* Transfers a response event to the source
*
* @method appease
* @param {Communication} comm Communication response object to deliver
*/
firestarter.appease = function( error, comm, responseComms ){
	if( this.comms[ comm.id ] ){
		var response = this.conformResponse( error, responseComms );
		if( this.comms[ comm.id ].callback )
			this.comms[ comm.id ].callback( response.err, response.res );
		delete this.comms[ comm.id ];
	}
};

firestarter.getServiceFn = function( comm ){
	throw new Error('To be implemented...');
};

firestarter.innerBurn = function( comm, callback, serviceFn, igniteFn, params ){
	throw new Error('To be implemented...');
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

	this.logger.harconlog(null, 'Burning', {comm: comm.shallow()} );

	var serviceFn = this.getServiceFn( comm );
	var igniteFn = function( ){ self.burst( comm, arguments ); };
	var callbackFn = function(err, res){ callback( err, comm.twist(self.name, err, res) ); };
	var params = [].concat( comm.params ).concat( serviceFn.length > comm.params.length+2 ? comm.terms : [] ).concat( serviceFn.length > comm.params.length+1 ? igniteFn : [] ).concat( callbackFn );

	this.innerBurn( comm, callback, serviceFn, igniteFn, params );
};

/**
* Distpaches the burst event to be emited within the flow of a previous event
*
* @method burst
* @param {Communication} comm The communication object representing the event to be emited.
* @param {Array} params Parameters associatd with the communication to send with
*/
firestarter.burst = function( comm, params ){
	var self = this;
	var event = params[ 0 ];
	var hasCallback = params.length>0 && isFunction( params[ params.length-1 ] );
	var call_params = self.sliceArguments.apply( self, arguments ).slice( 1, hasCallback ? params.length-1 : params.length );
	var callback = hasCallback ? params[ params.length-1 ] : null;

	var newComm = comm.burst( this.name, event, call_params, callback );

	this.logger.harconlog( null, 'Igniting', {newComm: newComm.shallow(), comm: comm.shallow()} );

	if( newComm.callback )
		this.comms[ newComm.id ] = { callback: newComm.callback };

	this.barrel.intoxicate( newComm );
};

firestarter.simpleIgnite = function( ){
	var self = this;
	var externalId = arguments[ 0 ];
	var division = arguments[ 1 ];
	var event = arguments[ 2 ];
	var hasCallback = isFunction( arguments[ arguments.length-1 ] );
	var params = self.sliceArguments.apply( self, arguments ).slice( 3, hasCallback ? arguments.length-1 : arguments.length );
	var callback = hasCallback ? arguments[ arguments.length-1 ] : null;

	var comm = Communication.newCommunication( null, null, externalId, division, this.name, event, params, callback );
	if( externalId && self.terms[externalId] ){
		comm.terms = self.terms[externalId];
		delete self.terms[externalId];
	}

	this.logger.harconlog(null, 'Initiate ignition', {comm: comm.shallow()} );
	if( comm.callback )
		this.comms[ comm.id ] = { comm: comm, callback: comm.callback };

	this.barrel.intoxicate( comm );

	return comm.id;
};

/**
* Distpaches the new event to be emited
*
* @method ignite
* @param varargs defining attributes of a communication: eventName [list of parameters] [callback]
*/
firestarter.ignite = function( ){
	var self = this;
	var externalId = arguments[ 0 ];
	var division = arguments[ 1 ];
	var event = arguments[ 2 ];
	if( isString(event) )
		return this.simpleIgnite.apply( this, arguments );
	if( Array.isArray(event) ){
		var hasCallback = isFunction( arguments[ arguments.length-1 ] );
		if( !hasCallback ){
			var ids = [];
			var _arguments = self.sliceArguments.apply( self, arguments ).slice( 3 );
			event.forEach( function(ev){
				var args = [externalId, division, ev].concat( _arguments );
				ids.push( this.simpleIgnite.apply( this, args ) );
			} );
			return ids;
		}
	}
	throw new Error( 'Invalid parameters' );
};

firestarter.close = function( ){
};

module.exports = Firestarter;
