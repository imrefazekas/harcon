let Warper = require('../Warper')

function Liner ( harconDivision, connectedDivisions ) {
	this.harconDivision = harconDivision
	this.connectedDivisions = connectedDivisions || []
}

Liner.prototype = new Warper()
let liner = Liner.prototype

liner.conform = function ( comm ) {
	return comm
}
liner.referenceMatrix = function ( object ) {
	this.referenceMatrix = object
}

liner.allow = function ( comm ) {
	let innerDivision = comm.division === this.harconDivision || comm.division.startsWith(this.harconDivision + '.')
	if (!innerDivision) return false

	let innerSourceDivision = comm.sourceDivision === this.harconDivision || comm.sourceDivision.startsWith(this.harconDivision + '.')
	if (!innerSourceDivision)
		for (let i = 0; i < this.connectedDivisions.length; ++i)
			if (comm.sourceDivision !== this.connectedDivisions[i] && !comm.sourceDivision.startsWith(this.connectedDivisions[i] + '.'))
				return false

	return true
}

module.exports = Liner
