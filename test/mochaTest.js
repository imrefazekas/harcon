var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

var _ = require("lodash");

// Requires harcon. In your app the form 'require('harcon');' should be used
var Inflicter = require('../lib/Inflicter');

describe("harcon", function () {
	var inflicter;
	var marie, julie;

	before(function(done){
		// Initializes the Harcon system
		inflicter = new Inflicter( { logger: { file: 'test.log', level: 'debug' }, idLength: 32 } );

		// Publishes an event listener function: Peter. It just sends a simple greetings in return
		inflicter.addict('peter', 'greet.*', function(greetings1, greetings2, callback){
			callback(null, 'Hi there!');
		} );

		// Publishes another function listening all messages which name starts with 'greet'. It just sends a simple greetings in return
		inflicter.addict('walter', 'greet.*', function(greetings1, greetings2, callback){
			callback(null, 'My pleasure!');
		} );

		// Publishes an event handler Object: Marie. An event lister object encloses its name, context and service functions
		marie = {
			name: 'marie',
			context: 'greet',
			// Simple service function listening to the greet.simple message where greet comes from context and simple is identified by the name of the fuction.
			simple: function(greetings1, greetings2, callback){
				marie.greetings = [ greetings1, greetings2 ];
				callback( null, 'Bonjour!' );
			}
		};
		var marieFS = inflicter.addicts( marie );

		julie = {
			name: 'julie',
			context: 'morning',
			// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
			wakeup: function( callback ){
				this.ignite( 'greet.gentle', 'It is morning!', 'Time to wake up!', function(err, res){
					callback(err, res);
				} );
			}
		};
		var julieFS = inflicter.addicts( julie );

		done();
	});

	describe("Harcon workflow", function () {
		it('Simple greetings is', function(done){
			// Sending a greetings message with 2 parameters and waiting for the proper answer
			inflicter.ignite( 'greet.simple', 'whatsup?', 'how do you do?', function(err, res){
				console.log( err, res );
				should.not.exist(err); should.exist(res);

				expect( marie.greetings ).to.include( 'whatsup?' );
				expect( marie.greetings ).to.include( 'how do you do?' );

				expect( res ).to.include( 'Hi there!' );
				expect( res ).to.include( 'My pleasure!' );
				expect( res ).to.include( 'Bonjour!' );

				done( );
			} );
		});

		it('Morning greetings is', function(done){
			// Sending a morning message and waiting for the proper answer
			inflicter.ignite( 'morning.wakeup', function(err, res){
				console.log( err, res );

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
