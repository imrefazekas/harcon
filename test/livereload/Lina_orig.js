module.exports = {
	name: 'Lina',
	init: async function (options) {
		// console.log('Init...', options)
		return 'ok'
	},
	marieChanged: async function ( payload ) {
		this.hasMarieChanged = true
		return 'OK'
	},
	marionChanged: async function ( payload ) {
		this.hasMarionChanged = true
		return 'OK'
	}
}
