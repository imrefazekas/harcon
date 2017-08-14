let Proback = require('proback.js')
module.exports = {
	name: 'Alizee',
	context: 'morning.girls',
	dormir: function ( ignite ) {
		return Proback.quicker( 'Non, non, non!' )
	},
	flegme: function ( ) {
		return new Promise( async (resolve, reject) => {
			await Proback.timeout( 2500 )
			resolve( 'Quoi?')
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
