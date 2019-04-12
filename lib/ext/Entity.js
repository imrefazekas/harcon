let Cerobee = require('clerobee')
let clerobee = new Cerobee( 16 )

let Communication = require('../Communication')
let { OK } = require('../Static')

const CronJob = require('cron').CronJob

module.exports = function (self) {
	return {
		_id: clerobee.generate(),
		firestarter: self,
		notifyTos: { },
		notify: async function ( state, division, event ) {
			var self = this
			if ( !self.notifyTos[ state ] )
				self.notifyTos[ state ] = []
			if ( !self.notifyTos[ state ].find( (item) => { return item.division === division && item.event === event } ) )
				self.notifyTos[ state ].push( { division: division, event: event } )
			return OK
		},
		burstComm: self.auditor ? function ( comm, externalID, flowID, division, event, callParams ) {
			return comm.burst( externalID, flowID, self.division, self.name, self.barrel.nodeID, division, event, callParams, null )
		} : function ( comm, division, event, callParams ) {
			return comm.burst( null, null, self.division, self.name, self.barrel.nodeID, division, event, callParams, null )
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

		shifted: async function ( state, target = '*' ) {
			let object = { division: self.division, context: self.context, name: self.name, state: state, target: target, notifyTos: this.notifyTos }
			return self.ignite( Communication.MODE_INFORM, null, null, self.barrel.systemFirestarter.division, self.barrel.systemFirestarter.name + '.' + 'entityShifted', object )
		},
		startCron: function ( name, spec, fn ) {
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
		stopCron: function (name) {
			if (self.firestarter.cronjobRefs[name])
				try {
					self.firestarter.cronjobRefs[name].stop()
					delete self.firestarter.cronjobRefs[name]
				} catch (err) { this.harconlog(err) }
			return OK
		},
		setTimeout: function ( fn, timeout ) {
			var self = this
			let ref = setTimeout( function () {
				fn().catch( self.harconlog )
			}, timeout)
			self.firestarter.timeoutRefs.push( ref )
			return ref
		},
		clearTimeout: function ( ref ) {
			clearTimeout( ref )
		},
		setInterval: function ( fn, interval ) {
			var self = this
			let ref = setInterval( function () {
				fn().catch( self.harconlog )
			}, interval )
			self.firestarter.intervalRefs.push( ref )
			return ref
		},
		clearInterval: function ( ref ) {
			clearInterval( ref )
		},
		flowFailed: async function ( flowID, errMessage, terms ) {
			return OK
		},
		flowSucceeded: async function ( flowID, result, terms ) {
			return OK
		},
		started: async function () {
			this._ready = true
			return OK
		},
		close: async function ( ) {
			return OK
		},
		harconEntities: async function () {
			return this.firestarter.barrel.presences || { }
		},
		harconSiblingEntities: async function () {
			let presences = this.firestarter.barrel.presences || { }
			if ( !presences[ this.firestarter.division ] || presences[ this.firestarter.division ][ this.firestarter.name ] )
				return { }

			return presences[ this.firestarter.division ][ this.firestarter.name ]
		}
	}
}
