module.exports = {
	name: 'Marie',
	context: 'greet',
	init: function (options, callback) {
		console.log('Init...', this.name, this.division, options)
		callback()
	},
	// Simple service function listening to the greet.simple message where greet comes from context and simple is identified by the name of the fuction.
	simple: function (greetings1, greetings2, callback) {
		this.greetings = [greetings1, greetings2]
		this.shifted( { data: 'content' } )
		callback(null, 'Bonjour!')
	},
	jolie: function (message, callback) {
		console.log( this.name + ' est jolie < ' + message + ' >' )
		callback(null, 'Enchentée.')
	}
}
