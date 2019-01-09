const assert = require('assert')
let chai = require('chai')
let should = chai.should()
let expect = chai.expect

let fs = require('fs')
let util = require('util')
let readFile = util.promisify(fs.readFile)
let writeFile = util.promisify(fs.writeFile)

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
			const oldLina = await readFile( path.join( __dirname, 'livereload', 'Lina_orig.js'), { encoding: 'utf8' } )
			await writeFile( path.join( __dirname, 'entities', 'Lina.js'), oldLina, { encoding: 'utf8' } )

			let harcon = new Harcon( {
				name: harconName,
				logger: logger,
				idLength: 32,
				barrel: { Warper: require( './EcdsaWarper' ), warper: { message: Buffer.from( clerobee.generate( 32 ), 'utf8' ).toString('hex') } },
				blower: { commTimeout: 2000, tolerates: ['Alizee.flegme'] },
				mortar: { enabled: true, folder: path.join( __dirname, 'entities' ), liveReload: true, liveReloadTimeout: 2000 },
				Marie: {greetings: 'Hi!'}
			} )

			inflicter = await harcon.init()

			inflicter.inflicterEntity.terms['*'] = { reference: 'secret' }

			await inflicter.inflicterEntity.deploy( null, 'peter', 'greet.*', function (greetings1, greetings2) {
				console.log('Peter is logging...')
				return Proback.quicker('Hi there!')
			} )
			await inflicter.inflicterEntity.deploy( null, 'walter', 'greet.*', function (greetings1, greetings2) {
				return Proback.quicker('My pleasure!')
			} )

			console.log('\n\n-----------------------\n\n')
			assert.ok( 'Harcon initiated...' )
		} catch (err) { assert.fail( err ) }
	})

	describe('Test Harcon system calls', function () {
		it('Retrieve divisions...', async function () {
			let divisions = await inflicter.divisions()
			expect( divisions.sort() ).to.eql( [ harconName, harconName + '.click', 'HarconSys.maison.cache' ] )
		})
		it('Retrieve entities...', async function () {
			let entities = await inflicter.entities( )
			let names = entities.map( function (entity) { return entity.name } ).sort()
			expect( names ).to.eql( [ 'Alizee', 'Bandit', 'Boss', 'Charlotte', 'Claire', 'Domina', 'Inflicter', 'Julie', 'Lina', 'Margot', 'Marie', 'Marion', 'Mortar', 'peter', 'walter' ] )
		})
		it('Send for divisions...', async function () {
			let res = await inflicter.request( clerobee.generate(), null, '', 'Inflicter.divisions')
			expect( res.sort() ).to.eql( [ 'HarconSys', 'HarconSys.click', 'HarconSys.maison.cache' ] )
		})
		it('Clean internals', async function () {
			let comms = await inflicter.pendingComms( )
			comms.forEach( function (comm) {
				expect( Object.keys(comm) ).to.have.lengthOf( 0 )
			} )
		})
		it('Walter check', async function () {
			let res = await inflicter.request( clerobee.generate(), null, '', 'greet.hello', 'Bonjour!', 'Salut!')
			expect( res ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
		})
		it('Walter inform', async function () {
			await inflicter.inform( clerobee.generate(), null, '', 'greet.hello', 'Bonjour!', 'Salut!')
		})
	})
	describe('parallelism', function () {
		it('Alize silent', async function () {
			this.timeout(15000)
			for (let i = 1; i <= 25; ++i) {
				await Proback.timeout( i * 25 )
				let time = Date.now()
				inflicter.request( clerobee.generate(), null, '', 'Alizee.silent' ).then( (res) => {
					console.log( (Date.now() - time) + ' :: ' + res )
				} ).catch( (reason) => {
					console.log( (Date.now() - time) + ' !! ' + reason )
				} )
			}
		})
	})

	describe('simple messages', function () {
		it('Alize dormir', async function () {
			let res = await inflicter.request( clerobee.generate(), null, '', 'Alizee.dormir' )
			expect(res).to.eql( 'Non, non, non!' )
		})
		it('Alize flegme', async function () {
			this.timeout(5000)
			let res = await inflicter.request( clerobee.generate(), null, '', 'Alizee.flegme' )
			expect(res).to.eql( 'Quoi?' )
		})
		it('Alize superFlegme', async function () {
			this.timeout(5000)
			try {
				await inflicter.request( clerobee.generate(), null, '', 'Alizee.superFlegme' )
				assert.fail( 'Should not be here...' )
			} catch (err) { expect(err).to.be.an.instanceof( Error ) }
		})
		it('Boss shrinking', async function () {
			this.timeout(5000)
			let res = await inflicter.request( clerobee.generate(), null, '', 'Boss.shrink', 'hello?' )
			expect(res).to.eql( 'ok' )
		})
	})

	describe('Harcon broadcasting', function () {
		it('Broatcasting', async function () {
			let res = await inflicter.request( clerobee.generate(), null, '', '*|Alizee.dormir' )
			expect(res).to.eql( 'Non, non, non!' )
		})
	})

	describe('Depth handling', function () {
		it('multilevel divisions', async function () {
			let res = await inflicter.request( clerobee.generate(), null, 'HarconSys.maison.cache', 'Margot.alors' )
			expect(res).to.eql( 'Oui?' )
		})
		it('multilevel contextes', async function () {
			let res = await inflicter.request( clerobee.generate(), null, 'HarconSys.maison.cache', 'paresseux.fille.alors' )
			expect(res).to.eql( 'Oui?' )
		})
	})

	describe('Error handling', function () {
		it('Throw error', async function () {
			try {
				await inflicter.request( clerobee.generate(), null, '', 'Bandit.delay' )
				assert.fail( 'Should not be here...' )
			} catch (err) { expect(err).to.be.an.instanceof( Error ) }
		})
	})

	describe('State shifting', function () {
		it('Simple case', async function () {
			let Lina = inflicter.barrel.firestarter('Lina').object
			await inflicter.request( clerobee.generate(), null, '', 'Marie.notify', 'data', '', 'Lina.marieChanged')

			await Proback.timeout( 250 )
			await inflicter.request( clerobee.generate(), null, '', 'Marie.simple', 'Bonjour', 'Salut' )

			await Proback.timeout( 250 )
			await Proback.until( function () {
				return Lina.hasMarieChanged
			}, 250 )
		})
	})

	describe('Harcon distinguish', function () {
		it('Access distinguished entity', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'Charlotte.access')
				should.exist(res)
				expect( res ).to.include( 'D\'accord?' )
			} catch ( err ) { console.error(err) }
		})
		it('Access distinguished entity', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'Charlotte-Unique.access')
				should.exist(res)
				expect( res ).to.include( 'D\'accord?' )
			} catch ( err ) { console.error(err) }
		})
	})

	describe('Erupt flow', function () {
		it('Simple greetings by name is', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'Marie.simple', 'whatsup?', 'how do you do?')
				let res2 = await inflicter.request( '0', null, '', 'greet.simple', 'whatsup?', 'how do you do?')
				console.log( '.>??????>>..', res, res2 )
			} catch (err) { console.error(err) }
		})
		it('Marion', async function () {
			// Sending a morning message and waiting for the proper answer
			try {
				let res = await inflicter.request( '0', null, '', 'Marion.force' )
				should.exist(res)
				expect( res[0] ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
				expect( res[1] ).to.eql( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
	} )

	describe('Harcon workflow', function () {
		it('Simple greetings by name is', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'Marie.simple', 'whatsup?', 'how do you do?')
				should.exist(res)
				expect( res ).to.include( 'Bonjour!' )
			} catch (err) { console.error(err) }
		})
		it('Simple greetings is', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'greet.simple', 'whatsup?', 'how do you do?')
				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )
			} catch (err) { console.error(err) }
		})
		it('Morning greetings is', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'morning.wakeup')
				expect(res).to.eql( [ 'Hi there!', 'My pleasure!' ] )
			} catch (err) { console.error(err) }
		})
		it('General dormir', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'morning.dormir')
				expect(res).to.eql( [ 'Non, non, non!', 'Non, Mais non!' ] )
			} catch (err) { console.error(err) }
		})
		it('Specific dormir', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'morning.girls.dormir')
				expect(res).to.eql( [ 'Non, non, non!', 'Non, Mais non!' ] )
			} catch (err) { console.error(err) }
		})
		it('No answer', async function () {
			try {
				await inflicter.request( '0', null, '', 'cave.echo')
			} catch (err) {
				expect(err).to.be.an.instanceof( Error )
			}
		})
		it('Division Promise test', async function () {
			try {
				let res = await inflicter.request( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?' )
				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )
				expect( res ).to.include( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
		it('Division test', async function () {
			try {
				let res = await inflicter.request( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?')

				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )
				expect( res ).to.include( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
		it('Domina', async function () {
			try {
				let res = await inflicter.request( '0', null, '', 'Domina.force')
				should.exist(res)

				expect( res[0] ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
				expect( res[1] ).to.eql( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
		it('Deactivate', async function () {
			inflicter.deactivate('Claire')
			try {
				let res = await inflicter.request( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?')
				should.exist(res)
				expect( res ).to.not.include( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
	})

	describe('Live reload test', function () {
		it('Changing Alizee', async function () {
			this.timeout( 20000 )
			try {
				assert.rejects( inflicter.request( '0', null, '', 'Lina.flying'), 'Nobody is listening to: Lina.flying' )

				const newLina = await readFile( path.join( __dirname, 'livereload', 'Lina_new.js'), { encoding: 'utf8' } )
				await writeFile( path.join( __dirname, 'entities', 'Lina.js'), newLina, { encoding: 'utf8' } )

				await Proback.timeout( 5000 )

				let res = await inflicter.request( '0', null, '', 'Lina.flying')
				expect( res ).to.eql( 'Flying in the clouds...' )
			} catch (err) { assert.fail( 'Should not be here...' ) }
		})
	})

	describe('Post health tests', function () {
		it('Clean internals', async function () {
			try {
				let comms = await inflicter.pendingComms( )
				comms.forEach( function (comm) {
					expect( Object.keys(comm) ).to.have.lengthOf( 0 )
				} )
			} catch (err) { console.error(err) }
		})
	})

	after(async function () {
		if (inflicter) {
			await inflicter.close( )
		}
	})
})
