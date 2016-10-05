let Inflicter = require('../lib/Inflicter')

let Logger = require('./WinstonLogger')
let logger = Logger.createWinstonLogger( { file: 'mochatest.log', level: 'debug' } )

let inflicter = new Inflicter( { logger: logger, namedResponses: true, idLength: 32, marie: {greetings: 'Hi!'} } )

let path = require('path')

let Publisher = require('./Publisher')
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
