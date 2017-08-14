let Proback = require('proback.js')

let Cerobee = require('clerobee')
let clerobee = new Cerobee( 16 )

module.exports = function (self) {
	return {
		_id: clerobee.generate(),
		firestarter: self,
		notifyTos: { },
		notify: function ( state, event ) {
			var self = this
			return new Promise( (resolve, reject) => {
				if ( !self.notifyTos[ state ] )
					self.notifyTos[ state ] = []
				if ( self.notifyTos[ state ].indexOf(event) === -1 )
					self.notifyTos[ state ].push( event )
				resolve( 'ok' )
			} )
		},
		ignite: self.auditor ? function () {
			return self.ignite.apply( self, arguments )
		} : function () {
			let args = [ null, null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
			return self.ignite.apply( self, args )
		},
		shifted: function ( state, target = '*' ) {
			this.notifyTos.almafa = 'Heh'
			let object = { division: self.division, context: self.context, name: self.name, state: state, target: target, notifyTos: this.notifyTos }
			return self.ignite( null, null, self.barrel.systemFirestarter.division, self.barrel.systemFirestarter.name + '.' + 'entityShifted', object )
		},
		setTimeout: function ( fn, timeout ) {
			let ref = setTimeout( async function () {
				if (ref) {
					let index = self.timeoutRefs.indexOf( ref )
					if (index >= -1)
						self.timeoutRefs.splice(index, 1)
				}
				try {
					await fn()
				} catch (err) { self.logger.harconlog(err) }
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
		flowFailed: function ( flowID, errMessage, terms, ignite ) {
			return Proback.quicker( 'ok' )
		},
		flowSucceeded: function ( flowID, result, terms, ignite ) {
			return Proback.quicker( 'ok' )
		},
		close: function ( ) {
			return Proback.quicker( 'ok' )
		}
	}
}
