module.exports = {
	name: 'Lina',
	init: function (options, callback) {
		console.log('Init...', options)
		callback()
	},
	marieChanged: function ( payload, callback ) {
		this.hasMarieChanged = true
		callback( null, 'OK' )
	},
	flying: function ( callback ) {
		callback( null, 'Flying in the clouds...' )
	}
}
