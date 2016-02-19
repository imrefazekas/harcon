var async = require('async')

module.exports = {
	name: 'Domina',
	auditor: true,
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	force: function ( ignite, callback ) {
		async.series([
			function (cb) {
				ignite( 0, '', 'greet.gentle', 'It is morning!', 'Time to wake up!', cb )
			},
			function (cb) {
				ignite( 1, 'Inflicter.click', 'Claire.simple', 'It is morning!', 'Time to wake up!', cb )
			}
		], callback )
	}
}
