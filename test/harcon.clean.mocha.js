const assert = require('assert')
let chai = require('chai')
let should = chai.should()
let expect = chai.expect

let async = require('async')

let fs = require('fs')
let path = require('path')

// Requires harcon. In your app the form 'require('harcon')' should be used
let Harcon = require('../lib/Inflicter')

let Logger = require('./PinoLogger')

let Clerobee = require('clerobee')
let clerobee = new Clerobee(16)

let Proback = require('proback.js')

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, ' .... reason:', reason)
})

let harconName = 'HarconSys'
describe('harcon', function () {
	let inflicter

	before( async function () {
		let logger = Logger.createPinoLogger( { file: 'mochatest.log', level: 'debug' } )
		try {
			let harcon = new Harcon( {
				name: harconName,
				logger: logger,
				idLength: 32,
				blower: { commTimeout: 2000, tolerates: ['Alizee.superFlegme'] },
				mortar: { enabled: false, folder: path.join( __dirname, 'components' ), liveReload: true },
				Marie: {greetings: 'Hi!'}
			} )

			inflicter = await harcon.init()

			await inflicter.inflicterEntity.addict( null, 'peter', 'greet.*', function (greetings1, greetings2) {
				return Proback.quicker('Hi there!')
			} )
			await inflicter.inflicterEntity.addict( null, 'walter', 'greet.*', function (greetings1, greetings2) {
				return Proback.quicker('My pleasure!')
			} )

			console.log('\n\n-----------------------\n\n')
			assert.ok( 'Harcon initiated...' )
		} catch (err) { assert.fail( err ) }
	})

	describe('Test Harcon system calls', function () {
		it('Retrieve divisions...', async function () {
			let divisionts = await inflicter.divisions()
			console.log('------', divisionts)
			// expect( divisions ).to.eql( [ harconName, harconName + '.click', 'HarconSys.maison.cache' ] )
		})

		it('Retrieve entities...', async function () {
			let entities = await inflicter.entities( )
			let names = entities.map( function (entity) { return entity.name } ).sort()
			console.log( '...', entities, names )
			// expect( names ).to.eql( [ 'Alizee', 'Bandit', 'Charlotte', 'Claire', 'Domina', 'Inflicter', 'Julie', 'Lina', 'Margot', 'Marie', 'Marion', 'Mortar', 'peter', 'walter' ] )
		})

		it('Send for divisions...', async function () {
			let res = await inflicter.ignite( clerobee.generate(), null, '', 'Inflicter.divisions')
			console.log( '.>>>..', res )
		})

		it('Clean internals', async function () {
			let comms = await inflicter.pendingComms( )
			console.log('----------- ', comms)
			comms.forEach( function (comm) {
				expect( Object.keys(comm) ).to.have.lengthOf( 0 )
			} )
		})

		it('Walter check', async function () {
			let res = await inflicter.ignite( clerobee.generate(), null, '', 'greet.hello', 'Bonjour!', 'Salut!')
			console.log( '.>>>..', res )
		})
	})

	/*
	describe('Test Harcon status calls', function () {
		it('Retrieve divisions...', function (done) {
			setTimeout( function () {
				inflicter.divisions().then( function (divisions) {
					// expect( divisions ).to.eql( [ harconName, harconName + '.click', 'HarconSys.maison.cache' ] )
					done()
				} ).catch(function (error) {
					done(error)
				})
			}, 500 )
		})

		it('Retrieve entities...', function (done) {
			inflicter.entities( function (err, entities) {
				let names = entities.map( function (entity) { return entity.name } ).sort()
				console.log( '...', err, entities, names )
				expect( names ).to.eql( [ 'Alizee', 'Bandit', 'Charlotte', 'Claire', 'Domina', 'Inflicter', 'Julie', 'Lina', 'Margot', 'Marie', 'Marion', 'Mortar', 'peter', 'walter' ] )
				done(err)
			} )
		})

		it('Send for divisions...', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'Inflicter.divisions', function (err, res) {
				console.log( err, res )
				done()
			} )
		})

		it('Clean internals', function (done) {
			inflicter.pendingComms( function (err, comms) {
				comms.forEach( function (comm) {
					expect( Object.keys(comm) ).to.have.lengthOf( 0 )
				} )
				done(err)
			} )
		})

	})

	describe('Depth handling', function () {
		it('multilevel domains', function (done) {
			inflicter.ignite( clerobee.generate(), null, 'HarconSys.maison.cache', 'Margot.alors', (err, res) => {
				console.log( '\n\n>>...........>', err, res )
				done()
			} )
			.catch( (reason) => { } )
		})
		it('multilevel contextes', function (done) {
			inflicter.ignite( clerobee.generate(), null, 'HarconSys.maison.cache', 'paresseux.fille.alors', (err, res) => {
				console.log( '\n\n>>>', err, res )
				done()
			} )
			.catch( (reason) => { } )
		})
	})

	describe('Error handling', function () {
		it('Throw error', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'Bandit.delay', function (err) {
				should.exist(err)
				done()
			} )
			.catch( (reason) => { } )
		})
	})

	describe('State shifting', function () {
		it('Simple case', function (done) {
			let Lina = inflicter.barrel.firestarter('Lina').object
			inflicter.ignite( clerobee.generate(), null, '', 'Marie.notify', 'data', 'Lina.marieChanged', function (err) {
				if (err) return done(err)

				setTimeout( () => {
					inflicter.ignite( clerobee.generate(), null, '', 'Marie.simple', 'Bonjour', 'Salut', function (err) {
						if (err) return done(err)

						let pingInterval = setInterval( function () {
							if ( Lina.hasMarieChanged ) {
								clearInterval( pingInterval )
								done()
							}
						}, 500 )
					} )
				}, 100 )
			} )
			.catch( (reason) => { } )
		})
	})
	describe('Harcon distinguish', function () {
		it('Access distinguished entity', function (done) {
			inflicter.ignite( '0', null, '', 'Charlotte.access', function (err, res) {
				should.not.exist(err)
				should.exist(res)
				expect( res ).to.include( 'D\'accord?' )
				done( )
			} )
			.catch( (reason) => { } )
		})
		it('Access distinguished entity', function (done) {
			inflicter.ignite( '0', null, '', 'Charlotte-Unique.access', function (err, res) {
				should.not.exist(err)
				should.exist(res)
				expect( res ).to.include( 'D\'accord?' )
				done( )
			} )
			.catch( (reason) => { } )
		})
	})

	describe('Erupt flow', function () {
		it('Simple greetings by name is', function (done) {
			async.series([
				inflicter.erupt( '0', null, '', 'Marie.simple', 'whatsup?', 'how do you do?'),
				inflicter.erupt( '0', null, '', 'greet.simple', 'whatsup?', 'how do you do?')
			], done)
		})
		it('Marion', function (done) {
			// Sending a morning message and waiting for the proper answer
			inflicter.simpleIgnite( 'Marion.force', function (err, res) {
				should.not.exist(err)
				should.exist(res)

				expect( res[0][0] ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
				expect( res[0][1] ).to.eql( [ 'Pas du tout!' ] )

				done( )
			} )
			.catch( (reason) => { } )
		})
	} )

	describe('Harcon workflow', function () {

		it('Simple greetings by name is', function (done) {
			// Sending a greetings message with 2 parameters and waiting for the proper answer
			inflicter.ignite( '0', null, '', 'Marie.simple', 'whatsup?', 'how do you do?', function (err, res) {
				should.not.exist(err)
				should.exist(res)
				expect( res ).to.include( 'Bonjour!' )
				done( )
			} )
			.catch( (reason) => { } )
		})

		it('Simple greetings is', function (done) {
			// Sending a greetings message with 2 parameters and waiting for the proper answer
			inflicter.ignite( '0', null, '', 'greet.simple', 'whatsup?', 'how do you do?', function (err, res) {
				// console.log( err, res )
				should.not.exist(err)
				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )

				done( )
			} )
			.catch( (reason) => { } )
		})

		it('Morning greetings is', function (done) {
			// Sending a morning message and waiting for the proper answer
			inflicter.ignite( '0', null, '', 'morning.wakeup', function (err, res) {
				// console.log( err, res )

				expect(err).to.be.a('null')
				expect(res[0]).to.eql( [ 'Hi there!', 'My pleasure!' ] )
				done( )
			} )
			.catch( (reason) => { } )
		})

		it('General dormir', function (done) {
			inflicter.ignite( '0', null, '', 'morning.dormir', function (err, res) {
				// console.log( err, res )

				expect(err).to.be.a('null')
				expect(res).to.eql( [ 'Non, non, non!', 'Non, Mais non!' ] )
				done( )
			} )
			.catch( (reason) => { } )
		})

		it('Specific dormir', function (done) {
			inflicter.ignite( '0', null, '', 'morning.girls.dormir', function (err, res) {
				// console.log( err, res )

				expect(err).to.be.a('null')
				expect(res).to.eql( [ 'Non, non, non!', 'Non, Mais non!' ] )
				done( )
			} )
			.catch( (reason) => { } )
		})

		it('No answer', function (done) {
			// Sending a morning message and waiting for the proper answer
			inflicter.ignite( '0', null, '', 'cave.echo', function (err, res) {
				expect(err).to.be.an.instanceof( Error )
				expect(res).to.be.a('null')

				done( )
			} )
			.catch( (reason) => { } )
		})

		it('Timeout test', function (done) {
			this.timeout(5000)
			inflicter.simpleIgnite( 'Alizee.flegme', function (err, res) {
				expect(err).to.be.an.instanceof( Error )
				expect(res).to.be.a('null')

				done( )
			} )
			.catch( (reason) => { } )
		})

		it('Tolerated messages test', function (done) {
			this.timeout(5000)
			inflicter.simpleIgnite( 'Alizee.superFlegme', function (err, res) {
				expect(err).to.be.a('null')
				expect(res).to.eql( [ 'Quoi???' ] )

				done( err )
			} )
			.catch( (reason) => { } )
		})

		it('Division Promise test', function (done) {
			inflicter.ignite( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?' )
				.then( function ( res ) {
					should.exist(res)

					expect( res ).to.include( 'Hi there!' )
					expect( res ).to.include( 'My pleasure!' )
					expect( res ).to.include( 'Bonjour!' )
					expect( res ).to.include( 'Pas du tout!' )

					done()
				})
				.catch( function ( reason ) {
					done( reason )
				} )
		})

		it('Division test', function (done) {
			// Sending a morning message and waiting for the proper answer
			inflicter.ignite( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?', function (err, res) {
				// console.log( err, res )

				should.not.exist(err)
				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )
				expect( res ).to.include( 'Pas du tout!' )

				done( )
			} )
		})

		it('Domina', function (done) {
			// Sending a morning message and waiting for the proper answer
			inflicter.simpleIgnite( 'Domina.force', function (err, res) {
				should.not.exist(err)
				should.exist(res)

				expect( res[0][0] ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
				expect( res[0][1] ).to.eql( [ 'Pas du tout!' ] )

				done( )
			} )
		})

		it('AsyncAwait', function (done) {
			inflicter.simpleIgnite( 'Marie.gaminerie', 'Salut!', function (err, res) {
				console.log(':::::::::', err, res)
				done( )
			} )
		})

		it('Deactivate', function (done) {
			// Sending a morning message and waiting for the proper answer
			inflicter.deactivate('Claire')
			inflicter.ignite( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?', function (err, res) {
				// console.log( err, res )

				should.not.exist(err)
				should.exist(res)

				expect( res ).to.not.include( 'Pas du tout!' )

				done( )
			} )
		})
	})

	describe('Live reload test', function () {
		it('Changing Alizee', function (done) {
			this.timeout( 15000 )

			setTimeout( () => {
				fs.writeFileSync( path.join( __dirname, 'components', 'Lina.js'), fs.readFileSync(
					path.join( __dirname, 'livereload', 'Lina.js'), { encoding: 'utf8' }
				), { encoding: 'utf8' } )
			}, 2000 )

			setTimeout( () => {
				inflicter.ignite( '0', null, '', 'Lina.flying', (err, res) => {
					should.not.exist(err)
					expect( res ).to.eql( [ 'Flying in the clouds...' ] )
					done()
				} )
			}, 7000 )
		})
	})

	describe('Post health tests', function () {
		it('Clean internals', function (done) {
			inflicter.pendingComms( function (err, comms) {
				comms.forEach( function (comm) {
					expect( Object.keys(comm) ).to.have.lengthOf( 0 )
				} )
				done(err)
			} )
		})
	})
	*/

	after(async function () {
		// Shuts down Harcon when it is not needed anymore
		if (inflicter)
			await inflicter.close( )
	})
})
