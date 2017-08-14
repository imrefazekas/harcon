let Proback = require('proback.js')

module.exports = {
	name: 'Julie',
	context: 'morning',
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	wakeup: async function ( ignite ) {
		this.harconlog( null, 'Simple logging test', {}, 'info' )
		let res = await ignite( 'greet.gentle', 'It is morning!', 'Time to wake up!')
		return res
	},
	dormir: function ( ) {
		return Proback.quicker( 'Non, Mais non!' )
	},
	rever: function ( message ) {
		console.log( this.name + ' reve < ' + message + ' >' )
		return Proback.quicker( 'Non, Mais non!' )
	},
	repose: function ( message ) {
		console.log( this.name + ' repose < ' + message + ' >' )
		return Proback.quicker( 'Non, Mais non!' )
	},
	chouchou: function ( message, terms, ignite ) {
		console.log( this.name + ' chouchou < ' + message + ' >' )
		return ignite( 'Alizee.dormir' )
	},
	moi: function ( message, terms, ignite ) {
		console.log( this.name + ' moi < ' + message + ' >' )
		return Proback.quicker( message )
	},
	choisi: function ( message, terms, ignite ) {
		console.log( this.name + ' choisi < ' + message + ' >' )
		return Proback.quicker( 'Non, Mais non!' )
	},
	distribute: function (terms, ignite) {
		return Proback.quicker( [ 10, 45, 50 ] )
	},
	waterfall: function (terms, ignite) {
		return Proback.quicker( [ 10, 45, 50 ] )
	}
}
