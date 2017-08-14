let Proback = require('proback.js')
module.exports = {
	name: 'Alizee',
	context: 'morning.girls',
	dormir: function ( ignite ) {
		return Proback.quicker( 'Non, non, non!' )
	},
	flegme: function ( ) {
		console.log('>>>>>>>>>')
		return new Promise( (resolve, reject) => {
			setTimeout( function () {
				console.log('??????')
				resolve( 'Quoi?')
			}, 2500 )
		} )
	},
	superFlegme: function ( ) {
		return new Promise( (resolve, reject) => {
			setTimeout( function () {
				resolve( 'Quoi???')
			}, 2500 )
		} )
	}
}
