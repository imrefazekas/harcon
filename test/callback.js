function c (callback) {
	callback(null, 'OK')
}

function a (callback) {
	c( (err, res) => {
		callback(err, res)
	} )
}

function b (callback) {
	a( (err, res) => {
		callback(err, res)
	} )
}

function ab (callback) {
	b( (err, res) => {
		callback(err, res)
	} )
}

let time = Date.now(), count = 0
for ( let i = 0; i < 10000; ++i ) {
	ab( (err, res) => {
		count++
		if (count === 10000)
			console.log( (time - Date.now()) )
	} )
}
