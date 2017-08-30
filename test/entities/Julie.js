module.exports = {
	name: 'Julie',
	context: 'morning',
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	wakeup: async function ( ignite ) {
		this.harconlog( null, 'Simple logging test', {}, 'info' )
		let res = await ignite( 'greet.gentle', 'It is morning!', 'Time to wake up!')
		return res
	},
	dormir: async function ( ) {
		return 'Non, Mais non!'
	},
	rever: async function ( message ) {
		console.log( this.name + ' reve < ' + message + ' >' )
		return 'Non, Mais non!'
	},
	repose: async function ( message ) {
		console.log( this.name + ' repose < ' + message + ' >' )
		return 'Non, Mais non!'
	},
	chouchou: async function ( message, terms, ignite ) {
		console.log( this.name + ' chouchou < ' + message + ' >' )
		return ignite( 'Alizee.dormir' )
	},
	moi: async function ( message, terms, ignite ) {
		console.log( this.name + ' moi < ' + message + ' >' )
		return message
	},
	choisi: async function ( message, terms, ignite ) {
		console.log( this.name + ' choisi < ' + message + ' >' )
		return 'Non, Mais non!'
	},
	distribute: async function (terms, ignite) {
		return [ 10, 45, 50 ]
	},
	waterfall: async function (terms, ignite) {
		return [ 10, 45, 50 ]
	}
}
