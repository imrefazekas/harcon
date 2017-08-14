let Proback = require('proback.js')

module.exports = {
	name: 'Domina',
	auditor: true,
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	force: function ( terms, ignite ) {
		let self = this
		terms.tree = 'grow'
		return new Promise( async (resolve, reject) => {
			try {
				let res = await ignite( 0, null, '', 'greet.gentle', 'It is morning!', 'Time to wake up!' )
				let res2 = await ignite( 1, null, self.division + '.click', 'Claire.simple', 'It is morning!', 'Time to wake up!' )
				resolve( [ res, res2 ] )
			} catch (err) { reject(err) }
		} )
	},
	permit: function (message, terms, ignite) {
		console.log( this.name + ' permit < ' + message + ' >' )
		return Proback.quicker( { allowed: false } )
	}
}
