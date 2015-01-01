var Inflicter = require('../lib/Inflicter');

var Logger = require('./WinstonLogger');
var logger = Logger.createWinstonLogger( { file: 'mochatest.log', level: 'debug' } );

var inflicter = new Inflicter( { logger: logger, idLength: 32, marie: {greetings: 'Hi!'} } );

var Publisher = require('../lib/Publisher');
inflicter.addicts( Publisher );
Publisher.watch( './test/components', -1 );

setInterval( function(){
	console.error( 'Sending...' );
	inflicter.ignite( '0', '', 'greet.simple', 'whatsup?', 'how do you do?', function(err, res){
		console.error( err, res );
	} );
}, 2000 );
