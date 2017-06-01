let pino = require('pino')

exports.createPinoLogger = function ( name, options ) {
	options = options || {}
	var logger = pino({
		name: name,
		safe: true,
		extreme: true,
		level: options.level || 'info',
		serializers: {
			req: pino.stdSerializers.req,
			res: pino.stdSerializers.res
		}
	})
	return logger
}
