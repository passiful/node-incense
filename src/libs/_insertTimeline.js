/**
 * _insertTimeline.js
 */
module.exports = function(incense, $timelineList){
	var $ = require('jquery');
	var lastTimelineMessage = {};

	return function(message, $messageContent){
		// console.log(message);
		var userInfo = incense.getUserInfo();

		$messageContent = $messageContent || $('<div>');

		$boardMessageUnit = $('<div>').append($messageContent);
		$boardMessageUnit
			.addClass('incense__board-message-unit')
			.attr({
				'data-message-id': message.id,
				'data-message-owner': message.owner,
				'data-board-message-id': message.boardMessageId
			})
		;


		var $messageBodyContent = $('<div class="incense__message-group__message-body-content">');
		var $message = $('<div>')
			.addClass('incense__message-group')
			.attr({
				'data-message-id': message.id,
				'data-message-owner': message.owner
			})
		;
		if( userInfo.id == message.owner ){
			// ログインユーザー自身の投稿だったら
			$message
				.addClass('incense__message-group--myitem')
			;
			if( !message.deletedFlag ){
				$boardMessageUnit.append($('<div>')
					.addClass('incense__board-message-unit__ctrl')
					.append( $('<a>')
						.attr({
							'href': 'javascript:;',
							'data-message-id': message.id,
							'data-message-owner': message.owner,
							'data-board-message-id': message.boardMessageId
						})
						.text('削除')
						.on('click', function(){
							var $this = $(this);
							var messageId = $this.attr('data-board-message-id');
							incense.deleteMessage( messageId, function(result){
								console.info('メッセージ '+messageId+' を削除しました。');
							} );
						})
					)
				);
			}
		}
		// console.log( incense.userMgr.getAll() );
		var ownerInfo = incense.userMgr.get(message.owner);
		var $userIcon = $('<div class="incense__message-group__owner-icon">');
		if( ownerInfo.icon ){
			$userIcon
				.append( $('<img>')
					.attr({
						'src': ownerInfo.icon
					})
					.css({
						'width': 30,
						'height': 30
					})
				)
			;
		}

		if( lastTimelineMessage.owner == message.owner && lastTimelineMessage.targetWidget == message.targetWidget && lastTimelineMessage.microtime > message.microtime-(5*60*1000) ){
			// 連続した投稿の2件目以降の場合
			// 前回作成したコンテナ内に挿入する。
			$messageBodyContent = lastTimelineMessage.$messageBodyContent;
			$messageBodyContent
				.append( $boardMessageUnit )
			;
		}else{
			// 連続した投稿の初回の場合
			// 投稿者の情報等を含むコンテナを作成し、挿入する。
			var $messageBody = $('<div class="incense__message-group__message-body">');
			$message
				.append( $userIcon )
				.append( $messageBody
					.append( $('<div class="incense__message-group__owner">')
						.attr({'title': new Date(message.microtime)})
						.append( $('<span class="incense__message-group__owner-name">').text(ownerInfo.name) )
						.append( $('<span class="incense__message-group__owner-id">').text(ownerInfo.id) )
					)
					.append( $messageBodyContent
						.append($boardMessageUnit)
					)
				)
			;
			if( message.targetWidget ){
				$messageBody
					.append( $('<div class="incense__message-group__targetWidget">')
						.append(
							incense.widgetMgr.mkLinkToWidget( message.targetWidget )
						)
					)
				;
			}
			$timelineList.append( $message );
		}

		incense.adjustTimelineScrolling($timelineList);

		lastTimelineMessage = {
			'owner': message.owner,
			'targetWidget': message.targetWidget,
			'microtime': message.microtime,
			'$messageBodyContent': $messageBodyContent
		};
		return;
	}
}
