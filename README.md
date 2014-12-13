Harcon - Messaging/Service Bus for the harmonic convergence of node-based enterprise entities or in-browser communication between web components

[![NPM](https://nodei.co/npm/harcon.png)](https://nodei.co/npm/harcon/)


========
[harcon](https://github.com/imrefazekas/harcon) is a enterprise-level service bus for NodeJS/Browser giving superior abstraction layer for interoperability between entities in a highly structured and fragmented ecosystem.

The library has a stunning feature list beyond basic messaging functionality.

- __Channel-agnostic__: harcon represents a very abstract messaging framework allowing you to use any underlaying technology your application requires: [AMQP](http://www.amqp.org), [ZeroMQ](http://zeromq.org), [XMPP](http://xmpp.org), etc...

- __Tracking__: you can monitor every message delivered (request or response) by only few lines of code

- __Flow control / Reproducibility__: A flow of communication / messages can be halted / continued / reinitiated anytime with no effort

- __Free orchestration__: your system can be orchestrated and distributed as you wish, message delivery is not limited to nodes or hosts

- __Short learning curve__: no need to learn hundred of pages, communication has to be simple after all

- __Transparent__: although harcon introduces lots of complex types and structures, your code and callbacks will be kept clean and pure, everything is (un)packed in the background in a transparent way

- __Smooth infiltration__: your objects / functions will possess the necessary services via injection, no need to create complex structures and compounds

- __Advanced routing & listening__: qualified names, regular expressions, wildcards can be all used

__!Note__: Harcon's concept is to introduce a clean and high abstraction layer over messaging between entities. Like in case of every abstraction tool, for webapps which are simple as 1, it can be proven as a liability.

__!Note__: To use in browser, a CommonJS-enabled packager has to be applied like [browserify](http://browserify.org) or [webpack](http://webpack.github.io).

This library starts to shine in a highly structured and distributed environment.


## Installation

$ npm install harcon


## Quick setup
```javascript
var Inflicter = require('Inflicter');
var inflicter = new Inflicter( );

// define a listener function listening every message withing the context "greet"
inflicter.addict('peter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'Hi there!');
} );

// define an plain object serving as listener withing the context "greet" to messages "warm"
marie = {
	name: 'marie',
	context: 'greet',
	warm: function(greetings1, greetings2, callback){
		callback( null, 'Bonjour!' );
	}
};
inflicter.addicts( marie );

// sends a communication 'greet.everyone' with parameters and defines a callback to handle responses
// will receive back 2 answers: 'Hi there!' and 'Bonjour!'
inflicter.ignite( 'greet.everyone', 'Whatsup?', 'How do you do?', function(err, res){
	console.log( err, res );
} );
```
[Back to Feature list](#features)

## Features

... to be filled

## Extension

[harcon](https://github.com/imrefazekas/harcon) can be easily extended by using pure harcon components listening to system events:
```javascript
{
	name: 'As you design it',
	context: inflicter.name,
	castOf: function( name, firestarter ){
	},
	affiliate: function( firestarter ){
	},
	close: function(){
	}
}
```
In the current version, the inflicter instance you are using will send to your components events about system closing, entity publishing and revoking. For a working example, please check [harcon-radiation](https://github.com/imrefazekas/harcon-radiation).



## License

(The MIT License)

Copyright (c) 2014 Imre Fazekas

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Bugs

See <https://github.com/imrefazekas/harcon/issues>.


## Changelog

- 0.9.0 : small redesign to allow to use in a Browserify/Webpack environment
- 0.8.0 : automated (re/un)deployment added, rewritten event coordination subsystem
- 0.6.0 : delivery fixes
- 0.5.0 : initial release
