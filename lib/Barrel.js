let Communication = require('./Communication')
let Liner = require('./warpers/Liner')
let liner

let Proback = require('proback.js')
const sequential = Proback.syncAll

// let Stopper = require('./warpers/Stopper')
// let stopper = new Stopper()

/**
* Message bus to deliver events to listeners
*
* @class Barrel
* @constructor
*/
function Barrel ( ) {
}
let barrel = Barrel.prototype

barrel.init = function ( config, callback ) {
	this.igniteLevel = config.igniteLevel || 'trace'

	this.name = config.name
	this.division = config.division
	this.logger = config.logger
	this.seals = config.seals || []
	this.unfoldAnswer = !!config.unfoldAnswer

	this.logger.harconlog( null, 'Barrel initiated.', {
		name: this.name, division: this.division, igniteLevel: this.igniteLevel, seals: this.seals
	}, 'info' )

	this.firestarters = [ ]
	this.warpers = {}
	this.systemFirestarter = null

	this.quiteMode = false

	liner = new Liner( this.division, config.connectedDivisions )

	return this.extendedInit( config, callback )
}

barrel.extendedInit = function ( config, callback ) {
	return Proback.quicker( 'ok', callback )
}

barrel.setWarper = function ( division, warper, callback ) {
	let self = this
	if ( division && !this.warpers[division] && warper ) {
		this.warpers[division] = warper
		warper.barrel = self

		return self.newDivision( division, callback )
	}
	else return Proback.quicker( 'ok', callback )
}

barrel.newDivision = function ( division, callback ) {
	return Proback.quicker( 'ok', callback )
}
barrel.removeEntity = function ( division, context, name, callback) {
	return Proback.quicker( 'ok', callback )
}
barrel.newEntity = function ( division, context, name, callback) {
	return Proback.quicker( 'ok', callback )
}

barrel.warpers = function () {
	return this.warpers
}

barrel.divisions = function () {
	return Object.keys( this.warpers )
}

barrel.entities = function ( division ) {
	let fss = division ? this.firestarters.filter(function (fs) { return fs.division === division }) : this.firestarters
	let entities = fss.map( function (fs) {
		return {
			division: fs.division,
			context: fs.context,
			name: fs.name,
			distinguishedName: fs.distinguishedName,
			events: fs.services()
		}
	} )
	return entities
}

barrel.firestarter = function ( name ) {
	let fs = this.firestarters.find( function (fs) { return fs.name === name || fs.distinguishedName === name } )
	return fs
}

barrel.listener = function ( name ) {
	let fs = this.firestarters.find( function (fs) { return fs.name === name || fs.distinguishedName === name } )
	return fs.fn ? fs.fn : fs.object
}

barrel.isSystemEvent = function ( eventName ) {
	return this.systemFirestarter ? eventName.startsWith( this.systemFirestarter.name + '.' ) : false
}

