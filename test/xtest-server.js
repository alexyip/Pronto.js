var pronto = require('../lib/pronto');
var FAIL = require('./common').FailingCommand;
var LogCommand = require('./common').LogCommand;
var assert = require('assert');
var client = require('http');
var common = require('./common');

var register = new pronto.Registry();

register

.request('/test')
	.does(pronto.commands.HTTPResponse, 'out')
	.using('body', 'This is a test.')

.request('/test/*/test')
	.does(pronto.commands.HTTPResponse, 'out')
	.using('body', 'This is a test.').from('path:1')

.request('/fail')
	.does(FAIL, 'out')
	.using('body', 'This is a test.')
	
.request('@404')
	.does(pronto.commands.HTTPResponse, 'out')
	.using('code', 404)
	.using('contentType', 'text/markdown')
	.using('body', 'Bork bork bork.')

.request('@serverStartup')
	.does(LogCommand, 'start')
		.using('msg', 'Starting up')
		.using('level', 'info')
		
.request('@serverShutdown')
	.does(LogCommand, 'stop')
		.using('msg', 'Shutting down')
		.using('level', 'info')
		
// Copied from new router test.
.request('/depth')
  //.does(common.TestCommand)
  .does(common.DumpStack, 1)
  .does(common.DumpStack, 2)
  .does(common.DumpStack, 3)
  .does(common.DumpStack, 4)
  .does(common.DumpStack, 5)
  .does(pronto.commands.HTTPResponse, 'out')
	.using('code', 200)
	.using('contentType', 'text/markdown')
	.using('body', 'You did alright.')
	
.request('targetroute')
  .does(pronto.commands.HTTPResponse, 'out')
	.using('code', 200)
	.using('contentType', 'text/markdown')
	.using('body', 'I am target route.')
	
.request('/testreroute')
  .does(common.ReRoute, 'shouldreroute').using('routeTo', 'targetroute')
  .does(common.ErrorThrowingCommand)
.request('/teststop')
  .does(common.Stop, 'shouldStop')
  .does(common.ErrorThrowingCommand)
;
	
var cxt = new pronto.Context();
cxt.add('base-item', 'test');

var server = pronto.HTTPServer.createServer(register, cxt);

server.on('close', function() {console.log('close')});

server.listen(8000, 'localhost');

// Test close()
//setTimeout(function(){server.close()}, 2000);
