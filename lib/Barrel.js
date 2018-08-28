let Communication = require('./Communication')
let Liner = require('./warpers/Liner')

let Cerobee = require('clerobee')
let clerobee = new Cerobee( 16 )

let { OK } = require('./Static')

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
	this.subDivision = config.subDivision
	this.logger = config.logger
	this.seals = config.seals || []
	this.unfoldAnswer = !!config.unfoldAnswer
	this._divisions = {}

	this.nodeID = config.nodeID || clerobee.generate( config.idLength )

	this.logger.harconlog( null, 'Barrel initiated.', {
		name: this.name, division: this.division, igniteLevel: this.igniteLevel, seals: this.seals
	}, 'info' )

	this.firestarters = [ ]
	this.systemFirestarter = null

	this.quiteMode = false

	let WarperCreator = config.Warper || Liner
	this.warper = new WarperCreator( this.division, config.connectedDivisions, config.warper || { } )
	this.warper.barrel = this

	return this.extendedInit( config )
}

barrel.extendedInit = async function ( config ) {
	return OK
}
barrel.extendedNewDivision = async function ( division ) {
	return OK
}
barrel.extendedRemoveEntity = async function ( division, context, name ) {
	return OK
}
barrel.extendedNewEntity = async function ( division, context, name ) {
	return OK
}

barrel.newDivision = async function ( division ) {
	this._divisions[ division ] = Date.now()
	return this.extendedNewDivision( division )
}
barrel.removeEntity = async function ( division, context, name ) {
	return this.extendedRemoveEntity( division, context, name )
}
barrel.newEntity = async function ( division, context, name ) {
	return this.extendedNewEntity( division, context, name )
}

barrel.divisions = function () {
	return Object.keys( this._divisions )
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

barrel.igniteSystemEvent = async function () {
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
	if ( index === -1) return OK

	let fs = self.firestarters[ index ]
	self.firestarters.splice(index, 1)

	await self.igniteSystemEvent( 'castOf', name, fs )
	await self.removeEntity( fs.division, fs.context, fs.name )

	let exit = await fs.close()
	return exit || OK
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

	await self.newDivision( firestarter.division )

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

barrel.appeaseMessage = async function ( comm ) {
	let self = this

	let matching = this.matching( comm )

	if ( matching.length === 0 ) {
		if ( self.isSystemEvent( comm.event ) ) return OK

		if ( !self.quiteMode ) {
			this.logger.harconlog( new Error('Nobody is listening to: ' + comm.event ), 'Nobody is listening', { comm: comm.shallow() }, 'warn')
			return self.intoxicate( comm, new Error('Nobody is listening to: ' + comm.event), [] )
		}
		return OK
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
			await self.intoxicate( comm, null, res )
			resolve( res )
		} catch (err) {
			try { await self.intoxicate( comm, err, [] ) } catch (err) { self.logger.harconlog(err) }
			reject( err )
		}
	} )
}
barrel.appeaseAnswer = async function ( comm, err, responseComms ) {
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


barrel.intoxicateMessage = async function ( comm ) {
	return this.appease( comm )
}
barrel.intoxicateAnswer = async function ( comm, err, responseComms ) {
	return this.appease( comm, err, responseComms )
}

/**
* Processes a message from the bus
*
* @method appease
* @param {Communication} comm Communication response object received
* @param {Communication} err Error object received
* @param {Communication} responseComms Array of Communication objects received
*/
barrel.appease = async function ( comm, err, responseComms ) {
	if ( err || responseComms ) {
		let answers = []
		for (let c of responseComms )
			if ( !this.warper.allow( c ) )
				this.logger.harconlog( new Error('Communication has been blocked by the warper of the division'), 'Blocked message', { comm: c.shallow() } )
			else answers.push( c )
		return this.appeaseAnswer( comm, err, answers )
	}
	else {
		if ( !this.warper.allow( comm ) )
			return this.intoxicate( comm, new Error('Communication has been blocked by the warper of the division'), [] )

		return this.appeaseMessage( comm )
	}
}

/**
* Emits an event in the bus
*
* @method intoxicate
* @param {Communication} comm Communication object to send out
* @param {Communication} err Error object to send out
* @param {Communication} responseComms Array of Communication objects to send out
*/
barrel.intoxicate = async function ( comm, err, responseComms ) {
	if ( err || responseComms ) {
		for (let c of responseComms )
			this.warper.conform( c )
		return this.intoxicateAnswer( comm, err, responseComms )
	}
	else {
		this.warper.conform( comm )
		return this.intoxicateMessage( comm )
	}
}

barrel.close = async function ( ) {
	let self = this

	self.logger.harconlog( null, 'Closing harcon...', { }, 'info' )

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
	return OK
}

module.exports = Barrel
