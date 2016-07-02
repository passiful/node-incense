/**
 * dbh.js
 */
module.exports = function(conf, main){
	delete(require.cache[require('path').resolve(__filename)]);
	var fs = require('fs');
	var fsX = require('fs-extra');
	var utils79 = require('utils79');
	var Sequelize = require('sequelize');
	var sqlite = require('sqlite3');
	var dbs = {};

	/**
	 * DBを初期化
	 * @param  {String}   boardId  [description]
	 * @param  {Function} callback [description]
	 * @return {Void}              void.
	 */
	this.initDb = function(boardId, callback){
		callback = callback || function(){};
		if(dbs[boardId]){
			callback(dbs[boardId]);
			return;
		}

		var dbPath = require('path').resolve(conf.dataDir, ''+boardId, 'db.sqlite');
		// console.log(dbPath);

		var sequelize = new Sequelize(undefined, undefined, undefined, {
			'dialect': 'sqlite',
			'connection': new sqlite.Database( dbPath ),
			'storage': dbPath
		});

		var tbls = {};
		tbls.timeline = sequelize.define('timeline',
			{
				'content': { type: Sequelize.STRING },
				'contentType': { type: Sequelize.STRING },
				'targetWidget': { type: Sequelize.STRING },
				'owner': { type: Sequelize.STRING },
				'connectionId': { type: Sequelize.STRING },
				'microtime': { type: Sequelize.BIGINT }
			}
		);
		sequelize.sync();

		// ボード情報を記憶
		dbs[boardId] = {};
		dbs[boardId].boardId = boardId;
		dbs[boardId].path = dbPath;
		dbs[boardId].tbls = tbls;
		console.log(dbs);

		callback(dbs[boardId]);
		return;
	}

	/**
	 * メッセージをDBに挿入する
	 * @param  {[type]}   boardId  [description]
	 * @param  {[type]}   message  [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.insertMessage = function(boardId, message, callback){
		callback = callback || function(){};

		this.initDb(boardId, function(){

			dbs[boardId].tbls.timeline.create({
				'content': message.content,
				'contentType': message.contentType,
				'targetWidget': message.targetWidget,
				'owner': message.owner,
				'connectionId': message.connectionId,
				'microtime': message.microtime
			}).then(function(record){
				// console.log(record);
				callback(record);
			});

		});
		return;
	}

	/**
	 * メッセージ一覧を取得する
	 * @param  {[type]}   boardId  [description]
	 * @param  {[type]}   options  [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.getMessageList = function(boardId, options, callback){
		callback = callback || function(){};

		this.initDb(boardId, function(){

			dbs[boardId].tbls.timeline
				.findAndCountAll({})
				.then(function(result) {
					result.rows = JSON.parse(JSON.stringify(result.rows));
					// console.log(result);
					callback(result);
				})
			;

		});
		return;
	}

}
