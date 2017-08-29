let Communication = require('./Communication')
let Liner = require('./warpers/Liner')
let liner

let Proback = require('proback.js')

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

barrel.init = async function ( config ) {
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

	return this.extendedInit( config )
}

barrel.extendedInit = async function ( config ) {
	return 'ok'
}

barrel.setWarper = function ( division, warper ) {
	let self = this
	if ( division && !this.warpers[division] && warper ) {
		this.warpers[division] = warper
		warper.barrel = self

		return self.newDivision( division )
	}
	else return Proback.quicker( 'ok' )
}

barrel.newDivision = async function ( division ) {
	return 'ok'
}
barrel.removeEntity = async function ( division, context, name ) {
	return 'ok'
}
barrel.newEntity = async function ( division, context, name ) {
	return 'ok'
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
barrel.castOf = async function ( name ) {
	let self = this
	self.logger.harconlog( null, 'CastOf', { name: name }, 'info' )

	let index = self.firestarters.findIndex( function (element) { return element.name === name } )
	if ( index === -1) return 'ok'

	let fs = self.firestarters[ index ]
	self.firestarters.splice(index, 1)

	await self.igniteSystemEvent( 'castOf', name, fs )
	await self.removeEntity( fs.division, fs.context, fs.name )

	let exit = await fs.close()
	return exit
}

/**
* Registers a new firestarter instance
*
* @method affiliate
* @param {Firestormstarter or FireFlamestarter} firestarter The firestarter instance to add
*/
barrel.affiliate = async function ( firestarter ) {
	let self = this
	self.logger.harconlog( null, 'Affiliated', { name: firestarter.name, division: firestarter.division, context: firestarter.context, events: firestarter.event || firestarter.events }, 'info' )

	if ( self.firestarters.find( function (element) { return element.name === firestarter.name } ) )
		throw new Error('There is a published component with such name', firestarter.name )

	self.firestarters.push( firestarter )

	await self.igniteSystemEvent( 'affiliate', firestarter.division, firestarter.context, firestarter.name )

	await self.setWarper( firestarter.division, liner)
	await self.newEntity( firestarter.division, firestarter.context, firestarter.name)
	if (firestarter.distinguishedName)
		await self.newEntity( firestarter.division, firestarter.context, firestarter.distinguishedName)
	await self.igniteSystemEvent( 'affiliated', firestarter.division, firestarter.context, firestarter.name )
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
barrel.appease = async function ( comm, err, responseComms ) {
	let self = this
	let ps = self.matchingResponse( comm ).map( function ( fs ) {
		if ( !fs.concealed && !self.seals.includes( comm.event ) )
			self.logger.harconlog( err, 'Appeasing', {
				to: fs.name, id: comm.id, originalId: comm.originalId, flowId: comm.flowId, externalId: comm.externalId,
				comm: comm, err: err, responseComms: responseComms.map( function (rc) { return Communication.narrowResponse( rc ) } )
			}, self.igniteLevel )
		self.logger.harconlog( null, 'Appeasing', { name: fs.name, comm: comm.shallow() }, 'trace' )
		return fs.appease( err, comm, responseComms )
	} )
	await Promise.all( ps )
}

/**
* Emits an event in the bus
*
* @method intoxicate
* @param {Communication} comm Communication object to deliver
*/
barrel.intoxicate = async function ( comm ) {
	let self = this

	if ( this.warp( comm ) )
		return self.appease( comm, new Error('Communication has been blocked by the warper of the division.'), [] )

	let matching = this.matching( comm )

	if ( matching.length === 0 ) {
		if ( self.isSystemEvent( comm.event ) ) return false

		if ( !self.quiteMode ) {
			this.logger.harconlog( new Error('Nobody is listening'), 'Nobody is listening', {comm: comm.shallow() }, 'warn')
			return self.appease( comm, new Error('Nobody is listening to: ' + comm.event), [] )
		}
		return false
	}
	return new Promise( async (resolve, reject) => {
		try {
			let ps = matching.map( function ( fs ) {
				if ( !fs.concealed && !self.seals.includes( comm.event ) )
					self.logger.harconlog( null, 'Emitting', {
						to: fs.name, id: comm.id, originalId: comm.originalId, flowId: comm.flowId, externalId: comm.externalId, comm: comm
					}, self.igniteLevel )
				self.logger.harconlog( null, 'Emitting', { name: fs.name, comm: comm.shallow() }, 'trace' )
				return fs.burn( comm )
			} )
			let res = await Promise.all( ps )
			await self.appease( comm, null, res )
			resolve( res )
		} catch (err) {
			await self.appease( comm, err, [] )
			reject( err )
		}
	} )
}

barrel.close = async function ( ) {
	let self = this

	self.logger.harconlog( null, 'Closing harcon...', { }, 'info' )

	// sosem tér vissza
	await self.igniteSystemEvent( 'close' )
	try {
		let ps = self.firestarters.map( (fs) => {
			return fs.close()
		} )
		await Promise.all( ps )
	} catch (err) { console.error(err) }

	return self.extendedClose( )
}

barrel.extendedClose = async function ( ) {
	return 'ok'
}

module.exports = Barrel
