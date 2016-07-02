/**
 * bifloraApi.js
 */
module.exports = (function(){
	// delete(require.cache[require('path').resolve(__filename)]);

	return new (function(){
		var connectionList = {};
		var userList = {};
		var logoutTimer = {};

		function setUserLoginData(data, userInfo){
			connectionList[data.connectionId] = {
				'connectionId': data.connectionId,
				'userInfo': userInfo,
				'boardId': data.boardId
			};
			if( !userList[data.boardId] ){
				userList[data.boardId] = {};
			}
			userList[data.boardId][userInfo.id] = connectionList[data.connectionId];
			console.log('------------=------------=------------=------------=------------=------------');
			if(logoutTimer[data.boardId]){
				clearTimeout( logoutTimer[data.boardId][userInfo.id] );
				delete( logoutTimer[data.boardId][userInfo.id] );
			}
			return true;
		}


		this.ping = function( data, callback, main, biflora ){
			callback('ping OK.');
			return;
		}
		this.message = function( data, callback, main, biflora ){
			// クライアントからのメッセージを受け付ける
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


			data.connectionId = biflora.socket.bifloraUserInfo.connectionId;
			// console.log(data);

			if( data.contentType == 'application/x-passiflora-command' ){
				var tmpContent = JSON.parse(data.content);
				if( tmpContent.operation == 'userLogin' ){
					if(!logoutTimer[data.boardId]){
						logoutTimer[data.boardId] = {};
					}
					if( logoutTimer[data.boardId][tmpContent.userInfo.id] ){
						setUserLoginData(data, tmpContent.userInfo);
						callback(true);
						return;
					}

					for( var idx in connectionList ){
						if( userList[data.boardId][tmpContent.userInfo.id] ){
							// 既にログイン済みのため、ログイン処理を行わない
							console.log( tmpContent.userInfo.id + ' は、既にログインしています。' );
							callback(true);
							return;
						}
					}
					setUserLoginData(data, tmpContent.userInfo);
				}
			}

			main.dbh.insertMessage(data.boardId, data, function(result){
				data.id = result.dataValues.id;

				biflora.send('receiveBroadcast', data, function(){
					console.log('send message');
				});
				biflora.sendToRoom('receiveBroadcast', data, data.boardId, function(){
					console.log('send message to room');
				});
				callback(true);
			});
			return;
		}
		this.getMessageList = function( data, callback, main, biflora ){
			main.dbh.getMessageList(data.boardId, {}, function(result){
				callback(result);
			});
			return;
		}
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
			data.connectionId = biflora.socket.bifloraUserInfo.connectionId;
			data.contentType = 'application/x-passiflora-command';
			data.targetWidget = null;
			data.owner = null;
			data.microtime = Date.now();
			data.boardId = boardId;

			// console.log(data);

			// タイムアウトをクリア
			if( !logoutTimer[data.boardId] ){
				logoutTimer[data.boardId] = {};
			}
			clearTimeout(logoutTimer[data.boardId][userInfo.id]);
			logoutTimer[data.boardId][userInfo.id] = (function(data){
				return setTimeout(function(){
					var tmpContent = JSON.parse(data.content);

					// ユーザー情報を削除
					if(userList[data.boardId]){
						userList[data.boardId][tmpContent.userInfo.id] = undefined;
						delete(userList[data.boardId][tmpContent.userInfo.id]);
					}

					main.dbh.insertMessage(data.boardId, data, function(result){
						data.id = result.dataValues.id;
						// console.log(result);
						biflora.send('receiveBroadcast', data, function(){
							console.log('send LOGOUT message');
						});
						biflora.sendToRoom('receiveBroadcast', data, data.boardId, function(){
							console.log('send LOGOUT message to room');
						});
					});
				}, 30*1000);
			})(data);

			return;
		}

	})();
})();
