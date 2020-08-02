let Cerobee = require('clerobee')
let clerobee = new Cerobee( 16 )

let Communication = require('../Communication')
let { OK, SEPARATOR } = require('../Static')

const CronJob = require('cron').CronJob
let Proback = require('proback.js')

let Assigner = require('assign.js')
let assigner = new Assigner()

module.exports = function (self) {
	return {
		_id: clerobee.generate(),
		firestarter: self,
		notifyTos: { },
		async notify ( state, division, event ) {
			var self = this
			if ( !self.notifyTos[ state ] )
				self.notifyTos[ state ] = []
			if ( !self.notifyTos[ state ].find( (item) => { return item.division === division && item.event === event } ) )
				self.notifyTos[ state ].push( { division: division, event: event } )
			return OK
		},

		burst: self.auditor ? function ( comm, terms, externalID, flowID, division, event, ...callParams ) {
			comm = comm.burst ? comm : Communication.importCommunication( comm )
			let newComm = comm.burst( externalID, flowID, self.division, self.name, self.barrel.nodeID, division, event, callParams, null )
			newComm.terms = assigner.assign( {}, comm.terms || {}, terms || {} )
			return newComm
		} : function ( comm, terms, division, event, ...callParams ) {
			comm = comm.burst ? comm : Communication.importCommunication( comm )
			let newComm = comm.burst( null, null, self.division, self.name, self.barrel.nodeID, division, event, callParams, null )
			newComm.terms = assigner.assign( {}, comm.terms || {}, terms || {} )
			return newComm
		},

		async blow (newComm) {
			return new Promise( async function (resolve, reject) {
				newComm.callback = Proback.handler(null, resolve, reject)
				self.blower.blow( newComm )
				await self.barrel.intoxicate( newComm )
			} )
		},

		request: self.auditor ? async function ( ...params ) {
			return self.ignite( Communication.MODE_REQUEST, ...params )
		} : async function ( ...params ) {
			let args = [ null, null, self.division ].concat( params )
			return self.ignite( Communication.MODE_REQUEST, ...args )
		},
		inform: self.auditor ? async function ( ...params ) {
			return self.ignite( Communication.MODE_INFORM, ...params )
		} : async function ( ...params ) {
			let args = [ null, null, self.division ].concat( params )
			return self.ignite( Communication.MODE_INFORM, ...args )
		},
		delegate: self.auditor ? async function ( ...params ) {
			return self.ignite( Communication.MODE_DELEGATE, ...params )
		} : async function ( ...params ) {
			let args = [ null, null, self.division ].concat( params )
			return self.ignite( Communication.MODE_DELEGATE, ...args )
		},

		async shifted ( state, target = '*' ) {
			if (this.entangled)
				await this.inform( this.entangled + '.shifted', state, target )
			let object = { division: self.division, context: self.context, name: self.name, state: state, target: target, notifyTos: this.notifyTos }
			return self.ignite( Communication.MODE_INFORM, null, null, self.barrel.systemFirestarter.division, self.barrel.systemFirestarter.name + SEPARATOR + 'entityShifted', object )
		},
		startCron ( name, spec, fn ) {
			var self = this
			let cj = new CronJob(spec, function () {
				fn().catch( self.harconlog )
			} )
			cj.start()
			if (self.firestarter.cronjobRefs[name])
				throw new Error('CronJob already exists with the name of ' + name)
			self.firestarter.cronjobRefs[name] = cj
			return cj
		},
		stopCron (name) {
			if (self.firestarter.cronjobRefs[name])
				try {
					self.firestarter.cronjobRefs[name].stop()
					delete self.firestarter.cronjobRefs[name]
				} catch (err) { this.harconlog(err) }
			return OK
		},
		setTimeout ( fn, timeout ) {
			var self = this
			let ref = setTimeout( function () {
				fn().catch( self.harconlog )
			}, timeout)
			self.firestarter.timeoutRefs.push( ref )
			return ref
		},
		clearTimeout ( ref ) {
			clearTimeout( ref )
		},
		setInterval ( fn, interval ) {
			var self = this
			let ref = setInterval( function () {
				fn().catch( self.harconlog )
			}, interval )
			self.firestarter.intervalRefs.push( ref )
			return ref
		},
		clearInterval ( ref ) {
			clearInterval( ref )
		},
		async flowFailed ( flowID, errMessage, terms ) {
			return OK
		},
		async flowSucceeded ( flowID, result, terms ) {
			return OK
		},
		async started () {
			this._ready = true
			return OK
		},
		async close ( ) {
			return OK
		},


		async entityPublished (division, entoty) {
			return OK
		},
		async harconEntities () {
			return this.firestarter.barrel.presences || { }
		},
		async harconSiblingEntities () {
			let presences = this.firestarter.barrel.presences || { }
			if ( !presences[ this.firestarter.division ] || presences[ this.firestarter.division ][ this.firestarter.name ] )
				return { }

			return presences[ this.firestarter.division ][ this.firestarter.name ]
		}
	}
}
