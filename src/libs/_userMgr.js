/**
 * userMgr.js
 */
module.exports = function( app, $timelineList, $field, $fieldInner ){
	var _this = this;
	var userList = {};


	/**
	 * ユーザー情報を登録する
	 */
	this.login = function(userInfo, callback){
		// console.log(userInfo);
		callback = callback || function(err, userInfo){};
		var err = null;
		var rtn = false;
		try {
			if( !userInfo.id.length ){
				callback(err, rtn);return;
			}else{
				userList[userInfo.id] = userInfo;
				rtn = userList[userInfo.id];
			}
		} catch (e) {
			err = '[LOGIN ERROR] invalid user info.';
			console.error(err, userInfo);
		}
		callback(err, rtn);
		return;
	}

	/**
	 * ユーザー情報を削除する
	 */
	this.logout = function(userId, callback){
		callback = callback || function(err, {}){};
		try {
			// ログアウトしても、ユーザーの情報を忘れる必要はない。
			// "議論に参加してくれた貢献者" ということで記録に留めることにする。
			// userList[userId] = undefined;
			// delete( userList[userId] );

			callback( null, userList[userId] );
			return;
		} catch (e) {
			console.error('[ERROR] failed to logout: '+userId);
			callback('[ERROR] failed to logout: '+userId, false);
			return;
		}
		return;
	}

	/**
	 * ユーザー情報を取得する
	 */
	this.get = function(id){
		var rtn = userList[id];
		if( !rtn ){
			// userが見つからない場合
			console.error( 'User NOT found: ' + id );
			rtn = {
				"id": id,
				"name": "("+id+")"
			};
		}
		return rtn;
	}

	/**
	 * ユーザー情報を一覧ごと取得する
	 */
	this.getAll = function(){
		return userList;
	}

	return;
}
