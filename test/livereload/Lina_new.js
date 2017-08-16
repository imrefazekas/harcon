let Proback = require('proback.js')
module.exports = {
	name: 'Lina',
	init: function (options) {
		console.log('Init_NEW...', options)
		return Proback.quicker('ok')
	},
	marieChanged: function ( payload ) {
		this.hasMarieChanged = true
		return Proback.quicker( 'OK' )
	},
	flying: function ( ) {
		return Proback.quicker( 'Flying in the clouds...' )
	}
}
