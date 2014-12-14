Harcon - Messaging/Service Bus for the harmonic convergence of node-based enterprise entities or in-browser communication between web components

[![NPM](https://nodei.co/npm/harcon.png)](https://nodei.co/npm/harcon/)


========
[harcon](https://github.com/imrefazekas/harcon) is a enterprise-level service bus for NodeJS/Browser giving superior abstraction layer for interoperability between entities in a highly structured and fragmented ecosystem. It allows you to design and implement complex workflows where context and causality of messages are important.

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

## Workflows

In an enterprise-level system, one has to realize complex communication structure where lots of entities are following business logic and rules, involving subsystems and external resources, policies and other considerations, in short form: workflows.
I take the liberty to define the workflow now as well defined routes and causality of messages.
Simple method calls do the same, you can say. Yes and no.
In a workflow, you are not dependent on the response timeframe, workflows manage distance in time and space. The recepient of a message can be on another server or city or planet. Recepient can answer right away or tomorrow or never.

Let me show a very short example:
You are a company providing VPN services to customers.
Orders taken by agents go to some accounting and client management subsystem and eventually your subsystem dealing with the technical setup receives a request through an interface of yours.
Next step is to identify the network the user will be connected to, so a message is sent to the networking department who will respond maybe a day later. When it does, you have to continue your workflow where it is stopped, so you try to allocate network resources there and if it is successful you create a network configuration firmware to be used on the client's router to communicate with your backbone. When it is done by a config creator submodule of yours, you send it to an operation department for testing and when it is done you send back the results to the accounting for validation.
And of course everything must be traceable and reconstructable and maybe rollable backwards.
This is an extremely simplified use case, in real-life, workflows are much more complicated things and even harder to handle properly.

[harcon](https://github.com/imrefazekas/harcon) is not a workflow designer tool, __"just"__ a low-level library to manage such processes. You define entities and the communications among them then publish them.

You can resurrect a workflow if it failed and continue where it failed.
You have to understand some details to use this lib at full scale.

#### Entities
One can define 2 type of entities:
- simple function: when you associate a function with an event-pattern. Recommended to be used as observer, job-like, surveillance-, or interface-related asset.
```javascript
// Qualified name - will answer to only this message
inflicter.addict('hugh', 'allocate.ip', function(callback){
	callback(null, 'Done.');
} );
// Wildcards - will answer anything within the context greet
inflicter.addict('peter', 'greet.*', function(callback){
	callback(null, 'Done.');
} );
// Regular expression - will answer anything where message name start with string 'job'
inflicter.addict('john', /job.*/, function(callback){
	callback(null, 'Done.');
} );
```

- objects: service object enclosing service functions as a unique and complete context. Recommended to be used as business entities.
```javascript
var bookKeeper = {
	name: 'BookKeeper',
	context: 'booking',
	newOrder: function( customer, callback ){
		callback( null, 'Done.' );
	},
	ordersOfToday: function( callback ){
		callback( null, [] );
	}
};
...
inflicter.ignite( 'booking.newOrder', {name: 'Stephen', customerID:123}, function(err, res){
	console.log( 'Finished', err, res );
} );
inflicter.ignite( 'booking.ordersOfToday', function(err, res){
	console.log( 'Finished', err, res );
} );
```
The name of every entity must be unique. Entities belong to a context as defined above. A context might be associatd to multiple entities depending on you orchestration.
Every function within an entity will be considered as service and can be called using the 'context' + 'functionName' pair.

#### Chain messages

To chain messages, define the next point in the workflow you have to add another parameter to your service function:
```javascript
var order = {
	name: 'Order',
	context: 'order',
	newVPN: function( customer, ignite, callback ){
		ignite( 'allocate.address', '127.0.0.1', function(err, res){
			callback(err, res);
		} );
	}
};
...
inflicter.ignite( 'order.newVPN', {name: 'Stephen', customerID:123}, function(err, res){
	console.log( 'Finished', err, res );
} );
```
That will initiate a small workflow. __inflicter.ignite__ send a message to entity Order who will send within the same workflow to the Allocator. When it answeres, then the message of the beginning will be answered. [harcon](https://github.com/imrefazekas/harcon) will know if you initiate a message within the processing of another one and considers it as part of the ongoing workflow and tracks it.
Mind the async execution to keep everything in track!

#### Call back or not?

You are not forced to always send answer, in some cases a quite entities is desired. If you do not define a callback neither side of the communication, [harcon](https://github.com/imrefazekas/harcon) will consider it as a one-ways message sending.
```javascript
// Qualified name - will answer to only this message
inflicter.addict('karl', 'reserve.address', function( address ){
	// Do something...
} );
...
inflicter.ignite( 'reserve.address', '127.0.0.1' );
```

#### Entity initialization

The need to pass contextual parameters to entities might rise. The options object passed to the constructure of Inflicter allows you to specify parameters for entities which will be passed while the init method defined in the entity is called.
```javascript
inflicter = new Inflicter( { /* ... */ marie: {greetings: 'Hi!'} } );
var marie = {
	name: 'marie',
	context: 'test',
	init: function (options) {
		// {greetings: 'Hi!'} will be passed
	}
	// services ...
};
```

#### Logging

When you create the Inflicter instance, you can pass a logger object which will be respected and used to do loggings. If not set, [harcon](https://github.com/imrefazekas/harcon) will log everything to the console. So in production, setting up a logging facility ( like [winston](https://github.com/flatiron/winston) or [bunyan](https://github.com/trentm/node-bunyan) ) is strongly adviced.
```javascript
inflicter = new Inflicter( { logger: logger /* ... */ } );
```

#### Unique messages

Every communication exchanged possesses the following properties (not exclusively):
- unique ID
- reference to the parent message if exists
- uniqued ID of the workflow itself
- external ID of the workflow started by an external communication involving a reference number to consider
- timestamp

Any time you sends a message or receives an answer, such objects are bypassing through the harcon system which logs and tracks all of them.

By default, [harcon](https://github.com/imrefazekas/harcon) uses 32 as length of the IDs which are unique over time and among computer nodes. You can override this default when initiating Inflicter
```javascript
inflicter = new Inflicter( { /* ... */ idLength: 32 } );
```

## Extension

[harcon](https://github.com/imrefazekas/harcon) can be easily extended by using pure harcon components listening to system events:
```javascript
var extension = {
	name: 'As you design it',
	context: inflicter.name,
	castOf: function( name, firestarter ){
	},
	affiliate: function( firestarter ){
	},
	close: function(){
	}
}
inflicter.addicts( extension );
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
