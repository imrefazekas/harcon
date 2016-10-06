module.exports = {
	name: 'Alizee',
	context: 'morning.girls',
	dormir: function ( ignite, callback ) {
		console.log( this.name + ' dort ... ' )
		callback( null, 'Non, non, non!' )
	},
	flegme: function ( callback ) {
		setTimeout( function () {
			callback( null, 'Quoi?')
		}, 3000 )
	},
	superFlegme: function ( callback ) {
		setTimeout( function () {
			callback( null, 'Quoi???')
		}, 4500 )
	}
}
