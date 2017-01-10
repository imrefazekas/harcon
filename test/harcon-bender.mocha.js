'use strict'

let chai = require('chai')
let should = chai.should()
let expect = chai.expect

// Requires harcon. In your app the form 'require('harcon')' should be used
let Harcon = require('../lib/Inflicter')

let Logger = require('./WinstonLogger')

let Clerobee = require('clerobee')
let clerobee = new Clerobee(16)

let harconName = 'HarconSys'

let path = require('path')

let Domina = require('./components/Domina')
let Alizee = require('./components/Alizee')
let Julie = require('./components/Julie')
let Claire = require('./components/Claire')
let Marie = require('./components/Marie')

describe('HarconBend', function () {
	let inflicter

	before(function (done) {
		let logger = Logger.createWinstonLogger( { console: true, level: 'silly' } )
		// let logger = Logger.createWinstonLogger( { file: 'mochaBendtest.log' } )

		// Initializes the Harcon system
		// also initialize the deployer component which will automaticall publish every component found in folder './test/components'
		new Harcon( {
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
		.then( function (_inflicter) {
			inflicter = _inflicter
			return 'ok'
		} )
		.then( () => {
			return inflicter.inflicterEntity.addicts( Domina )
		} )
		.then( () => {
			return inflicter.inflicterEntity.addicts( Alizee )
		} )
		.then( () => {
			return inflicter.inflicterEntity.addicts( Julie )
		} )
		.then( () => {
			return inflicter.inflicterEntity.addicts( Claire )
		} )
		.then( () => {
			return inflicter.inflicterEntity.addicts( Marie )
		} )
		.then( function () {
			console.log('\n\n-----------------------\n\n')
			done()
		} )
		.catch(function (reason) {
			return done(reason)
		} )
	})

	describe('Test Harcon status calls', function () {
		it('Retrieve divisions...', function (done) {
			setTimeout( function () {
				inflicter.divisions().then( function (divisions) {
					expect( divisions ).to.eql( [ harconName ] )
					done()
				} ).catch(function (error) {
					done(error)
				})
			}, 500 )
		})
	})

	describe('Test completeness', function () {
		it('Firebender', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.completeness', function (err, res) {
				console.log('completeness .....', err, res)
				should.not.exist(err)
				expect( Object.keys(res) ).to.eql( [ ] )
				done()
			} )
		})
	})

	describe('Bending', function () {

		it('Spread', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.rever', [ 'bonne nuite' ], function (err, res) {
				console.log('Spread .....', err, res)
				expect( res ).to.eql( 'ok' )
				done()
			} )
		})
		it('Series', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.repose', [ 'bonne soirree' ], function (err, res) {
				console.log('Series .....', err, res)
				expect( res ).to.eql( [ 'Merci', 'Enchentée.' ] )
				done()
			} )
		})

		it('Series with validation failuer', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.repose', [ 'bonne nuite' ], function (err, res) {
				console.log('Series .....', err, res)
				should.exist(err)
				done()
			} )
		})

		it('Waterfall', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.chouchou', [ 'bonne nuite' ], function (err, res) {
				console.log('Waterfall .....', err, res)
				expect( res ).to.eql( 'Enchentée.' )
				done()
			} )
		})

		it('Waterfall 2', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.choisi', [ 'bonne nuite' ], function (err, res) {
				console.log('Waterfall .....', err, res)
				expect( res ).to.eql( [ 'Non, Mais non!' ] )
				done()
			} )
		})

		it('Forech Series', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.distribute', [ ], function (err, res) {
				console.log('Foreach .....', err, res)
				expect( res ).to.eql( [ 100, 450, 500, 100, 450, 500 ] )
				done()
			} )
		})

		it('Foreach Waterfall', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.waterfall', [ ], function (err, res) {
				console.log('Waterfall .....', err, res)
				expect( res ).to.eql( 5000 )
				done()
			} )
		})
	})

	describe('Bending errors', function () {
		it('Timeout', function (done) {
			this.timeout(3500)
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Alizee.superFlegme', [ ], function (err, res) {
				console.log('Superflegme .....', err, res)
				should.exist(err)
				done()
			} )
		})
	})

	after(function (done) {
		// Shuts down Harcon when it is not needed anymore
		setTimeout( function () {
			inflicter.close()
			done()
		}, 500 )
	})
})
