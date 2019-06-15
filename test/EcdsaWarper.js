const { randomBytes } = require('crypto')
const { secp256k1 } = require('@nlv8/signun')

function Warper ( division, connectedDivisions, options ) {
	this.division = division
	this.connectedDivisions = connectedDivisions || []

	this.message = Buffer.from( options.message, 'hex' )
}

let warper = Warper.prototype

warper.init = async function () {
	let privKey
	do {
		privKey = randomBytes(32)
	} while ( !(await secp256k1.privateKeyVerify(privKey)) )

	this.privKey = privKey
	this.pubKey = await secp256k1.publicKeyCreate(privKey)

	this.sigObj = await secp256k1.sign( this.message, this.privKey )
}

warper.conform = function ( comm ) {
	try {
		comm.signature = this.sigObj.signature.toString('hex')
	} catch (err) { }
}

warper.referenceMatrix = function ( object ) {
}

warper.allow = async function ( comm ) {
	return secp256k1.verify( this.message, Buffer.from(comm.signature, 'hex'), this.pubKey )
}

module.exports = Warper
