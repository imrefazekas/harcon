Harcon - Messaging/Service Bus for the harmonic convergence of node-based enterprise entities

[![NPM](https://nodei.co/npm/harcon.png)](https://nodei.co/npm/harcon/)


========
[harcon](https://github.com/imrefazekas/harcon) is a enterprise-level service bus for NodeJS giving high abstraction layer for interoperability between entities in a highly structured and fragmented ecosystem.

The library has a stunning feature list beyond basic messaging functionality.

- __Channel-agnostic__: harcon represents a very abstract messaging framework allowing you to use any underlaying technology your application requires: [AMQP](http://www.amqp.org), [ZeroMQ](http://zeromq.org), [XMPP](http://xmpp.org), etc...

- __Tracking__: you can monitor every message delivered (request or response) by only few lines of code

- __Flow control / Reproducibility__: A flow of communication / messages can be halted / continued / reinitiated anytime with no effort

- __Free orchestration__: your system can be orchestrated and distributed as you wish, message delivery is not limited to nodes or hosts

- __Short learning curve__: no need to learn hundred of pages, communication has to be simple after all

- __Transparent__: although harcon introduces lots of complex types and structures, your code and callbacks will be kept clean and pure, everything is (un)packed in the background in a transparent way

- __Smooth infiltration__: your objects / functions will possess the necessary services via injection, no need to create complex structures and compounds

__!Note__: Harcon's concept is to introduce a clean and high abstraction layer over messaging between entities. Like in case of every abstraction tool, for simple webapps or plain REST services, it can be proven as a liability.

This frameworks start to shine in a highly structured and distributed environment.


# Installation

$ npm install harcon

## Features:

... to be filled

## Quick setup

var Inflicter = require('Inflicter');
var inflicter = new Inflicter( );

// define a listener function listening every message withing the context "morning"
inflicter.addict('steve', 'morning.*', function(greetings, callback){
callback(null, 'Leave me please!');
} );

// define an listener object listening every message withing the context "greet"
var alice = {
name: 'alice',
handler: function(greetings1, greetings2, callback){
callback( null, 'Hello there!' );
}
};
inflicter.addicts( alice, [ 'greet.*' ], [ alice.handler ] );

// sends a communication 'greet.everyone' with parameters and defines a callback to handle responses
inflicter.ignite( 'catty', 'greet.everyone', 'whatsup?', 'how do you do?', function(err, res){
console.log( err, res );
} );

[Back to Feature list](#features)


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

- 0.6.0 : delivery fixes
- 0.5.0 : initial release
