var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

// Requires harcon. In your app the form 'require('harcon');' should be used
var Inflicter = require('../lib/Inflicter');

var Logger = require('./WinstonLogger');

var Publisher = require('../lib/Publisher');

describe("harcon", function () {
	var inflicter;

	before(function(done){
		var logger = Logger.createWinstonLogger( { file: 'test.log', level: 'debug' } );

		// Initializes the Harcon system
		// also initialize the deployer component which will automaticall publish every component found in folder './test/components'
		inflicter = new Inflicter( { logger: logger, idLength: 32, marie: {greetings: 'Hi!'} } );

		inflicter.addicts( Publisher );
		Publisher.watch( './test/components', -1 );

		// Publishes an event listener function: Peter. It just sends a simple greetings in return
		inflicter.addict('peter', 'greet.*', function(greetings1, greetings2, callback){
			callback(null, 'Hi there!');
		} );

		// Publishes another function listening all messages which name starts with 'greet'. It just sends a simple greetings in return
		inflicter.addict('walter', 'greet.*', function(greetings1, greetings2, callback){
			callback(null, 'My pleasure!');
		} );

		done();
	});

	describe("Harcon workflow", function () {
		it('Patient...', function(done){
			setTimeout( function(){ console.log( inflicter.listeners() ); done(); }, 1500 );
		});

		it('Simple greetings is', function(done){
			// Sending a greetings message with 2 parameters and waiting for the proper answer
			inflicter.ignite( '', 'greet.simple', 'whatsup?', 'how do you do?', function(err, res){
				console.log( err, res );
				should.not.exist(err); should.exist(res);

				expect( res ).to.include( 'Hi there!' );
				expect( res ).to.include( 'My pleasure!' );
				expect( res ).to.include( 'Bonjour!' );

				done( );
			} );
		});

		it('Morning greetings is', function(done){
			// Sending a morning message and waiting for the proper answer
			inflicter.ignite( '', 'morning.wakeup', function(err, res){
				console.log( err, res );

				expect(err).to.be.a('null');
				expect(res[0]).to.eql( [ 'Hi there!', 'My pleasure!' ] );
				done( );
			} );
		});

		it('No answer', function(done){
			// Sending a morning message and waiting for the proper answer
			inflicter.ignite( '', 'cave.echo', function(err, res){
				console.log( err, res );

				expect(err).to.be.an.instanceof( Error );
				expect(res).to.be.a('null');

				done( );
			} );
		});
	});

	after(function(done){
		// Shuts down Harcon when it is not needed anymore
		inflicter.close();
		done();
	});
});
