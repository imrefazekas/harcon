module.exports = {
	name: 'Margot',
	division: 'maison.cache',
	context: 'paresseux.fille',
	init: function (options, callback) {
		// console.log('Init...', options)
		callback()
	},
	alors: function ( callback ) {
		callback( null, 'Oui?' )
	}
}
