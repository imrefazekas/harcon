let Proback = require('proback.js')
module.exports = {
	name: 'Lina',
	init: function (options) {
		console.log('Init...', options)
		return Proback.quicker('ok')
	},
	marieChanged: function ( payload ) {
		this.hasMarieChanged = true
		return Proback.quicker( 'OK' )
	}
}
