var async = require('async')

var Communication = require('./Communication')
var Liner = require('./warpers/Liner')
var liner
// var Stopper = require('./warpers/Stopper')
// var stopper = new Stopper()

/**
* Message bus to deliver events to listeners
*
* @class Barrel
* @constructor
*/
function Barrel ( ) {
}
var barrel = Barrel.prototype

barrel.init = function ( config, callback ) {
	this.igniteLevel = config.igniteLevel || 'silly'
	this.name = config.name
	this.division = config.division
	this.logger = config.logger

	this.firestarters = [ ]
	this.warpers = {}
	this.systemFirestarter = null

	this.quiteMode = false

	liner = new Liner( this.division, config.connectedDivisions )

	this.extendedInit( config, callback )
}

barrel.extendedInit = function ( config, callback ) {
	if ( callback )
		callback()
}

barrel.setWarper = function ( division, warper, callback ) {
	var self = this
	if ( division && !this.warpers[division] && warper ) {
		this.warpers[division] = warper
		warper.barrel = self

		self.newDivision( division, callback )
	}
	else if (callback) callback()
}

barrel.newDivision = function ( division, callback ) {
	if ( callback )
		callback()
}
barrel.removeEntity = function ( division, context, name, callback) {
	if (callback)
		callback()
}
barrel.newEntity = function ( division, context, name, callback) {
	if (callback)
		callback()
}

barrel.warpers = function () {
	return this.warpers
}

barrel.divisions = function () {
	return Object.keys( this.warpers )
}

barrel.listeners = function ( division ) {
	var fss = division ? this.firestarters.filter(function (fs) { return fs.division === division }) : this.firestarters
	var names = fss.map( function (fs) { return fs.name } )
	return names
}

barrel.firestarter = function ( name ) {
	var fs = this.firestarters.find( function (fs) { return fs.name === name } )
	return fs
}

barrel.listener = function ( name ) {
	var fs = this.firestarters.find( function (fs) { return fs.name === name } )
	return fs.fn ? fs.fn : fs.object
}

barrel.isSystemEvent = function ( eventName ) {
	return this.systemFirestarter ? eventName.startsWith( this.systemFirestarter.name + '.' ) : false
}

barrel.igniteSystemEvent = function () {
	if (this.systemFirestarter) {
		var args = [ null, null, this.systemFirestarter.division, this.systemFirestarter.name + '.' + arguments[0] ]
		for (var i = 1; i < arguments.length; i += 1)
			args.push( arguments[i] )
		this.systemFirestarter.ignite.apply( this.systemFirestarter, args )
	}
}

/**
* Sets the activity of a firestarter instance
*
* @method activity
* @param {String} name Name of the firestarter to set
* @param {boolean} name State to be set
*/
barrel.activity = function ( name, state ) {
	this.logger.harconlog( null, 'Activate', { name: name }, 'info' )
	var index = this.firestarters.findIndex( function (element) { return element.name === name } )
	if ( index !== -1)
		this.firestarters[ index ].active = state
}

/**
* Deregisters a firestarter instance
*
* @method castOf
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to remove
*/
barrel.castOf = function ( name, callback ) {
	var self = this
	this.logger.harconlog( null, 'CastOf', { name: name }, 'info' )
	var index = this.firestarters.findIndex( function (element) { return element.name === name } )
	if ( index !== -1) {
		var fs = this.firestarters[ index ]
		this.firestarters.splice(index, 1)
		this.igniteSystemEvent( 'castOf', name, fs )
		async.series( [
			function (cb) {
				self.removeEntity( fs.division, fs.context, fs.name, cb )
			},
			function (cb) {
				fs.close( cb )
			}
		], function (err) {
			if (callback) callback(err)
		} )
	} else if ( callback )
		callback( null, 'Done.' ) // new Error('Unknown entity', name) )
}

