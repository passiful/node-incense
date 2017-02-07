/**
 * board.js
 */
module.exports = function(conf, main){
	delete(require.cache[require('path').resolve(__filename)]);
	var fs = require('fs');
	var fsX = require('fs-extra');
	var utils79 = require('utils79');
	var Sequelize = require('sequelize');
	var sqlite = require('sqlite3');

	/**
	 * 新しいボードを生成する
	 */
	this.createNewBoard = function( boardInfo, callback ){
		callback = callback || function(){};
		var tryCount = 0;
		var boardInfo = {};

		while(1){

			try {
				main.dbh.createNewBoard(boardInfo, function(newBoardId){
					// 返却
					// console.log(dbInfo);
					callback(newBoardId);
				});
				break;

			} catch (e) {
				console.log('catched.', e.message);
				tryCount ++;
				if( tryCount > 100 ){
					callback(false);
					return;
				}
				continue;
			}

		}

		return;
	}

	/**
	 * ボード情報を取得する
	 */
	this.getBoardInfo = function(boardId, callback){
		callback = callback || function(){};

		var dirPath = main.dbh.getBoardInfo(boardId, function(result){
			callback(result);
		});

		return;
	}

}
