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
			'height': '100%',
			'font-size': '11px',
			'padding': '0.5em'
		})
	;
	_this.mode = null;

	$widget.append( $stickies
		.html( incense.detoxHtml( incense.markdown( _this.value ) ) )
	);

	$widget
		.on('dblclick', function(e){
			incense.locker.lock(_this.id, 'main', function(res){
				// console.log(res);
				if(!res){
					console.log('failed to open editor; this widget was locked. This is edited by other member.');
					return;
				}
				_this.mode = 'edit';
				$widget.append( $textarea.val( _this.value ) );
				$textarea.focus();
			});
		})
		.on('click', function(e){
			e.stopPropagation();
		})
	;

	function apply(){
		if( _this.mode !== 'edit' ){
			return;
		}
		_this.mode = null;
		if( _this.value == $textarea.val() ){
			// 変更なし
			$textarea.val('').remove();
			$stickies.html( incense.detoxHtml( incense.markdown(_this.value) ) );
			incense.locker.unlock();
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
				$stickies.html( incense.detoxHtml( incense.markdown(_this.value) ) );
				incense.locker.unlock();
				return;
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
	 * widget の内容を端的に説明するテキストを取得する
	 */
	this.getSummary = function(){
		return this.value;
	}

	/**
	 * widget への配信メッセージを受信
	 */
	this.onMessage = function(message){
		// console.log(message);
		var before = this.value;
		var user = incense.userMgr.get(message.owner);
		this.value = message.content.val;
		$stickies.html( incense.detoxHtml( incense.markdown( _this.value ) ) );

		var $messageUnit = $('<div>');

		var userMessage = 'stickies の内容を "'+before+'" から "'+message.content.val + '" に書き換えました。';
		if( !before.length && message.content.val.length ){
			userMessage = 'stickies に内容 "'+message.content.val + '" をセットしました。';
		}else if( before.length && !message.content.val.length ){
			userMessage = 'stickies の内容 "'+before + '" を削除しました。';
		}
		incense.insertTimeline( message, $messageUnit
			.append( $('<div class="incense__message-unit__operation">').text(userMessage) )
			// .append( $('<div class="incense__message-unit__targetWidget">').append( incense.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
		);

	}

	return;
}
