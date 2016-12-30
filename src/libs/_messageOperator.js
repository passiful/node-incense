/**
 * messageOperator.js
 */
module.exports = function( app, $timelineList, $fieldInner ){
	var _this = this;
	var $ = require('jquery');
	var it79 = require('iterate79');
	var newestMessageNumber = 0;
	var messageQueue = {};
	var messageQueueLength = 0;
	var isQueueProgress = false;

	/**
	 * タイムラインメッセージを処理する
	 */
	function execute(message, callback){
		callback = callback || function(){};
		// console.log(message);

		var $messageUnit = $('<div>');

		if( !message.content ){
			console.error('content がセットされていないレコードです。', message);
			callback();
			return;
		}

		switch( message.contentType ){
			case 'application/x-passiflora-command':
				message.content = JSON.parse(message.content);
				switch( message.content.operation ){
					case 'createWidget':
						app.widgetMgr.create( message.id, message.content );
						var str = '';
						str += message.owner;
						str += ' が ';
						str += message.content.widgetType;
						str += ' を作成しました。';
						app.insertTimeline( message, $messageUnit
							.addClass('incense__message-unit--operation')
							.append( $('<div class="incense__message-unit__operation-message">').text(str) )
						);
						break;
					case 'moveWidget':
						app.widgetMgr.move( message.id, message.content );
						break;
					case 'setParentWidget':
						app.widgetMgr.setParentWidget( message.id, message.content );
						var str = '';
						str += message.owner;
						str += ' が ';
						str += '#widget.'+message.content.targetWidgetId;
						str += ' の親ウィジェットを ';
						str += '#widget.'+message.content.newParentWidgetId;
						str += ' に変更しました。';
						app.insertTimeline( message, $messageUnit
							.addClass('incense__message-unit--operation')
							.append( $('<div class="incense__message-unit__operation-message">').text(str) )
						);
						break;
					case 'deleteWidget':
						app.widgetMgr.delete( message.id, message.content.targetWidgetId );
						var str = '';
						str += message.owner;
						str += ' が ';
						str += '#widget.'+message.content.targetWidgetId;
						str += ' を削除しました。';
						app.insertTimeline( message, $messageUnit
							.addClass('incense__message-unit--operation')
							.append( $('<div class="incense__message-unit__operation-message">').text(str) )
						);
						break;
					case 'userLogin':
						app.userMgr.login( message.content.userInfo, function(err, userInfo){
							// console.log('user "'+userInfo.name+'" Login.');
							var str = '';
							str += 'ユーザー "' + message.content.userInfo.name + '" がログインしました。';
							app.insertTimeline( message, $messageUnit
								.addClass('incense__message-unit--operation')
								.append( $('<div class="incense__message-unit__operation-message">').text(str) )
							);
						} );
						break;
					case 'userLogout':
						// console.log(message);
						app.userMgr.logout( message.content.userInfo.id, function(err, userInfo){
							if(userInfo === undefined){
								console.error( 'userLogout: userInfo が undefined です。' );
								return;
							}
							// console.log(userInfo);
							// console.log('user "'+userInfo.name+'" Logout.');
							var str = '';
							str += 'ユーザー "' + userInfo.name + '" がログアウトしました。';
							app.insertTimeline( message, $messageUnit
								.addClass('incense__message-unit--operation')
								.append( $('<div class="incense__message-unit__operation-message">').text(str) )
							);
						} );
						break;
				}
				break;
			case 'application/x-passiflora-widget-message':
				message.content = JSON.parse(message.content);
				app.widgetMgr.receiveWidgetMessage( message );
				break;
			case 'text/html':
				var user = app.userMgr.get(message.owner);
				app.insertTimeline( message, $messageUnit
					.append( $('<div class="incense__message-unit__owner">')
						.append( $('<span class="incense__message-unit__owner-name">').text(user.name) )
						.append( $('<span class="incense__message-unit__owner-id">').text(user.id) )
					)
					.append( $('<div class="incense__message-unit__content incense-markdown">').html( incense.detoxHtml( message.content ) ) )
				);
				break;
		}
		callback();
		return;
	}

	/**
	 * タイムラインメッセージを受け付ける
	 */
	this.exec = function(message, callback){
		callback = callback || function(){};

		if( newestMessageNumber >= message.id ){
			// 既に処理済みのメッセージとみなし、キューに追加しない。
			console.error(message.id + ' は、すでに処理済みのメッセージです。');
			console.error(message);
			callback(); return;
		}
		if( newestMessageNumber[message.id] ){
			// 既に登録済みのメッセージとみなし、キューに追加しない。
			console.error(message.id + ' は、すでにキューに登録済みのメッセージです。');
			console.error(message);
			callback(); return;
		}


		messageQueue[message.id] = message;//メッセージを Queue に追加
		messageQueueLength ++;
		// console.log(message);

		if( isQueueProgress ){
			callback(); return;
		}
		isQueueProgress = true;

		function queueLoop(){
			setTimeout(function(){
				if( !messageQueue[newestMessageNumber+1] ){
					// 次のメッセージがなければストップ
					if( messageQueueLength ){
						// TODO: サーバーに問い合わせ、欠けた情報を取得する必要がある。
						// ここを通る場合、受信に失敗したメッセージがあって連番が抜けている可能性が高い。
						console.error(messageQueueLength + ' 件の未処理のメッセージが残っています。');
						console.error(messageQueue);
						console.error(newestMessageNumber);
					}
					// console.log(messageQueue);
					isQueueProgress = false;
					callback();
					return;
				}
				newestMessageNumber ++;
				// console.log(newestMessageNumber);

				// 次のメッセージを処理
				execute(messageQueue[newestMessageNumber], function(){
					// 処理済みのメッセージを破棄
					messageQueue[newestMessageNumber] = undefined;
					delete( messageQueue[newestMessageNumber] );
					messageQueueLength --;
					queueLoop();//再帰処理
				});
			}, 0);

			return;
		}
		queueLoop();

		return;
	}


	/**
	 * ウィジェットを配置する
	 */
	this.createWidget = function(id, content){
		$fieldInner.append( $('<div class="widget">')
			.css({
				'left': content.x,
				'top': content.y
			})
			.attr({
				'data-widget-id': id,
				'data-offset-x': content.x,
				'data-offset-y': content.y,
				'draggable': true
			})
			.on('dblclick contextmenu', function(e){
				e.stopPropagation();
			})
			.bind('dragstart', function(e){
				e.stopPropagation();
				var event = e.originalEvent;
				var $this = $(this);
				event.dataTransfer.setData("method", 'moveWidget' );
				event.dataTransfer.setData("widget-id", $this.attr('data-widget-id') );
				event.dataTransfer.setData("offset-x", $this.attr('data-offset-x') );
				event.dataTransfer.setData("offset-y", $this.attr('data-offset-y') );
				console.log(e);
			})
		);
	}

	/**
	 * ウィジェットを配置する
	 */
	this.moveWidget = function(id, content){
		$targetWidget = $fieldInner.find('[data-widget-id='+content.targetWidgetId+']');
		$targetWidget
			.css({
				'left': content.moveToX,
				'top': content.moveToY
			})
			.attr({
				'data-offset-x': content.moveToX,
				'data-offset-y': content.moveToY
			})
		;
	}

	return;
}
