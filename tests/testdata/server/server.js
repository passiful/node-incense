var fs = require('fs');
var path = require('path');
var express = require('express'),
	app = express();
var server = require('http').Server(app);
var biflora = require('biflora');
var conf = require('config');

var _port = 8088;


console.log('port number is '+_port);

// middleware - biflora resources
app.use( biflora.clientLibs() );
biflora.setupWebSocket(
	server,
	require( path.resolve(__dirname, '../../../libs/main.js') ).getBifloraApi() ,
	require( path.resolve(__dirname, '../../../libs/main.js') ).getBifloraMain({
		'dataDir': conf.dataDir,
		'getUserInfo': function(socket, clientDefaultUserInfo, callback){
			callback({
				'id': 'tester',
				'name': 'Test User'
			});
			return;
		}
	})
);

// middleware - frontend documents
app.use( '/common/dist', express.static( path.resolve(__dirname, '../../../dist/') ) );
app.use( express.static( path.resolve(__dirname, '../htdocs/') ) );

// {$_port}番ポートでLISTEN状態にする
server.listen( _port, function(){
	console.log('message: server-standby');
} );
