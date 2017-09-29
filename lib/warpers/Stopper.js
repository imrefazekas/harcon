let Warper = require('../Warper')

function Stopper ( division ) {
	this.division = division
}

Stopper.prototype = new Warper()
let stopper = Stopper.prototype

stopper.conform = function ( comm ) {
	return comm
}
stopper.referenceMatrix = function ( object ) {
	this.referenceMatrix = object
}
stopper.allow = function ( comm ) {
	return false
}

module.exports = Stopper
