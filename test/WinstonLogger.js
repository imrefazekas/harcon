var winston = require('winston');

exports.createWinstonLogger = function( options ){
	options = options || {};
	if( options.console ){
		return new (winston.Logger)({ transports: [ new (winston.transports.Console)({ level: options.level || 'debug', colorize: 'true' }) ] });
	}

	if( options.exceptionFile )
		winston.handleExceptions(new winston.transports.File({ filename: options.exceptionFile }));
	else
		winston.handleExceptions( new (winston.transports.Console)({ level: 'error', colorize: 'true' }) );
	var transports = [
		new (winston.transports.Console)({ level: 'error', colorize: 'true' }),
		new (winston.transports.File)( {
			filename: options.file || 'server.log',
			level: options.level || 'info',
			maxsize: options.maxSize || 1000000,
			maxFiles: options.maxFiles || 1
		} )
	];
	return new (winston.Logger)({ transports: transports });
};
