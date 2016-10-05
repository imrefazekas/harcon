let Inflicter = require('../lib/Inflicter')

let Logger = require('./WinstonLogger')
let logger = Logger.createWinstonLogger( { file: 'mochatest.log', level: 'debug' } )
let inflicter = new Inflicter( { logger: logger, idLength: 32, marie: {greetings: 'Hi!'} } )


let Claire = {
	name: 'Claire',
	context: 'greet',
	simple: function (greetings1, ignite, callback) {
		ignite( 'greet.whiny', greetings1, 'Bon matin!', 'Bon jour!', 'Bon soleil!', callback )
	}
}
let Marie = {
	name: 'Marie',
	context: 'greet',
	whiny: function (greetings1, greetings2, greetings3, greetings4, callback) {
		console.log( greetings1, greetings2, greetings3, greetings4 )
		callback( null, 'Pas du tout!' )
	}
}

inflicter.addicts( Claire )

inflicter.addicts( Marie )

inflicter.ignite( '0', '', 'greet.simple', 'On y vas?', function (err, res) {
	console.error( err, res )
} )
