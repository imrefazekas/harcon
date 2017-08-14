let Proback = require('proback.js')
module.exports = {
	name: 'Claire',
	division: 'click',
	context: 'greet',
	init: function (options) {
		return Proback.quicker( 'OK' )
	},
	// Simple service function listening to the greet.usual message where greet comes from context and usual is identified by the name of the fuction.
	usual: function () {
		return Proback.quicker( 'Enchanté, mon plaisir!' )
	},
	simple: function (greetings1, greetings2, terms, ignite) {
		return Proback.quicker( 'Pas du tout!' )
	},
	jolie: function (message, terms, ignite) {
		console.log( this.name + ' est jolie < ' + message + ' >' )
		return Proback.quicker( 'Merci' )
	},
	tampis: function (message, terms, ignite) {
		console.log( this.name + ' est tampis < ' + message + ' >' )
		return Proback.thrower( new Error('Tampis...') )
	}
}
