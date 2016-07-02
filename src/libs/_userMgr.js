/**
 * userMgr.js
 */
module.exports = function( app, $timelineList, $field, $fieldInner ){
	var _this = this;
	var userList = {};


	/**
	 * ユーザー情報を登録する
	 */
	this.login = function(connectionId, userInfo, callback){
		callback = callback || function(err, userInfo){};
		userList[connectionId] = userInfo;
		callback(null, userList[connectionId]);
		return;
	}

	/**
	 * ユーザー情報を削除する
	 */
	this.logout = function(connectionId, callback){
		callback = callback || function(err, userInfo){};
		var rtn = userList[connectionId];
		userList[connectionId] = undefined;
		delete(userList[connectionId]);
		callback(null, rtn);
		return;
	}

	/**
	 * ユーザー情報を取得する
	 */
	this.get = function(connectionId){
		return userList[connectionId];
	}

	/**
	 * ユーザー情報を一覧ごと取得する
	 */
	this.getAll = function(){
		return userList;
	}

	return;
}
