const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')

function Warper ( division, connectedDivisions, options ) {
	this.division = division
	this.connectedDivisions = connectedDivisions || []

	let privKey
	do {
		privKey = randomBytes(32)
	} while (!secp256k1.privateKeyVerify(privKey))
	this.privKey = privKey
	this.pubKey = secp256k1.publicKeyCreate(privKey)

	this.message = Buffer.from( options.message, 'hex' )
	this.sigObj = secp256k1.sign( this.message, this.privKey )
}

let warper = Warper.prototype

warper.conform = function ( comm ) {
	try {
		comm.signature = this.sigObj.signature.toString('hex')
	} catch (err) { }
}

warper.referenceMatrix = function ( object ) {
}

warper.allow = function ( comm ) {
	try {
		return secp256k1.verify( this.message, Buffer.from(comm.signature, 'hex'), this.pubKey )
	} catch (err) {
		return false
	}
}

module.exports = Warper
