module.exports = {
	name: 'Lina',
	init: async function (options) {
		console.log('Init_NEW...', options)
		return 'ok'
	},
	marieChanged: async function ( payload ) {
		this.hasMarieChanged = true
		return 'OK'
	},
	flying: async function ( ) {
		return 'Flying in the clouds...'
	}
}
