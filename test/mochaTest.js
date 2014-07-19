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
	var alice;

	before(function(done){
		inflicter = new Inflicter( logger );

		inflicter.addict('steve', 'morning.*', function(greetings, callback){
			callback(null, 'Leave me please!');
		} );
		inflicter.addict('bob', 'greet.*', function( greetings1, greetings2, callback ){
			this.ignite( 'morning.wakeup', 'It is morning, time to go!', function(err, res){
				callback(null, 'Hive 6!');
			} );
		} );
		alice = {
			name: 'alice',
			tree: 'almafa',
			moduleFn: function(greetings1, greetings2, callback){
				alice.greetings = [ greetings1, greetings2 ];
				callback( null, this.tree );
			}
		};
		inflicter.addicts( alice, [ 'greet.*' ], [ alice.moduleFn ] );

		done();
	});

	describe("Catty's workflow", function () {

		it('Greetings call is', function(done){
			inflicter.ignite( 'catty', 'greet.everyone', 'whatsup?', 'how do you do?', function(err, res){
				should.not.exist(err); should.exist(res);
				expect( alice.greetings ).to.include( 'whatsup?' );
				expect( alice.greetings ).to.include( 'how do you do?' );

				var responses = _.map( res, function(comm){ return comm.response; });
				expect( responses ).to.include( 'Hive 6!' );
				expect( responses ).to.include( 'almafa' );

				done( );
			} );
		});

	});

	after(function(done){
		done();
	});
});
