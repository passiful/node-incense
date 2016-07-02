(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * widgets: stickies.js
 */
module.exports = function( app, $widget ){
	var _this = this;

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
		.html( app.markdown( _this.value ) )
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
		if( _this.value == $textarea.val() ){
			// 変更なし
			$textarea.val('').remove();
			$stickies.html( app.markdown(_this.value) );
			return;
		}

		app.sendMessage(
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
				$stickies.html( app.markdown(_this.value) );
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

	app.setBehaviorCharComment(
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
		this.value = message.content.val;
		$stickies.html( app.markdown( _this.value ) );

		var $messageUnit = $('<div class="message-unit">')
			.attr({
				'data-message-id': message.id
			})
		;

		var userMessage = 'stickies の内容を "'+before+'" から "'+message.content.val + '" に書き換えました。';
		if( !before.length && message.content.val.length ){
			userMessage = 'stickies に内容 "'+message.content.val + '" をセットしました。';
		}else if( before.length && !message.content.val.length ){
			userMessage = 'stickies の内容 "'+before + '" を削除しました。';
		}
		app.insertTimeline( $messageUnit
			.append( $('<div class="message-unit__owner">').text(message.owner) )
			.append( $('<div class="message-unit__content">').text(userMessage) )
			.append( $('<div class="message-unit__targetWidget">').append( app.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
		);

	}

	return;
}

},{}]},{},[1])