var Warper = require('../Warper')

function Liner ( harconDivision ) {
	this.harconDivision = harconDivision
}

Liner.prototype = new Warper()
var liner = Liner.prototype

liner.allow = function ( comm ) {
	return 	( comm.division === this.harconDivision || comm.division.startsWith(this.harconDivision + '.') ) &&
			( comm.sourceDivision === this.harconDivision || comm.sourceDivision.startsWith(this.harconDivision + '.') )
}

module.exports = Liner
