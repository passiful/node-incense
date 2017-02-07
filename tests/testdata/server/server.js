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
bifloraMain = require( path.resolve(__dirname, '../../../libs/main.js') ).getBifloraMain({
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
biflora.setupWebSocket(
	server,
	require( path.resolve(__dirname, '../../../libs/main.js') ).getBifloraApi() ,
	bifloraMain
);

console.log('------ creating new board.');
bifloraMain.dbh.createNewBoard({}, function(boardId){
	console.log('----- created board ID:', boardId);
	bifloraMain.dbh.getBoardInfo(boardId, function(boardInfo){
		console.log('boardInfo:', boardInfo);
	});
});

// middleware - frontend documents
app.use( '/common/dist', express.static( path.resolve(__dirname, '../../../dist/') ) );
app.use( express.static( path.resolve(__dirname, '../htdocs/') ) );

// {$_port}番ポートでLISTEN状態にする
server.listen( _port, function(){
	console.log('message: server-standby');
} );
