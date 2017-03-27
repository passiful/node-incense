/**
 * messageUpdater.js
 */
module.exports = function( incense, $timelineList, $fieldInner ){
	var _this = this;
	var Promise = require('es6-promise').Promise;
	var $ = require('jquery');
	var it79 = require('iterate79');

	/**
	 * タイムラインメッセージを更新する
	 */
	function execute(message, callback){
		callback = callback || function(){};
		console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= updateLog - messageUpdater');
		console.log(message);

		$timelineList.find('.incense__board-message-unit[data-board-message-id='+message.messageId+']')
			.html('')//一旦内容を削除
			.append($('<div>')
				.append( $('<div class="incense__message-group__deleted">').html( '-- deleted --' ) )
			)
		;

		callback();
		return;
	}

	/**
	 * タイムラインメッセージを受け付ける
	 */
	this.exec = function(message, callback){
		callback = callback || function(){};

		// 次のメッセージを処理
		execute(message, function(){
			// 処理済みのメッセージを破棄
			callback();
		});

		return;
	}

	return;
}
