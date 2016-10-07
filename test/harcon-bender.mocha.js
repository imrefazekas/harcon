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

let Domina = require('./components/Domina')
let Alizee = require('./components/Alizee')
let Julie = require('./components/Julie')
let Claire = require('./components/Claire')
let Marie = require('./components/Marie')

describe('HarconBend', function () {
	let inflicter

	before(function (done) {
		let logger = Logger.createWinstonLogger( { console: true } )
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
				defs: {
					'Julie.rever': {
						type: 'spread',
						primers: [ { division: 'HarconSys', event: 'Claire.jolie' }, 'Marie.jolie' ]
					},
					'Julie.repose': {
						type: 'series',
						primers: [ { division: 'HarconSys', event: 'Claire.jolie' }, 'Marie.jolie' ]
					},
					'Julie.chouchou': {
						type: 'waterfall',
						primers: [ { division: 'HarconSys', event: 'Claire.jolie' }, 'Marie.jolie' ]
					},
					'Alizee.dormir': { type: 'series', primers: [] },
					'Julie.choisi': {
						type: 'series',
						primers: [ { division: 'HarconSys', event: 'Claire.tampis', skipIf: 'Domina.permit' } ]
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

	describe('Bending', function () {
		it('Spread', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.rever', [ 'bonne nuite' ], function (err, res) {
				console.log('Spread .....', err, res)
				expect( res ).to.eql( 'ok' )
				done()
			} )
		})
		it('Series', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.repose', [ 'bonne nuite' ], function (err, res) {
				console.log('Series .....', err, res)
				expect( res ).to.eql( [ 'Merci', 'Enchentée.' ] )
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
		it('Waterfall', function (done) {
			inflicter.ignite( clerobee.generate(), null, '', 'FireBender.exec', '', 'Julie.choisi', [ 'bonne nuite' ], function (err, res) {
				console.log('Waterfall .....', err, res)
				expect( res ).to.eql( [ 'Non, Mais non!' ] )
				done()
			} )
		})
	})

	after(function (done) {
		// Shuts down Harcon when it is not needed anymore
		inflicter.close()
		done()
	})
})
