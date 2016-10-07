let async = require('async')

module.exports = {
	name: 'Domina',
	auditor: true,
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	force: function ( terms, ignite, callback ) {
		let self = this
		terms.tree = 'grow'
		async.series([
			function (cb) {
				ignite( 0, null, '', 'greet.gentle', 'It is morning!', 'Time to wake up!', cb )
			},
			function (cb) {
				ignite( 1, null, self.division + '.click', 'Claire.simple', 'It is morning!', 'Time to wake up!', cb )
			}
		], callback )
	},
	permit: function (message, terms, ignite, callback) {
		console.log( this.name + ' permit < ' + message + ' >' )
		callback( null, { allowed: false } )
	}
}
