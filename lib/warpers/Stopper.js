var Warper = require('../Warper')

function Liner ( division ) {
	this.division = division
}

Liner.prototype = new Warper()
var liner = Liner.prototype

liner.allow = function ( comm ) {
	return false
}

module.exports = Liner
