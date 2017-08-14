let async = require('async')
let Proback = require('proback.js')

module.exports = {
	name: 'Bandit',
	delay: function ( terms, ignite ) {
		return new Promise( (resolve, reject) => {
			async.series([
				function (cb) {
					setTimeout( cb, 200 )
				},
				function (cb) {
					setTimeout( function () { cb(new Error('Something bad made')) }, 200 )
				}
			], Proback.handler( null, resolve, reject ) )
		} )
	}
}
