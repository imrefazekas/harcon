module.exports = {
	name: 'Lina',
	init: async function (options) {
		console.log('Init...', options)
		return 'ok'
	},
	marieChanged: async function ( payload ) {
		this.hasMarieChanged = true
		return 'OK'
	}
}
