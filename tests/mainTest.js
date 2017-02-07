var assert = require('assert');
var path = require('path');
var fs = require('fs');
var utils79 = require('utils79');
var Promise = require("es6-promise").Promise;
var Inscnse = require('../libs/main.js');
var incense = Inscnse.getBifloraMain({
	'dataDir': __dirname + '/data/',
	'db': {
		"dbms": "sqlite",
		"storage": __dirname + "/data/__database.sqlite",
		"tablePrefix": "incense"
	}
});

describe('Basic', function() {

	it("define", function(done) {
		this.timeout(60*1000);
		assert.strictEqual(typeof(Inscnse), typeof(function(){}));
		assert.strictEqual(typeof(Inscnse.getBifloraApi), typeof(function(){}));
		assert.strictEqual(typeof(Inscnse.getBifloraMain), typeof(function(){}));
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
		assert.strictEqual(incense.dbh.divideBoardId('abcdefg'), 'ab/cd/ef/g');
		assert.strictEqual(incense.dbh.divideBoardId('a'), 'a');
		assert.strictEqual(incense.dbh.divideBoardId('ab'), 'ab');
		assert.strictEqual(incense.dbh.divideBoardId('abcd'), 'ab/cd');
		done();
	});

	it("create", function(done) {
		this.timeout(60*1000);
		// console.log(incense);
		incense.board.createNewBoard({"title": "TEST BOARD"}, function(newBoardId){
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
