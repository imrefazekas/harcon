Array.prototype.removeElement = function ( element ) {
	let index = this.indexOf(element)
	if (index >= 0)
		this.splice(index, 1)
}

module.exports = {
	OK: 'ok'
}
