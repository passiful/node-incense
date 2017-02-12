/**
 * _lfm.js
 */
module.exports = function(incense, biflora){
	var $ = require('jquery');
	var utils79 = require('utils79');

	/**
	 * ファイルIDを予約する
	 */
	this.reserve = function(callback){
		biflora.send(
			'createNewFile',
			{
				'boardId': incense.getBoardId()
			},
			function(fileId){
				// console.log(fileId);
				if( !fileId ){
					console.error('ERROR: failed to getting new file ID:', fileId);
				}
				callback(fileId);
				return;
			}
		);
		return;
	}

	/**
	 * ファイルIDを予約する
	 */
	this.upload = function(lfId, fileInfo, callback){
		callback(false);
		return;
	}

	/**
	 * ファイルを取得する
	 */
	this.download = function(lfId, callback){
		callback(false);
		return;
	}
}
