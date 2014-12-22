/**
* Type to protect domains.
*
* @class Warper
* @constructor
*/
function Warper( division ){
	this.division = division;
}
var warper = Warper.prototype;

/**
* Control function which decides to let a given comm to pass or blocks it
*/
warper.allow = function( communication ){
	throw new Error('To be implemented...');
};

module.exports = Warper;
