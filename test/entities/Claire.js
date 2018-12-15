module.exports = {
	name: 'Claire',
	division: 'click',
	context: 'greet',
	init: async function (options) {
		console.log('\n\n<<>>', await this.harconEntities() )
		return 'OK'
	},
	// Simple service function listening to the greet.usual message where greet comes from context and usual is identified by the name of the fuction.
	usual: async function () {
		return 'Enchanté, mon plaisir!'
	},
	simple: async function (greetings1, greetings2, terms) {
		return 'Pas du tout!'
	},
	jolie: async function (message, terms) {
		console.log( this.name + ' est jolie < ' + message + ' >' )
		return 'Merci'
	},
	tampis: async function (message, terms) {
		console.log( this.name + ' est tampis < ' + message + ' >' )
		throw new Error('Tampis...')
	}
}
