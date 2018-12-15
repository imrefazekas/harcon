let Cerobee = require('clerobee')
let clerobee = new Cerobee( 16 )

let Communication = require('../Communication')
let { OK } = require('../Static')

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
		setTimeout: function ( fn, timeout ) {
			var self = this
			let ref = setTimeout( async function () {
				if (ref) {
					let index = self.firestarter.timeoutRefs.indexOf( ref )
					if (index >= -1)
						self.firestarter.timeoutRefs.splice(index, 1)
				}
				try {
					await fn()
				} catch (err) { self.harconlog(err) }
			}, timeout)
			self.firestarter.timeoutRefs.push( ref )
			return ref
		},
		clearTimeout: function ( ref ) {
			clearTimeout( ref )
		},
		setInterval: function ( fn, interval ) {
			var self = this
			let ref = setInterval( fn, interval )
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
