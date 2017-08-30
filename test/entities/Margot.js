let Proback = require('proback.js')

module.exports = {
	name: 'Margot',
	division: 'maison.cache',
	context: 'paresseux.fille',
	init: async function (options) {
		// console.log('Init...', options)
		return 'ok'
	},
	alors: async function ( ) {
		return 'Oui?'
	}
}
