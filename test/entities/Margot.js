let Proback = require('proback.js')

module.exports = {
	name: 'Margot',
	division: 'maison.cache',
	context: 'paresseux.fille',
	init: function (options) {
		// console.log('Init...', options)
		return Proback.quicker( 'ok' )
	},
	alors: function ( ) {
		return Proback.quicker( 'Oui?' )
	}
}
