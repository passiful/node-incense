/**
 * _insertTimeline.js
 */
module.exports = function(incense, $timelineList){
	var $ = require('jquery');
	var lastTimelineMessage = {};

	return function(message, $messageContent){
		// console.log(message);
		$messageContent = $messageContent || $('<div>');
		$messageContent.css({'margin-bottom': 3});
		var $messageBodyContent = $('<div class="incense__message-unit__message-body-content">');
		var $message = $('<div>')
			.addClass('incense__message-unit')
			.attr({
				'data-message-id': message.id,
				'data-message-owner': message.owner
			})
		;
		var userInfo = incense.getUserInfo();
		if( userInfo.id == message.owner ){
			$message
				.addClass('incense__message-unit--myitem')
			;
		}
		// console.log( incense.userMgr.getAll() );
		var ownerInfo = incense.userMgr.get(message.owner);
		var $userIcon = $('<div class="incense__message-unit__owner-icon">');
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
			$messageBodyContent = lastTimelineMessage.$messageBodyContent;
			$messageBodyContent
				.append( $messageContent )
			;
		}else{
			var $messageBody = $('<div class="incense__message-unit__message-body">');
			$message
				.append( $userIcon )
				.append( $messageBody
					.append( $('<div class="incense__message-unit__owner">')
						.attr({'title': new Date(message.microtime)})
						.append( $('<span class="incense__message-unit__owner-name">').text(ownerInfo.name) )
						.append( $('<span class="incense__message-unit__owner-id">').text(ownerInfo.id) )
					)
					.append( $messageBodyContent
						.append($messageContent)
					)
				)
			;
			if( message.targetWidget ){
				$messageBody
					.append( $('<div class="incense__message-unit__targetWidget">')
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
