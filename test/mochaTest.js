var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var winston = require('winston');

var _ = require("lodash");

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)( { level: 'debug' } )
	]
});
var Inflicter = require('../lib/Inflicter');

describe("harcon", function () {

	var inflicter;
	var marie, julie;

	before(function(done){
		inflicter = new Inflicter( { logger: logger } );

		inflicter.addict('peter', 'greet.*', function(greetings1, greetings2, callback){
			callback(null, 'Hi there!');
		} );
		inflicter.addict('walter', 'greet.*', function(greetings1, greetings2, callback){
			callback(null, 'My pleasure!');
		} );

		marie = {
			name: 'marie',
			context: 'greet',
			simple: function(greetings1, greetings2, callback){
				marie.greetings = [ greetings1, greetings2 ];
				callback( null, 'Bonjour!' );
			}
		};
		var marieFS = inflicter.addicts( marie );
		console.log( marieFS.burst );

		julie = {
			name: 'julie',
			context: 'morning',
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
			inflicter.ignite( 'morning.wakeup', function(err, res){
				console.log( err, res );

				done( );
			} );
		});
	});

	after(function(done){
		done();
	});
});
