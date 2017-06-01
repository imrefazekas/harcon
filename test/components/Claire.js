module.exports = {
	name: 'Claire',
	division: 'click',
	context: 'greet',
	init: function (options, callback) {
		// console.log('Init...', this.name, this.division, options)
		callback()
	},
	// Simple service function listening to the greet.usual message where greet comes from context and usual is identified by the name of the fuction.
	usual: function (callback) {
		callback(null, 'Enchanté, mon plaisir!')
	},
	simple: function (greetings1, greetings2, terms, ignite, callback) {
		callback( null, 'Pas du tout!' )
	},
	jolie: function (message, terms, ignite, callback) {
		console.log( this.name + ' est jolie < ' + message + ' >' )
		callback( null, 'Merci' )
	},
	tampis: function (message, terms, ignite, callback) {
		console.log( this.name + ' est tampis < ' + message + ' >' )
		callback( new Error('Tampis...') )
	}
}
