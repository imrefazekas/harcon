if (!Array.prototype.contains)
	Array.prototype.contains = function (object) {
		for (var i = 0; i < this.length; i += 1) {
			if (object === this[i]) return true;
		}
		return false;
	};
if (!Array.prototype.find)
	Array.prototype.find = function (fn) {
		for (var i = 0; i < this.length; i += 1) {
			if (fn(this[i], i, this)) return this[i];
		}
		return null;
	};
if (!Array.prototype.findIndex)
	Array.prototype.findIndex = function (fn) {
		for (var i = 0; i < this.length; i += 1) {
			if (fn(this[i], i, this)) return i;
		}
		return -1;
	};
if (!String.prototype.startsWith) {
	Object.defineProperty(String.prototype, 'startsWith', {
		venumerable: false,
		configurable: false,
		writable: false,
		value: function(searchString, position) {
			position = position || 0;
			return this.lastIndexOf(searchString, position) === position;
		}
	});
}
if (!String.prototype.endsWith) {
	Object.defineProperty(String.prototype, 'endsWith', {
		value: function (searchString, position) {
			var subjectString = this.toString();
			if (position === undefined || position > subjectString.length) {
				position = subjectString.length;
			}
			position -= searchString.length;
			var lastIndex = subjectString.indexOf(searchString, position);
			return lastIndex !== -1 && lastIndex === position;
		}
	});
}