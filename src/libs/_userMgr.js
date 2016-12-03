/**
 * userMgr.js
 */
module.exports = function( app, $timelineList, $field, $fieldInner ){
	var _this = this;
	var userConnectionList = {};
	var userList = {};


	/**
	 * ユーザー情報を登録する
	 */
	this.login = function(connectionId, userInfo, callback){
		callback = callback || function(err, userInfo){};
		userConnectionList[connectionId] = userInfo;
		userList[userInfo.id] = userInfo;
		callback(null, userConnectionList[connectionId]);
		return;
	}

	/**
	 * ユーザー情報を削除する
	 */
	this.logout = function(connectionId, callback){
		callback = callback || function(err, userInfo){};
		var rtn = userConnectionList[connectionId];

		userList[rtn.id] = undefined;
		delete( userList[rtn.id] );
		userConnectionList[connectionId] = undefined;
		delete( userConnectionList[connectionId] );

		callback( null, rtn );
		return;
	}

	/**
	 * 接続IDからユーザー情報を取得する
	 */
	this.getUserByConnectionId = function(connectionId){
		return userConnectionList[connectionId];
	}

	/**
	 * 接続IDからユーザー情報を取得する
	 */
	this.getAllConnection = function(){
		return userConnectionList;
	}

	/**
	 * ユーザー情報を取得する
	 */
	this.get = function(id){
		return userList[id];
	}

	/**
	 * ユーザー情報を一覧ごと取得する
	 */
	this.getAll = function(){
		return userList;
	}

	return;
}
