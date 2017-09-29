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

			await inflicter.inflicterEntity.addict( null, 'peter', 'greet.*', function (greetings1, greetings2) {
				return Proback.quicker('Hi there!')
			} )
			await inflicter.inflicterEntity.addict( null, 'walter', 'greet.*', function (greetings1, greetings2) {
				return Proback.quicker('My pleasure!')
			} )

			const oldLina = await readFile( path.join( __dirname, 'livereload', 'Line_orig.js'), { encoding: 'utf8' } )
			await writeFile( path.join( __dirname, 'entities', 'Lina.js'), oldLina, { encoding: 'utf8' } )

			console.log('\n\n-----------------------\n\n')
			assert.ok( 'Harcon initiated...' )
		} catch (err) { assert.fail( err ) }
	})

	describe('Test Harcon system calls', function () {
		it('Retrieve divisions...', async function () {
			let divisions = await inflicter.divisions()
			expect( divisions ).to.eql( [ harconName, harconName + '.click', 'HarconSys.maison.cache' ] )
		})
		it('Retrieve entities...', async function () {
			let entities = await inflicter.entities( )
			let names = entities.map( function (entity) { return entity.name } ).sort()
			expect( names ).to.eql( [ 'Alizee', 'Bandit', 'Charlotte', 'Claire', 'Domina', 'Inflicter', 'Julie', 'Lina', 'Margot', 'Marie', 'Marion', 'Mortar', 'peter', 'walter' ] )
		})
		it('Send for divisions...', async function () {
			let res = await inflicter.ignite( clerobee.generate(), null, '', 'Inflicter.divisions')
			expect( res ).to.eql( [ 'HarconSys', 'HarconSys.click', 'HarconSys.maison.cache' ] )
		})
		it('Clean internals', async function () {
			let comms = await inflicter.pendingComms( )
			comms.forEach( function (comm) {
				expect( Object.keys(comm) ).to.have.lengthOf( 0 )
			} )
		})
		it('Walter check', async function () {
			let res = await inflicter.ignite( clerobee.generate(), null, '', 'greet.hello', 'Bonjour!', 'Salut!')
			expect( res ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
		})
	})

	describe('simple messages', function () {
		it('Alize dormir', async function () {
			let res = await inflicter.ignite( clerobee.generate(), null, '', 'Alizee.dormir' )
			expect(res).to.eql( 'Non, non, non!' )
		})
		it('Alize flegme', async function () {
			this.timeout(5000)
			let res = await inflicter.ignite( clerobee.generate(), null, '', 'Alizee.flegme' )
			expect(res).to.eql( 'Quoi?' )
		})
		it('Alize superFlegme', async function () {
			this.timeout(5000)
			try {
				await inflicter.ignite( clerobee.generate(), null, '', 'Alizee.superFlegme' )
				assert.fail( 'Should not be here...' )
			} catch (err) { expect(err).to.be.an.instanceof( Error ) }
		})
	})

	describe('Depth handling', function () {
		it('multilevel domains', async function () {
			let res = await inflicter.ignite( clerobee.generate(), null, 'HarconSys.maison.cache', 'Margot.alors' )
			expect(res).to.eql( 'Oui?' )
		})
		it('multilevel contextes', async function () {
			let res = await inflicter.ignite( clerobee.generate(), null, 'HarconSys.maison.cache', 'paresseux.fille.alors' )
			expect(res).to.eql( 'Oui?' )
		})
	})

	describe('Error handling', function () {
		it('Throw error', async function () {
			try {
				await inflicter.ignite( clerobee.generate(), null, '', 'Bandit.delay' )
				assert.fail( 'Should not be here...' )
			} catch (err) { expect(err).to.be.an.instanceof( Error ) }
		})
	})

	describe('State shifting', function () {
		it('Simple case', async function () {
			let Lina = inflicter.barrel.firestarter('Lina').object
			await inflicter.ignite( clerobee.generate(), null, '', 'Marie.notify', 'data', 'Lina.marieChanged')

			await Proback.timeout( 250 )
			await inflicter.ignite( clerobee.generate(), null, '', 'Marie.simple', 'Bonjour', 'Salut' )

			await Proback.timeout( 250 )
			await Proback.until( function () {
				return Lina.hasMarieChanged
			}, 250 )
		})
	})

	describe('Harcon distinguish', function () {
		it('Access distinguished entity', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'Charlotte.access')
				should.exist(res)
				expect( res ).to.include( 'D\'accord?' )
			} catch ( err ) { console.error(err) }
		})
		it('Access distinguished entity', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'Charlotte-Unique.access')
				should.exist(res)
				expect( res ).to.include( 'D\'accord?' )
			} catch ( err ) { console.error(err) }
		})
	})

	describe('Erupt flow', function () {
		it('Simple greetings by name is', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'Marie.simple', 'whatsup?', 'how do you do?')
				let res2 = await inflicter.ignite( '0', null, '', 'greet.simple', 'whatsup?', 'how do you do?')
				console.log( '.>??????>>..', res, res2 )
			} catch (err) { console.error(err) }
		})
		it('Marion', async function () {
			// Sending a morning message and waiting for the proper answer
			try {
				let res = await inflicter.simpleIgnite( 'Marion.force' )
				should.exist(res)
				expect( res[0] ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
				expect( res[1] ).to.eql( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
	} )

	describe('Harcon workflow', function () {
		it('Simple greetings by name is', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'Marie.simple', 'whatsup?', 'how do you do?')
				should.exist(res)
				expect( res ).to.include( 'Bonjour!' )
			} catch (err) { console.error(err) }
		})
		it('Simple greetings is', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'greet.simple', 'whatsup?', 'how do you do?')
				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )
			} catch (err) { console.error(err) }
		})
		it('Morning greetings is', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'morning.wakeup')
				expect(res).to.eql( [ 'Hi there!', 'My pleasure!' ] )
			} catch (err) { console.error(err) }
		})
		it('General dormir', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'morning.dormir')
				expect(res).to.eql( [ 'Non, non, non!', 'Non, Mais non!' ] )
			} catch (err) { console.error(err) }
		})
		it('Specific dormir', async function () {
			try {
				let res = await inflicter.ignite( '0', null, '', 'morning.girls.dormir')
				expect(res).to.eql( [ 'Non, non, non!', 'Non, Mais non!' ] )
			} catch (err) { console.error(err) }
		})
		it('No answer', async function () {
			try {
				await inflicter.ignite( '0', null, '', 'cave.echo')
			} catch (err) {
				expect(err).to.be.an.instanceof( Error )
			}
		})
		it('Timeout test', async function () {
			this.timeout(5000)
			try {
				await inflicter.simpleIgnite( 'Alizee.flegme')
			} catch (err) {
				expect(err).to.be.an.instanceof( Error )
			}
		})
		it('Division Promise test', async function () {
			try {
				let res = await inflicter.ignite( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?' )
				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )
				expect( res ).to.include( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
		it('Division test', async function () {
			try {
				let res = await inflicter.ignite( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?')

				should.exist(res)

				expect( res ).to.include( 'Hi there!' )
				expect( res ).to.include( 'My pleasure!' )
				expect( res ).to.include( 'Bonjour!' )
				expect( res ).to.include( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
		it('Domina', async function () {
			try {
				let res = await inflicter.simpleIgnite( 'Domina.force')
				should.exist(res)

				expect( res[0] ).to.eql( [ 'Hi there!', 'My pleasure!' ] )
				expect( res[1] ).to.eql( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
		it('Deactivate', async function () {
			inflicter.deactivate('Claire')
			try {
				let res = await inflicter.ignite( '0', null, harconName + '.click', 'greet.simple', 'Hi', 'Ca vas?')
				should.exist(res)
				expect( res ).to.not.include( 'Pas du tout!' )
			} catch (err) { console.error(err) }
		})
	})

	describe('Live reload test', function () {
		it('Changing Alizee', async function () {
			this.timeout( 15000 )
			try {
				await Proback.timeout( 2000 )
				const newLina = await readFile( path.join( __dirname, 'livereload', 'Lina_new.js'), { encoding: 'utf8' } )
				await writeFile( path.join( __dirname, 'entities', 'Lina.js'), newLina, { encoding: 'utf8' } )

				await Proback.timeout( 8000 )
				let res = await inflicter.ignite( '0', null, '', 'Lina.flying')
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
		if (inflicter)
			await inflicter.close( )
	})
})
