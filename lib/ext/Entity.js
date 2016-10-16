let Proback = require('proback.js')

module.exports = function (self) {
	return {
		firestarter: self,
		notifyTos: { },
		notify: function ( state, event, callback ) {
			if ( !this.notifyTos[ state ] )
				this.notifyTos[ state ] = []
			if ( this.notifyTos[ state ].indexOf(event) === -1 )
				this.notifyTos[ state ].push( event )

			if (callback)
				callback( null, event )
		},
		erupt: self.auditor ? function () {
			return self.erupt.apply( self, arguments )
		} : function () {
			let args = [ null, null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
			return self.erupt.apply( self, args )
		},
		ignite: self.auditor ? function () {
			return self.ignite.apply( self, arguments )
		} : function () {
			let args = [ null, null, self.division ].concat( self.sliceArguments.apply( self, arguments ) )
			return self.ignite.apply( self, args )
		},
		shifted: function () {
			let state = arguments[0]
			let target = arguments[1] || '*'
			let object = { division: self.division, context: self.context, name: self.name, state: state, target: target, notifyTos: this.notifyTos }

			return self.ignite( null, null, self.barrel.systemFirestarter.division, self.barrel.systemFirestarter.name + '.' + 'shifted', object )
		},
		setTimeout: function ( fn, timeout ) {
			let ref = setTimeout( function () {
				if (ref) {
					let index = self.timeoutRefs.indexOf( ref )
					if (index >= -1)
						self.timeoutRefs.splice(index, 1)
				}
				fn()
			}, timeout)
			self.timeoutRefs.push( ref )
		},
		setInterval: function ( fn, interval ) {
			var self = this
			let ref = setInterval( fn, interval )
			self.intervalRefs.push( ref )
		},
		flowFailed: function ( flowID, errMessage, terms, ignite, callback ) {
			return new Promise( (resolve, reject) => {
				Proback.resolver('ok', callback, resolve)
			} )
		},
		flowSucceeded: function ( flowID, result, terms, ignite, callback ) {
			return new Promise( (resolve, reject) => {
				Proback.resolver('ok', callback, resolve)
			} )
		}
	}
}
