/**
 * widgets: stickies.js
 */
module.exports = function( incense, $widget ){
	var _this = this;
	var $ = require('jquery');

	this.value = 'new Stickies';

	var $stickies = $('<div class="stickies">');
	var $textarea = $('<textarea>')
		.css({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'width': '100%',
			'height': '100%'
		})
	;
	var mode = null;

	$widget.append( $stickies
		.html( incense.markdown( _this.value ) )
	);

	$widget
		.dblclick(function(e){
			mode = 'edit';
			$widget.append( $textarea.val( _this.value ) );
			$textarea.focus();
		})
		.click(function(e){
			e.stopPropagation();
		})
	;

	function apply(){
		if(mode != 'edit'){return;}
		mode = null;
console.log(12345678);
		if( _this.value == $textarea.val() ){
			// 変更なし
			$textarea.val('').remove();
			$stickies.html( incense.markdown(_this.value) );
			return;
		}

		incense.sendMessage(
			{
				'content': JSON.stringify({
					'val': $textarea.val()
				}),
				'contentType': 'application/x-passiflora-widget-message',
				'targetWidget': $widget.attr('data-widget-id')
			},
			function(){
				console.log('stickies change submited.');
				$textarea.val('').remove();
				$stickies.html( incense.markdown(_this.value) );
			}
		);
	}

	$textarea
		.on('change blur', function(e){
			apply();
		})
	;
	$('body')
		.on('click', function(e){
			apply();
		})
	;

	incense.setBehaviorChatComment(
		$textarea,
		{
			'submit': function(value){
				apply();
			}
		}
	);


	/**
	 * widget への配信メッセージを受信
	 */
	this.onMessage = function(message){
		// console.log(message);
		var before = this.value;
		var user = incense.userMgr.get(message.owner);
		this.value = message.content.val;
		$stickies.html( incense.markdown( _this.value ) );

		var $messageUnit = $('<div>');

		var userMessage = 'stickies の内容を "'+before+'" から "'+message.content.val + '" に書き換えました。';
		if( !before.length && message.content.val.length ){
			userMessage = 'stickies に内容 "'+message.content.val + '" をセットしました。';
		}else if( before.length && !message.content.val.length ){
			userMessage = 'stickies の内容 "'+before + '" を削除しました。';
		}
		incense.insertTimeline( message, $messageUnit
			.append( $('<div class="incense__message-unit__owner">')
				.append( $('<span class="incense__message-unit__owner-name">').text(user.name) )
				.append( $('<span class="incense__message-unit__owner-id">').text(user.id) )
			)
			.append( $('<div>').text(userMessage) )
			.append( $('<div class="incense__message-unit__targetWidget">').append( incense.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
		);

	}

	return;
}
