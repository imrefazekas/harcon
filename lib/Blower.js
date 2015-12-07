function Blower( ){
}
var blower = Blower.prototype;

blower.init = function( config, callback ){
	this.comms = {};
	if(callback)
		callback();
};
blower.known = function( id ){
	return !!this.comms[ id ];
};
blower.comm = function( id ){
	return this.comms[ id ];
};
blower.burnout = function( id ){
	delete this.comms[ id ];
};
blower.blow = function( comm ){
	this.comms[ comm.id ] = { comm: comm, callback: comm.callback };
};

module.exports = Blower;
