let async = require('async')

module.exports = {
	name: 'Bandit',
	delay: function ( terms, ignite, callback ) {
		async.series([
			function (cb) {
				setTimeout( cb, 200 )
			},
			function (cb) {
				setTimeout( function () { cb(new Error('Something bad made')) }, 200 )
			}
		], callback )
	}
}
