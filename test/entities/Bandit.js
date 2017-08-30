let Proback = require('proback.js')

module.exports = {
	name: 'Bandit',
	delay: async function ( terms, ignite ) {
		await Proback.timeout( 400 )
		throw new Error('Something bad made')
	}
}
