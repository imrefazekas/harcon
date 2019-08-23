let Proback = require('proback.js')
module.exports = {
	name: 'Alizee',
	context: 'morning.girls',

	supervener: 'Vener',

	dormir: async function ( terms ) {
		return 'Non, non, non!'
	},
	flegme: async function ( terms ) {
		await Proback.timeout( 2500 )
		return 'Quoi?'
	},
	superFlegme: async function ( terms ) {
		return new Promise( (resolve, reject) => {
			setTimeout( function () {
				resolve( 'Quoi???')
			}, 2500 )
		} )
	},
	silent: async function ( ) {
		await Proback.timeout( 1900 )
		return 'ssss'
	}
}