barrel.igniteSystemEvent = function () {
	if (this.systemFirestarter) {
		let args = [ null, null, this.systemFirestarter.division, this.systemFirestarter.name + '.' + arguments[0] ]
		for (let i = 1; i < arguments.length; i += 1)
			args.push( arguments[i] )
		return this.systemFirestarter.ignite.apply( this.systemFirestarter, args )
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
	let index = this.firestarters.findIndex( function (element) { return element.name === name } )
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
	let self = this
	self.logger.harconlog( null, 'CastOf', { name: name }, 'info' )
	let index = self.firestarters.findIndex( function (element) { return element.name === name } )
	if ( index !== -1) {
		return new Promise( (resolve, reject) => {
			let fs = self.firestarters[ index ]
			self.firestarters.splice(index, 1)

			self.igniteSystemEvent( 'castOf', name, fs )

			self.removeEntity( fs.division, fs.context, fs.name )
			.then( () => {
				return fs.close()
			} )
			.then( function (value) {
				Proback.resolver( value, callback, resolve )
			} )
			.catch(function (reason) {
				Proback.rejecter( reason, callback, reject )
			} )
		} )
	}
	else return Proback.quicker( 'ok', callback )
}

/**
* Registers a new firestarter instance
*
* @method affiliate
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to add
*/
barrel.affiliate = function ( firestarter, callback ) {
	let self = this
	self.logger.harconlog( null, 'Affiliated', { name: firestarter.name, division: firestarter.division, context: firestarter.context, events: firestarter.event || firestarter.events }, 'info' )

	if ( self.firestarters.find( function (element) { return element.name === firestarter.name } ) )
		throw new Error('There is a published component with such name', firestarter.name )

	self.igniteSystemEvent( 'affiliate', firestarter.division, firestarter.context, firestarter.name )

	self.firestarters.push( firestarter )

	return new Promise( (resolve, reject) => {
		self.setWarper( firestarter.division, liner)
		.then( () => { return self.newEntity( firestarter.division, firestarter.context, firestarter.name) } )
		.then( () => { return firestarter.distinguishedName ? self.newEntity( firestarter.division, firestarter.context, firestarter.distinguishedName) : 'ok' } )
		.then( () => {
			self.igniteSystemEvent( 'affiliated', firestarter.division, firestarter.context, firestarter.name )

			Proback.resolver( firestarter, callback, resolve )
		} )
		.catch( (reason) => {
			Proback.rejecter( reason, callback, reject )
		} )
	} )
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
	let fss = this.firestarters.filter( function ( fs ) { return fs.active && fs.matches( comm ) } )
	this.logger.harconlog( null, 'Matched', fss.map( function (fs) { return fs.name } ), 'trace' )
	return fss
}

/**
* Emits a response in the bus
*
* @method appease
* @param {Communication} comm Communication response object to deliver
*/
barrel.appease = function ( comm, err, responseComms ) {
	let self = this

	self.matchingResponse( comm ).forEach( function ( fs ) {
		if ( !fs.concealed && !self.seals.includes( comm.event ) )
			self.logger.harconlog( err, 'Appeasing', {
				to: fs.name, id: comm.id, originalId: comm.originalId, flowId: comm.flowId, externalId: comm.externalId,
				comm: comm, err: err, responseComms: responseComms.map( function (rc) { return Communication.narrowResponse( rc ) } )
			}, self.igniteLevel )
		self.logger.harconlog( null, 'Appeasing', { name: fs.name, comm: comm.shallow() }, 'trace' )
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
	let self = this

	if ( this.warp( comm ) )
		return self.appease( comm, new Error('Communication has been blocked by the warper of the division.'), [] )

	let matching = this.matching( comm )

	if ( matching.length === 0 ) {
		if ( self.isSystemEvent( comm.event ) ) return false

		if ( comm.callback && !self.quiteMode ) {
			this.logger.harconlog( new Error('Nobody is listening'), 'Nobody is listening', {comm: comm.shallow() }, 'warn')
			self.appease( comm, new Error('Nobody is listening...'), [] )
		}
		return false
	}

	sequential( matching.map( function ( fs ) {
		return function (previousResponse, responses, count) {
			return new Promise( (resolve, reject) => {
				if ( !fs.concealed && !self.seals.includes( comm.event ) )
					self.logger.harconlog( null, 'Emitting', {
						to: fs.name, id: comm.id, originalId: comm.originalId, flowId: comm.flowId, externalId: comm.externalId, comm: comm
					}, self.igniteLevel )
				self.logger.harconlog( null, 'Emitting', { name: fs.name, comm: comm.shallow() }, 'trace' )
				fs.burn( comm, (err, res) => {
					if (err) return reject(err)
					else resolve( res )
				} )
			} )
		}
	} ) )
	.then( (res) => {
		if ( comm.callback )
			self.appease( comm, null, res )
	} )
	.catch( (reason) => {
		if ( comm.callback )
			self.appease( comm, reason, [] )
	} )
}

barrel.close = function ( callback ) {
	let self = this

	this.logger.harconlog( null, 'Closing harcon...', { }, 'info' )

	this.igniteSystemEvent( 'close' )

	Promise.all( self.firestarters.map( (fs) => { return fs.close() } ) )
	.then( () => {
		self.extendedClose( callback )
	} )
	.catch( (reason) => { self.extendedClose( callback ) } )
}

barrel.extendedClose = function ( callback ) {
	return Proback.quicker( 'ok', callback )
}

module.exports = Barrel
