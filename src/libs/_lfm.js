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
	 * ファイルを更新する
	 */
	this.upload = function(fileId, fileInfo, callback){
		biflora.send(
			'updateFile',
			{
				'boardId': incense.getBoardId(),
				'fileId': fileId,
				'fileInfo': fileInfo
			},
			function(result){
				// console.log(result);
				if( !result ){
					console.error('ERROR: failed to update file:', fileId);
				}
				callback(result);
				return;
			}
		);
		return;
	}

	/**
	 * ファイルを取得する
	 */
	this.download = function(fileId, callback){
		biflora.send(
			'getFile',
			{
				'boardId': incense.getBoardId(),
				'fileId': fileId
			},
			function(fileInfo){
				// console.log(fileInfo);
				if( !fileInfo ){
					console.error('ERROR: failed to downloading file:', fileId);
				}
				callback(fileInfo);
				return;
			}
		);
		return;
	}
}
