let Warper = require('../Warper')

let { SEPARATOR } = require('../Static')

function Liner ( harconDivision, connectedDivisions, options ) {
	this.harconDivision = harconDivision
	this.connectedDivisions = connectedDivisions || []
	this.options = options || {}
}

Liner.prototype = new Warper()
let liner = Liner.prototype

liner.init = async function () {
}

liner.conform = function ( comm ) {
	return comm
}
liner.referenceMatrix = function ( object ) {
	this.referenceMatrix = object
}

liner.allow = async function ( comm ) {
	let innerDivision = comm.division === this.harconDivision || comm.division.startsWith(this.harconDivision + SEPARATOR)
	if (!innerDivision) return false

	let innerSourceDivision = comm.sourceDivision === this.harconDivision || comm.sourceDivision.startsWith(this.harconDivision + SEPARATOR)
	if (!innerSourceDivision)
		for (let i = 0; i < this.connectedDivisions.length; ++i)
			if (comm.sourceDivision !== this.connectedDivisions[i] && !comm.sourceDivision.startsWith(this.connectedDivisions[i] + SEPARATOR))
				return false

	return true
}

module.exports = Liner
