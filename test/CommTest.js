var Inflicter = require('../lib/Inflicter')

var Logger = require('./WinstonLogger')
var logger = Logger.createWinstonLogger( { file: 'mochatest.log', level: 'debug' } )
var inflicter = new Inflicter( { logger: logger, idLength: 32, marie: {greetings: 'Hi!'} } )


var Claire = {
	name: 'Claire',
	context: 'greet',
	simple: function (greetings1, ignite, callback) {
		ignite( 'greet.whiny', greetings1, 'Bon matin!', 'Bon jour!', 'Bon soleil!', callback )
	}
}
var Marie = {
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
