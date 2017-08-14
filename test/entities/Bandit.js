let Proback = require('proback.js')

module.exports = {
	name: 'Bandit',
	delay: function ( terms, ignite ) {
		return new Promise( async (resolve, reject) => {
			await Proback.timeout( 400 )
			reject(new Error('Something bad made'))
		} )
	}
}
