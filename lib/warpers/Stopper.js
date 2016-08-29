let Warper = require('../Warper')

function Liner ( division ) {
	this.division = division
}

Liner.prototype = new Warper()
let liner = Liner.prototype

liner.allow = function ( comm ) {
	return false
}

module.exports = Liner
