var fs = require('fs');
var path = require('path');
var express = require('express'),
	app = express();
var server = require('http').Server(app);
var biflora = require('biflora');
var Incense = require( path.resolve(__dirname, '../../../libs/main.js') );
var conf = require('config');

var _port = 8088;


console.log('port number is '+_port);

// setup beflora
var incense = new Incense({
	'dataDir': conf.dataDir,
	'db': conf.db,
	'getUserInfo': function(socket, clientDefaultUserInfo, callback){
		callback({
			'id': 'tester',
			'name': 'Test User'
		});
		return;
	}
});
var bifloraMain = incense.getBifloraMain();
biflora.setupWebSocket(
	server,
	incense.getBifloraApi() ,
	bifloraMain
);

// middleware - biflora resources
app.use( biflora.clientLibs() );


console.log('------ creating new board.');
bifloraMain.dbh.createNewBoard({
	'title': 'TEST BOARD'
}, function(boardId){
	console.log('----- created board ID:', boardId);
	bifloraMain.dbh.getBoardInfo(boardId, function(boardInfo){
		console.log('boardInfo:', boardInfo);
	});
});

// middleware - Incense API for Express
app.use( '/incense/api', incense.getExpressMiddleware() );

// middleware - frontend documents
app.use( '/common/dist', express.static( path.resolve(__dirname, '../../../dist/') ) );
app.use( express.static( path.resolve(__dirname, '../htdocs/') ) );

// {$_port}番ポートでLISTEN状態にする
server.listen( _port, function(){
	console.log('message: server-standby');
} );
