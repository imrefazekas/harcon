var Communication = require('./Communication');
var Fire = require('./Fire');

var _ = require('lodash');

function isFunction(value) {
	return typeof value === 'function' || false;
}

function isString(obj) {
	return Object.prototype.toString.call(obj) === "[object String]";
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function parameterNames( func ) {
	var fnStr = func.toString().replace(STRIP_COMMENTS, '');
	var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
	if(result === null)
		result = [];
	return result;
}
function isLast(array, value){
	if( array.length === 0 ) return false;

	var element = array.pop();
	var found = Array.isArray(value) ? value.indexOf(element)>-1 : element===value;
	if( !found )
		array.push( element );
	return found;
}

/**
* Firestarter is an abstract type to define a wrapper for listeners
*
* @class Firestarter
* @constructor
*/
function Firestarter( ){ }

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

firestarter.parameters = function( service ){
	throw new Error('To be implemented...');
};

firestarter.parametersOf = function( fn ){
	if( !fn ) return null;

	var params = parameterNames( fn );
	if( params.length === 0 ) return params;

	var found = isLast( params, ['callback', 'cb'] ) && isLast( params, 'ignite' ) && isLast( params, 'terms' );

	return params;
};

/**
* Validates division of an incoming message
*/
firestarter.sameDivision = function( division ){
	var div = division || '';

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

function responseAsArray( responseComms, attribute ){
	var res = responseComms.map( function(responseComm){ return responseComm[attribute || 'response']; } ).filter( function(resp){ return resp; });
	return res.length === 0 ? null : res;
}

function responseAsObject( responseComms ){
	var res = responseComms.map( function(responseComm){ return responseComm.response; } ).filter( function(resp){ return resp; });
	return res.length === 0 ? null : res;
}

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
		err = responseAsArray( responseComms, 'error' );
		if( this.config.namedResponses ){
			var indexed = _.indexBy(responseComms, 'responder');
			if( err ){
				err = new Fire( _.mapValues( indexed, function( response ) {
					return response.error;
				}) );
			}
			res = _.mapValues( indexed, function( response ) {
				return response.response;
			});
		}
		else{
			res = responseAsArray( responseComms, 'response' );
		}
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

	this.logger.harconlog(null, 'Burning', {comm: comm.shallow()}, 'silly' );

	var serviceFn = this.getServiceFn( comm );

	var callbackFn = function(err, res){ callback( err, comm.twist(self.name, err, res) ); };

	if( this.parametersOf( serviceFn ).length !== comm.params.length )
		return callbackFn( new Error('Mind the parameter list!') );

	var igniteFn = self.auditor ? function(){
		self.burst( comm, arguments );
	} : function(){
		var args = [ null, self.division ].concat( self.sliceArguments.apply( self, arguments ) );
		self.burst( comm, args );
	};
	//var igniteFn = function( ){ self.burst( comm, arguments ); };
	var params = [].concat( comm.params ).concat( serviceFn.length > comm.params.length+2 ? comm.terms : [] ).concat( serviceFn.length > comm.params.length+1 ? igniteFn : [] ).concat( callbackFn );

	this.innerBurn( comm, callbackFn, serviceFn, igniteFn, params );
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
	var externalID = params[ 0 ];
	var division = params[ 1 ] || self.division;
	var event = params[ 2 ];
	var hasCallback = params.length>0 && isFunction( params[ params.length-1 ] );
	var callParams = self.sliceArguments.apply( self, params ).slice( 3, hasCallback ? params.length-1 : params.length );
	var callback = hasCallback ? params[ params.length-1 ] : null;

	var newComm = comm.burst( this.name, externalID, division, event, callParams, callback );

	this.logger.harconlog( null, 'Igniting', {newComm: newComm.shallow(), comm: comm.shallow()}, 'silly' );

	if( newComm.callback )
		this.comms[ newComm.id ] = { callback: newComm.callback };

	this.barrel.intoxicate( newComm );
};

firestarter.innerIgnite = function( ){
	var self = this;
	var externalId = arguments[ 0 ];
	var division = arguments[ 1 ] || self.division;
	var event = arguments[ 2 ];
	var hasCallback = isFunction( arguments[ arguments.length-1 ] );
	var params = self.sliceArguments.apply( self, arguments ).slice( 3, hasCallback ? arguments.length-1 : arguments.length );
	var callback = hasCallback ? arguments[ arguments.length-1 ] : null;

	var comm = Communication.newCommunication( null, null, externalId, division, this.name, event, params, callback );

	if( externalId && self.terms[externalId] ){
		comm.terms = self.terms[externalId];
		delete self.terms[externalId];
	}

	this.logger.harconlog(null, 'Initiate ignition', {comm: comm.shallow()}, 'silly' );
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
		return this.innerIgnite.apply( this, arguments );
	if( Array.isArray(event) ){
		var hasCallback = isFunction( arguments[ arguments.length-1 ] );
		if( !hasCallback ){
			var ids = [];
			var slicedArguments = self.sliceArguments.apply( self, arguments ).slice( 3 );
			event.forEach( function(ev){
				var args = [externalId, division, ev].concat( slicedArguments );
				ids.push( this.innerIgnite.apply( this, args ) );
			} );
			return ids;
		}
	}
	throw new Error( 'Invalid parameters' );
};

firestarter.close = function( ){
};

module.exports = Firestarter;
