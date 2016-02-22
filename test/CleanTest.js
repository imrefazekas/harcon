var Inflicter = require('../lib/Inflicter')

var Logger = require('./WinstonLogger')
var logger = Logger.createWinstonLogger( { file: 'mochatest.log', level: 'debug' } )

var inflicter = new Inflicter( { logger: logger, namedResponses: true, idLength: 32, marie: {greetings: 'Hi!'} } )

var path = require('path')

var Publisher = require('./Publisher')
inflicter.addicts( Publisher )
Publisher.watch( path.join( process.cwd(), 'test', 'components' ) )

inflicter.addict( null, 'peter', 'great.*', function (greetings1, greetings2, callback) {
	// callback( new Error('Stay away, please.') )
	callback(null, 'Hi.')
} )
inflicter.addict( null, 'camille', 'great.*', function (greetings1, greetings2, callback) {
	// callback( new Error('Stay away, please.') )
	callback(null, 'Hello.')
} )

setInterval( function () {
	console.error( 'Sending...' )
	inflicter.ignite( '0', '', 'great.simple', 'whatsup?', 'how do you do?', function (err, res) {
		console.error( err, res )
	} )
}, 2000 )
