module.exports = {
	name: 'Marie',
	context: 'greet',
	init: async function (options) {
		// console.log('Init...', this.name, this.division, options)
		return 'ok'
	},
	started: async function () {
		return 'ok'
	},
	// Simple service function listening to the greet.simple message where greet comes from context and simple is identified by the name of the fuction.
	simple: async function (greetings1, greetings2) {
		this.greetings = [greetings1, greetings2]
		await this.shifted( { data: 'content' } )
		return 'Bonjour!'
	},
	jolie: async function (message) {
		console.log( this.name + ' est jolie < ' + message + ' >' )
		return 'Enchentée.'
	},
	seek: async function (data) {
		console.log( this.name + ' seeking : ', data )
		return data * 10
	},
	seekAll: async function (data) {
		console.log( this.name + ' seeking : ', data )
		return [data * 10]
	}
}
