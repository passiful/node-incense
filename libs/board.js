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
	this.createNewBoard = function( callback ){
		callback = callback || function(){};
		var tryCount = 0;

		while(1){

			try {
				var newBoardId = (+new Date());
				console.log(newBoardId);

				main.dbh.initDb(newBoardId, function(dbInfo){
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

}
