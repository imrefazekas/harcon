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
	dormir: function ( callback ) {
		callback( null, 'Non, Mais non!' )
	},
	rever: function ( message, callback ) {
		console.log( this.name + ' dort ... ' + message )
		callback( null, 'Non, Mais non!' )
	},
	repose: function ( message, callback ) {
		console.log( this.name + ' dort ... ' + message )
		callback( null, 'Non, Mais non!' )
	},
	chouchou: function ( message, callback ) {
		console.log( this.name + ' dort ... ' + message )
		callback( null, 'Non, Mais non!' )
	}
}
