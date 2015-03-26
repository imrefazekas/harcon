/**
* Type of the error object encapsulating errors of response objects.
*
* @class Flamestarter
* @constructor
 * */
function Fire( errors ) {
	this.errors = errors;
	this.message = this.errors.join(' ');
}

exports = module.exports = Fire;
