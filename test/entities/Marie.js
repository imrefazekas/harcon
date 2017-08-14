let Proback = require('proback.js')

module.exports = {
	name: 'Marie',
	context: 'greet',
	init: function (options) {
		// console.log('Init...', this.name, this.division, options)
		return Proback.quicker( 'ok' )
	},
	// Simple service function listening to the greet.simple message where greet comes from context and simple is identified by the name of the fuction.
	simple: async function (greetings1, greetings2) {
		this.greetings = [greetings1, greetings2]
		try {
			await this.shifted( { data: 'content' } )
			return Proback.quicker( 'Bonjour!' )
		} catch ( err ) { throw err }
	},
	jolie: function (message) {
		console.log( this.name + ' est jolie < ' + message + ' >' )
		return Proback.quicker( 'Enchentée.' )
	},
	seek: function (data, ignite) {
		console.log( this.name + ' seeking : ', data )
		return Proback.quicker( data * 10 )
	},
	seekAll: function (data, ignite) {
		console.log( this.name + ' seeking : ', data )
		return Proback.quicker( [data * 10] )
	}
}
