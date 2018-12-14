const assert = require('assert')
let chai = require('chai')
let should = chai.should()
let expect = chai.expect

// Requires harcon. In your app the form 'require('harcon')' should be used
let Harcon = require('../lib/Inflicter')

let Logger = require('./PinoLogger')

let Clerobee = require('clerobee')
let clerobee = new Clerobee(16)

let harconName = 'HarconSys'

let path = require('path')

let Proback = require('proback.js')

let Domina = require('./entities/Domina')
let Alizee = require('./entities/Alizee')
let Julie = require('./entities/Julie')
let Claire = require('./entities/Claire')
let Marie = require('./entities/Marie')

describe('HarconBend', function () {
	let inflicter

	before( async function () {
		let logger = Logger.createPinoLogger( { console: true, level: 'debug' } )

		try {
			let harcon = new Harcon( {
				name: harconName,
				bender: { enabled: true },
				logger: logger,
				idLength: 32,
				unfoldAnswer: true,
				suppressing: true,
				blower: { commTimeout: 2000, tolerates: [] },
				FireBender: {
					// defs: path.join( __dirname, 'fintech' )
					// defs: require('./Fintech.flow')
					defs: {
						'Julie.rever': {
							type: 'spread',
							primers: [ { division: 'HarconSys', event: 'Claire.jolie' }, 'Marie.jolie' ],
							validation: function (s) { return s === 'bonne nuite' }
						},
						'Julie.repose': {
							type: 'series',
							primers: [ { division: 'HarconSys', event: 'Claire.jolie' }, 'Marie.jolie' ],
							validation: { required: true, element: ['bonne soirree'] }
						},
						'Julie.chouchou': {
							type: 'waterfall',
							primers: [ { division: 'HarconSys', event: 'Claire.jolie' }, 'Marie.jolie' ]
						},
						'Alizee.dormir': { type: 'series', primers: [] },
						'Alizee.superFlegme': { type: 'series', primers: [], timeout: 1000 },
						'Julie.choisi': {
							type: 'series',
							primers: [ { division: 'HarconSys', event: 'Claire.tampis', skipIf: 'Domina.permit' } ]
						},
						'Julie.distribute': {
							type: 'series',
							primers: [ { event: 'Marie.seek', foreach: true }, { event: 'Marie.seek', foreach: true } ]
						},
						'Julie.waterfall': {
							type: 'waterfall',
							primers: [ { event: 'Marie.seek', foreach: true }, { event: 'Marie.seek', foreach: true } ]
						}
					}
				}
			} )

			inflicter = await harcon.init()

			await inflicter.inflicterEntity.addicts( Domina )
			await inflicter.inflicterEntity.addicts( Alizee )
			await inflicter.inflicterEntity.addicts( Julie )
			await inflicter.inflicterEntity.addicts( Claire )
			await inflicter.inflicterEntity.addicts( Marie )

			console.log('\n\n-----------------------\n\n')
			assert.ok( 'Harcon initiated...' )
		} catch (err) { assert.fail( err ) }
	})

	describe('Test Harcon status calls', function () {
		it('Retrieve divisions...', async function () {
			await Proback.timeout( 500 )
			let divisions = await inflicter.divisions()
			expect( divisions ).to.eql( [ harconName ] )
		})
	})
	describe('Test completeness', function () {
		it('Firebender', async function () {
			try {
				let res = await inflicter.require( clerobee.generate(), null, '', 'FireBender.completeness' )
				console.log('completeness .....', res)
				expect( Object.keys(res) ).to.eql( [ ] )
			} catch (err) { console.error( err ) }
		})
	})

	describe('Bending', function () {
		it('Spread', async function () {
			try {
				let res = await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.rever', [ 'bonne nuite' ] )
				console.log('Spread .....', res)
				expect( res ).to.eql( [ 'Merci', 'Enchentée.' ] )
			} catch (err) { console.error( err ) }
		})
		it('Series', async function () {
			try {
				let res = await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.repose', [ 'bonne soirree' ])
				expect( res ).to.eql( [ 'Merci', 'Enchentée.' ] )
			} catch (err) { console.error( err ) }
		})

		it('Series with validation failuer', async function () {
			try {
				await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.repose', [ 'bonne nuite' ] )
				assert.fail( 'Should not be here...' )
			} catch (err) { expect(err).to.be.an.instanceof( Error ) }
		})

		it('Waterfall', async function () {
			try {
				let res = await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.chouchou', [ 'bonne nuite' ] )
				console.log('Waterfall .....', res)
				expect( res ).to.eql( 'Enchentée.' )
			} catch (err) { assert.fail( 'Should not be here...' ) }
		})

		it('Series wizh skipif', async function () {
			try {
				let res = await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.choisi', [ 'bonne nuite' ] )
				expect( res ).to.eql( [ 'Non, Mais non!' ] )
			} catch (err) { assert.fail( 'Should not be here...' ) }
		})

		it('Forech Series', async function () {
			try {
				let res = await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.distribute', [ ])
				expect( res ).to.eql( [ [ 100, 450, 500 ], [ 100, 450, 500 ] ] )
			} catch (err) { assert.fail( 'Should not be here...' ) }
		})

		it('Foreach Waterfall', async function () {
			try {
				let res = await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.waterfall', [ ] )
				expect( res ).to.eql( [ 1000, 4500, 5000 ] )
			} catch (err) { assert.fail( 'Should not be here...' ) }
		})
	})

	describe('Bending errors', function () {
		it('Timeout', async function () {
			this.timeout(3500)
			try {
				await inflicter.require( clerobee.generate(), null, '', 'FireBender.exec', '', 'Alizee.superFlegme', [ ] )
				assert.fail( 'Should not be here...' )
			} catch (err) { expect(err).to.be.an.instanceof( Error ) }
		})
	})

	after(async function () {
		await Proback.timeout( 500 )
		if (inflicter)
			await inflicter.close( )
	})
})
