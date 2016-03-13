var Warper = require('../Warper')

function Liner ( harconDivision, connectedDivisions ) {
	this.harconDivision = harconDivision
	this.connectedDivisions = connectedDivisions || []
}

Liner.prototype = new Warper()
var liner = Liner.prototype

liner.allow = function ( comm ) {
	var innerDivision = comm.division === this.harconDivision || comm.division.startsWith(this.harconDivision + '.')
	if (!innerDivision) return false

	var innerSourceDivision = comm.sourceDivision === this.harconDivision || comm.sourceDivision.startsWith(this.harconDivision + '.')
	if (!innerSourceDivision)
		for (var i = 0; i < this.connectedDivisions.length; ++i)
			if (comm.sourceDivision !== this.harconDivision && !comm.sourceDivision.startsWith(this.harconDivision + '.'))
				return false
	return true
}

module.exports = Liner