/**
* Registers a new firestarter instance
*
* @method affiliate
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to add
*/
barrel.affiliate = function ( firestarter, callback ) {
	var self = this
	this.logger.harconlog( null, 'Affiliated', { name: firestarter.name, division: firestarter.division, context: firestarter.context, events: firestarter.event || firestarter.events }, 'info' )

	if ( this.firestarters.find( function (element) { return element.name === firestarter.name } ) )
		throw new Error('There is a published component with such name', firestarter.name )

	this.igniteSystemEvent( 'affiliate', firestarter )

	this.firestarters.push( firestarter )

	async.series( [
		function (cb) {
			self.setWarper( firestarter.division, liner, cb )
		},
		function (cb) {
			self.newEntity( firestarter.division, firestarter.context, firestarter.name, cb )
		}
	], callback )

	return firestarter
}

/**
* Collects matching firestarter instances to the passed {Communication} response object
*
* @method matchingResponse
* @param {Communication} comm The communication instance
*/
barrel.matchingResponse = function (comm) {
	return this.firestarters.filter( function ( fs ) {
		return fs.active && fs.matchesRespose( comm )
	} )
}

/**
* Chechks whether the comm is allowed by the warpers defined
*
* @method warp
* @param {Communication} comm The communication instance
*/
barrel.warp = function (comm) {
	return this.warpers[ comm.division ] && !this.warpers[ comm.division ].allow(comm)
}

/**
* Collects matching firestarter instances to the passed {Communication} object
*
* @method matching
* @param {Communication} comm The communication instance
*/
barrel.matching = function (comm) {
	return this.firestarters.filter( function ( fs ) { return fs.active && fs.matches( comm ) } )
}

/**
* Emits a response in the bus
*
* @method appease
* @param {Communication} comm Communication response object to deliver
*/
barrel.appease = function ( comm, err, responseComms ) {
	var self = this

	this.logger.harconlog( err, 'Appeasing', {
		id: comm.id, originalId: comm.originalId, flowId: comm.flowId, externalId: comm.externalId,
		comm: comm, err: err, responseComms: responseComms.map( function (rc) { return Communication.narrowResponse( rc ) } )
	}, self.igniteLevel )

	self.matchingResponse( comm ).forEach( function ( fs ) {
		fs.appease( err, comm, responseComms )
	} )
}

/**
* Emits an event in the bus
*
* @method intoxicate
* @param {Communication} comm Communication object to deliver
*/
barrel.intoxicate = function ( comm ) {
	var self = this

	if ( this.warp( comm ) )
		return self.appease( comm, new Error('Communication has been blocked by the warper of the division.'), [] )

	var matching = this.matching( comm )

	if ( matching.length === 0 ) {
		if ( self.isSystemEvent( comm.event ) ) return false

		if ( comm.callback && !self.quiteMode ) {
			this.logger.harconlog( new Error('Nobody is listening'), 'Nobody is listening', {comm: comm.shallow() }, 'warn')
			self.appease( comm, new Error('Nobody is listening'), [] )
		}
		return false
	}

	var callChain = matching.map( function ( fs ) {
		return function ( cb ) {
			self.logger.harconlog( null, 'Emitting', { name: fs.name, comm: comm.shallow() }, 'silly' )
			fs.burn( comm, cb )
		}
	} )
	async.series( callChain,
		function (err, results) {
			self.logger.harconlog( err, 'Emitted with: ', { results: results }, 'silly' )
			if ( comm.callback ) {
				self.appease( comm, err, results )
			}
		}
	)
}

barrel.close = function ( callback ) {
	var self = this

	this.logger.harconlog( null, 'Closing harcon...', { }, 'info' )

	this.igniteSystemEvent( 'close' )

	var fns = []
	self.firestarters.forEach( function ( fs ) {
		fns.push( function ( cb ) {
			if ( fs.close )
				fs.close( cb )
			else cb()
		} )
	} )
	async.series( fns, function ( err, res ) {
		if (err) {
			self.logger.error( err, 'Unable to stop entities' )
			return callback(err)
		}
		self.extendedClose( callback )
	} )
}

barrel.extendedClose = function ( callback ) {
	if ( callback )
		callback()
}

module.exports = Barrel
