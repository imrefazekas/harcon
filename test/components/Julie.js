module.exports = {
	name: 'Julie',
	context: 'morning',
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	wakeup: function ( ignite, callback ) {
		this.harconlog( null, 'Simple logging test', {}, 'info' )
		ignite( 'greet.gentle', 'It is morning!', 'Time to wake up!', function (err, res) {
			callback(err, res)
		} )
	},
	dormir: function ( ignite, callback ) {
		callback( null, 'Non, Mais non!' )
	}
}
