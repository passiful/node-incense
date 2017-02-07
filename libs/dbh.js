/**
 * dbh.js
 */
module.exports = function(conf, main){
	delete(require.cache[require('path').resolve(__filename)]);
	var fs = require('fs');
	var fsX = require('fs-extra');
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var Sequelize = require('sequelize');
	var sqlite = require('sqlite3');
	var tbls = {};

	/**
	 * DBを初期化
	 * @param  {Function} callback [description]
	 * @return {Void}              void.
	 */
	this.initDb = function(callback){
		callback = callback || function(){};

		var dbPath = require('path').resolve(conf.db.storage);
		// console.log(dbPath);

		var sequelize = new Sequelize(undefined, undefined, undefined, {
			'dialect': 'sqlite',
			'connection': new sqlite.Database( dbPath ),
			'storage': dbPath
		});

		tbls.board = sequelize.define(conf.db.tablePrefix+'-board',
			{
				'boardId': { type: Sequelize.STRING, primaryKey: true, allowNull: false },
				'title': { type: Sequelize.STRING },
				'owner': { type: Sequelize.STRING },
				'opened': { type: Sequelize.INTEGER },
				'microtime': { type: Sequelize.BIGINT }
			}
		);
		tbls.timeline = sequelize.define(conf.db.tablePrefix+'-timeline',
			{
				'boardId': {
					type: Sequelize.STRING,
					unique: 'boardMessageUniqueKey',
					allowNull: false,
					references: {
						// This is a reference to another model
						model: tbls.board,
						key: 'boardId'
					}
				},
				'boardMessageId': { type: Sequelize.BIGINT, unique: 'boardMessageUniqueKey', allowNull: false },
				'content': { type: Sequelize.STRING },
				'contentType': { type: Sequelize.STRING },
				'targetWidget': { type: Sequelize.STRING },
				'owner': { type: Sequelize.STRING },
				'connectionId': { type: Sequelize.STRING },
				'microtime': { type: Sequelize.BIGINT }
			}
		);
		sequelize.sync()
			.then(function(){
				callback(true);
			})
		;

		return;
	}

	/**
	 * ボードIDを分解する
	 */
	this.divideBoardId = function(boardId){
		// str.substring(0,2); // 2文字ずつとりだす
		var ary = utils79.divide(boardId, 2);
		return ary.join('/');
	}

	/**
	 * ボードデータの格納パス名を取得する
	 */
	this.getPathBoardDataDir = function(boardId){
		var path = require('path').resolve(conf.dataDir, this.divideBoardId(boardId), '__data')+'/';
		return path;
	}

	/**
	 * 新しいボードを作成する
	 */
	this.createNewBoard = function(boardInfo, callback){
		callback = callback || function(){};
		this.initDb(function(){
			var retryCounter = 0;
			it79.fnc(
				{},
				{
					"insert": function(it1, data){
						retryCounter ++;
						if( retryCounter > 50 ){
							// 50回やっても成功しないなら、諦めて離脱する
							callback(false);
							return;
						}

						var newBoardId = (+new Date());
						newBoardId += '.'+(Math.random() * 10000)+'.'+(Math.random() * 10000);
						// console.log(newBoardId);
						newBoardId = (function(src) {
							var crypto = require('crypto');
							var md5 = crypto.createHash('md5');
							md5.update(src, 'utf8');
							return md5.digest('hex');
						})(newBoardId);
						// console.log(newBoardId);

						tbls.board.create({
							'boardId': newBoardId,
							'title': boardInfo.title,
							'opened': 1,
							'owner': boardInfo.owner,
							'microtime': Date.now()
						}).then(function(record){
							// successful
							callback(newBoardId);
						}).catch(function(){
							// retry
							retryCounter ++;
							if( retryCounter > 100 ){
								callback(false);
								return;
							}
							it1.goto("insert", data);
						});
					}
				}
			);
		});
		return;
	}

	/**
	 * ボードの詳細情報を得る
	 */
	this.getBoardInfo = function(boardId, callback){
		callback = callback || function(){};

		this.initDb(function(){

			tbls.board
				.findOne({
					"where":{
						"boardId": boardId
					}
				})
				.then(function(result) {
					// console.log(result);
					result.dataValues = JSON.parse(JSON.stringify(result.dataValues));
					callback(result.dataValues);
				})
			;

		});
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

		this.initDb(function(){

			var retryCounter = 0;
			it79.fnc(
				{},
				{
					"insert": function(it1, data){
						retryCounter ++;
						if( retryCounter > 50 ){
							// 50回やっても成功しないなら、諦めて離脱する
							callback(false);
							return;
						}

						tbls.timeline.max(
							'boardMessageId',
							{
								'where': { 'boardId': boardId }
							}
						).then(function(maxBoardMessageId){
							if(!maxBoardMessageId||typeof(maxBoardMessageId)!==typeof(1)){maxBoardMessageId = 0;}

							tbls.timeline.create({
								'boardId': boardId,
								'boardMessageId': maxBoardMessageId+1,
								'content': message.content,
								'contentType': message.contentType,
								'targetWidget': message.targetWidget,
								'owner': message.owner,
								'connectionId': message.connectionId,
								'microtime': Date.now()
							}).then(function(record){
								// successful
								callback(record);
							}).catch(function(){
								// retry
								it1.goto("insert", data);
							});
						});
					}
				}
			);

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

		this.initDb(function(){

			tbls.timeline
				.findAndCountAll({
					"where":{
						"boardId": boardId
					}
				})
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
