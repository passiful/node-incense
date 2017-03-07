var assert = require('assert');
var path = require('path');
var fs = require('fs');
var utils79 = require('utils79');
var Promise = require("es6-promise").Promise;
var Incense = require('../libs/main.js');
console.log(Incense);
var incense = new Incense({
	'dataDir': __dirname + '/data/', // <- data directory (Read/Write permission required)
	'db': { // <- database setting
		"dbms": "sqlite",
		"storage": __dirname + "/data/__database.sqlite",
		"tablePrefix": "incense"
	} ,
	'getUserInfo': function( socket, clientDefaultUserInfo, callback ){
		// provide user info.
		// e.g. {
		//     'id': 'user_id',
		//     'name': 'User Name',
		//     'url': 'http://example.com/',
		//     'icon': 'http://example.com/sample.png'
		// }
		callback(clientDefaultUserInfo);
		return;
	}
});

describe('Basic', function() {

	it("define", function(done) {
		this.timeout(60*1000);
		assert.strictEqual(typeof(Incense), typeof(function(){}));
		assert.strictEqual(typeof(incense.getBifloraApi), typeof(function(){}));
		assert.strictEqual(typeof(incense.getBifloraMain), typeof(function(){}));
		done();
	});

	it("incense object", function(done) {
		this.timeout(60*1000);
		// console.log(incense);
		assert.strictEqual(typeof(incense), typeof({}));
		done();
	});
});

describe('Creating new board', function() {

	it("divide board ID", function(done) {
		this.timeout(60*1000);
		// console.log(incense);
		var bifloraMain = incense.getBifloraMain();
		assert.strictEqual(bifloraMain.dbh.divideBoardId('abcdefg'), 'ab/cd/ef/g');
		assert.strictEqual(bifloraMain.dbh.divideBoardId('a'), 'a');
		assert.strictEqual(bifloraMain.dbh.divideBoardId('ab'), 'ab');
		assert.strictEqual(bifloraMain.dbh.divideBoardId('abcd'), 'ab/cd');
		done();
	});

	it("create", function(done) {
		this.timeout(60*1000);
		// console.log(incense);
		incense.getBifloraMain().board.createNewBoard({"title": "TEST BOARD"}, function(newBoardId){
			console.log(newBoardId);

			assert.strictEqual(typeof(incense), typeof({}));
			done();
		});
	});

});

describe('clearning...', function() {

	it("remove database", function(done) {
		require('fs').unlinkSync(__dirname + "/data/__database.sqlite");
		assert.strictEqual(utils79.is_file(__dirname + "/data/__database.sqlite"), false);
		done();
	});

});
