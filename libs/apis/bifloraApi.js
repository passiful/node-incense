/**
 * bifloraApi.js
 */
module.exports = (function(){
	// delete(require.cache[require('path').resolve(__filename)]);
	var it79 = require('iterate79');
	var utils79 = require('utils79');

	var icon_default = 'data:image/png;base64,'+utils79.base64_encode( require('fs').readFileSync(__dirname+'/../resources/icon_default.png') );

	return new (function(){
		var connectionList = {};
			// ↑接続の管理はサーバー側でのみ行う。(クライアント側ではユーザーIDでの管理のみ行う)
		var userList = {};
			// ↑この情報は基本的にサーバー側で利用する機会は少ない。
			// 切断直後の再ログイン時に重複を回避する目的でしか利用していない。
			// 従って、過去ログからuserListの復元するなどの厳密な管理は不要。
			// `connectionList` の管理のための補助データとして位置づける。
		var logoutTimer = {};

		function setUserLoginData(data, userInfo){
			console.log('------------=------------');
			console.log('setting user login data;');
			console.log(data.connectionId);
			connectionList[data.connectionId] = {
				'connectionId': data.connectionId,
				'userInfo': userInfo,
				'boardId': data.boardId
			};
			if( !userList[data.boardId] ){
				userList[data.boardId] = {};
			}
			userList[data.boardId][userInfo.id] = connectionList[data.connectionId];

			if(logoutTimer[data.boardId]){
				clearTimeout( logoutTimer[data.boardId][userInfo.id] );
				delete( logoutTimer[data.boardId][userInfo.id] );
			}
			console.log(connectionList);
			console.log('/ ------------=------------');
			return true;
		}


		/**
		 * 疎通確認
		 */
		this.ping = function( data, callback, main, biflora ){
			callback('ping OK.');
			return;
		}

		/**
		 * ログインユーザー自身の情報を取得する
		 */
		this.getMySelf = function( data, callback, main, biflora ){
			try {
				main.getUserInfo( biflora.socket, data, function(userInfo){
					callback(userInfo);
					return;
				} );
			} catch (e) {
				// error.
				callback(false);
			}
			return;
		}

		/**
		 * クライアントからのメッセージを受け付ける
		 */
		this.message = function( data, callback, main, biflora ){

			it79.fnc(
				{},
				[
					function(it1, arg){
						data.microtime = Date.now();

						if(typeof(data.content)===typeof('') && data.contentType == 'text/markdown'){
							var marked = require('marked');
							marked.setOptions({
								renderer: new marked.Renderer(),
								gfm: true,
								tables: true,
								breaks: false,
								pedantic: false,
								sanitize: false,
								smartLists: true,
								smartypants: false
							});
							data.content = marked(data.content);
							data.contentType = 'text/html';
						}


						data.connectionId = biflora.socket.id;
						// console.log(data);
						it1.next(arg);
					},
					function(it1, arg){

						if( data.contentType == 'application/x-passiflora-command' ){
							var tmpContent = JSON.parse(data.content);
							if( tmpContent.operation == 'userLogin' ){
								// ユーザーがログインを試みた場合
								main.getUserInfo( biflora.socket, tmpContent.userInfo, function(userInfo){
									if( userInfo === false ){
										callback(false);
										return;
									}
									if( !userInfo.icon ){
										userInfo.icon = icon_default;
									}
									if( typeof(logoutTimer[data.boardId]) != typeof({}) ){
										logoutTimer[data.boardId] = {}; // initialize
									}
									if( logoutTimer[data.boardId][userInfo.id] ){
										console.log( userInfo.id + ' のログアウトタイマーをキャンセルしました。' );
										setUserLoginData(data, userInfo);
										callback(true);
										return;
									}

									for( var idx in connectionList ){
										if( userList[data.boardId][userInfo.id] ){
											// 既にログイン済みのため、ログイン処理を行わない
											console.log( userInfo.id + ' は、既にログインしています。' );
											callback(true);
											return;
										}
									}

									setUserLoginData(data, userInfo);
									tmpContent.userInfo = userInfo;
									data.content = JSON.stringify(tmpContent);
									it1.next(arg);
									return;
								} );
								return;
							}
						}

						it1.next(arg);
					},
					function(it1, arg){

						main.getUserInfo( biflora.socket, {"id":data.owner}, function(userInfo){
							if(userInfo.id){
								data.owner = userInfo.id;
							}
							it1.next(arg);
						} );
					},
					function(it1, arg){

						main.dbh.insertMessage(data.boardId, data, function(result){
							biflora.send('receiveBroadcast', result.dataValues, function(){
								console.log('send message');
							});
							biflora.sendToRoom('receiveBroadcast', result.dataValues, data.boardId, function(){
								console.log('send message to room');
							});
							it1.next(arg);
						});
					},
					function(it1, arg){
						callback(true);
					}
				]
			);
			return;
		}

		/**
		 * DBからメッセージの一覧を取得する
		 */
		this.getMessageList = function( data, callback, main, biflora ){
			main.dbh.getMessageList(data.boardId, {}, function(result){
				callback(result);
			});
			return;
		}

		/**
		 * UIを排他ロックしたメッセージを配信する
		 */
		this.locker = function( data, callback, main, biflora ){
			biflora.sendToRoom(
				'locker',
				data,
				data.boardId,
				function(){
					// console.log('send Locker message to room');
				}
			);
			biflora.send(
				'locker',
				data,
				function(rtn){
					// console.log('send Locker message', rtn);
					callback(rtn);
				}
			);

			return;
		}

		/**
		 * 接続を切断する
		 */
		this.disconnect = function( data, callback, main, biflora ){
			console.log( 'User Disconnect.' );
			var userInfo = connectionList[data.connectionId].userInfo;
			var boardId = connectionList[data.connectionId].boardId;

			// connection を削除
			connectionList[data.connectionId] = undefined;
			delete(connectionList[data.connectionId]);

			data.content = JSON.stringify({
				'operation': 'userLogout',
				'userInfo': userInfo
			});
			data.connectionId = biflora.socket.id;
			data.contentType = 'application/x-passiflora-command';
			data.targetWidget = null;
			data.owner = userInfo.id;
			data.microtime = Date.now();
			data.boardId = boardId;

			// console.log(data);

			new (function(data, userInfo){
				try {
					// タイムアウトをクリア
					if( typeof(logoutTimer[data.boardId]) != typeof({}) ){
						logoutTimer[data.boardId] = {}; // initialize
					}
					clearTimeout(logoutTimer[data.boardId][userInfo.id]);
				} catch (e) {
					console.error( '[ERROR] FAILED to clear logoutTimer.' + data.boardId + ', ' + userInfo.id );
				}

				logoutTimer[data.boardId][userInfo.id] = setTimeout(function(){
					try {
						var tmpContent = JSON.parse(data.content);

						// ユーザー情報を削除
						if(userList[data.boardId]){
							userList[data.boardId][tmpContent.userInfo.id] = undefined;
							delete(userList[data.boardId][tmpContent.userInfo.id]);
						}

						main.dbh.insertMessage(data.boardId, data, function(result){
							data.id = result.dataValues.id; // これはDBのレコードのID
							// console.log(result);
							biflora.send('receiveBroadcast', data, function(){
								console.log('send LOGOUT message');
							});
							biflora.sendToRoom('receiveBroadcast', data, data.boardId, function(){
								console.log('send LOGOUT message to room');
							});
						});
					} catch (e) {
						console.error( '[ERROR] FAILED to logoutTimer execution.' );
					}
				}, 30*1000);
			})(data, userInfo);
			return;
		}

	})();
})();
