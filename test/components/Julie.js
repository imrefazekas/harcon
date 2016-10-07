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
		console.log( this.name + ' reve < ' + message + ' >' )
		callback( null, 'Non, Mais non!' )
	},
	repose: function ( message, callback ) {
		console.log( this.name + ' repose < ' + message + ' >' )
		callback( null, 'Non, Mais non!' )
	},
	chouchou: function ( message, terms, ignite, callback ) {
		console.log( this.name + ' chouchou < ' + message + ' >' )
		ignite( 'Alizee.dormir', callback )
		// callback( null, 'Non, Mais non!' )
	},
	moi: function ( message, terms, ignite, callback ) {
		console.log( this.name + ' moi < ' + message + ' >' )
		callback( null, message )
	},
	choisi: function ( message, terms, ignite, callback ) {
		console.log( this.name + ' choisi < ' + message + ' >' )
		callback( null, 'Non, Mais non!' )
	}
}
