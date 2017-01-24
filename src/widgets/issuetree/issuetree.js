/**
 * widgets: issuetree.js
 */
module.exports = function( incense, $widget ){
	var _this = this;
	var $ = require('jquery');
	var mode = null;

	this.issue = '未設定';
	this.answer = '1. 賛成'+"\n"+'2. 反対';
	this.vote = {};
	this.status = 'open';
	this.commentCount = 0;

	_this.$widgetBody = $('<div class="issuetree issuetree--widget">')
		.append( $('<div class="row">')
			.append( $('<div class="col-sm-6">')
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( '問' ) )
					.append( $('<div class="issuetree__issue incense-markdown">').html( incense.detoxHtml( incense.markdown(this.issue) ) || 'no-set' ) )
				)
			)
			.append( $('<div class="col-sm-6">')
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( '答' ) )
					.append( $('<div class="issuetree__answer">').html( incense.detoxHtml( incense.markdown(_this.answer) ) || 'no-answer' ) )
				)
			)
		)
		.append( $('<div class="issuetree__comment-count">') )
	;
	_this.$detailBody = $('<div class="issuetree issuetree--modal">')
		.append( $('<div class="row">')
			.append( $('<div class="col-sm-6">')
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( '問' )
						.append( $('<a href="javascript:;" class="issuetree__edit-button" data-issuetree-btn-function="editIssue">')
							.text('編集')
						)
					)
					.append( $('<div class="issuetree__issue incense-markdown">').html( incense.detoxHtml( incense.markdown(this.issue) ) || 'no-set' ) )
				)
			)
			.append( $('<div class="col-sm-6">')
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( '答' )
						.append( $('<a href="javascript:;" class="issuetree__edit-button" data-issuetree-btn-function="editAnswer">')
							.text('編集')
						)
					)
					.append( $('<div class="issuetree__answer incense-markdown">').html( incense.detoxHtml( incense.markdown(this.answer) ) || 'no-answer' ) )
				)
			)
		)
		.append( $('<div class="row">')
			.append( $('<div class="col-md-8">')
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( 'ディスカッション' ) )
					.append( $('<div class="issuetree__discussion-timeline">')
						.append( $('<div class="issuetree__discussion-timeline--timeline">') )
						.append( $('<div class="issuetree__discussion-timeline--form">')
							.append( $('<div class="issuetree__discussion-timeline--stance">')
								.append( $('<span>')
									.text('あなたの現在の立場 : ')
								)
								.append( $('<select style="max-width: 100%;">') )
							)
							.append( $('<div class="issuetree__discussion-timeline--form__inputform">')
								.append( $('<textarea class="form-control issuetree__discussion-timeline--chat-comment">') )
								.append( $('<button class="btn btn-primary">send</button>') )
							)
						)
					)
				)
			)
			.append( $('<div class="col-md-4">')
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( 'ステータス' ) )
					.append( $('<div class="issuetree__status">') )
				)
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( '親課題' ) )
					.append( $('<div class="issuetree__parent-issue">') )
				)
				.append( $('<div class="issuetree__block">')
					.append( $('<div class="issuetree__heading">').text( '子課題' ) )
					.append( $('<button class="btn btn-default issuetree__create-child-button">')
						.text('新しい子課題を作成')
					)
					.append( $('<div class="issuetree__sub-issues">') )
				)
			)
		)
	;
	_this.$detailBodyTimeline = _this.$detailBody.find('.issuetree__discussion-timeline--timeline');
	_this.$yourStanceSelector = _this.$detailBody.find('.issuetree__discussion-timeline--stance select');

	/**
	 * テキストエリアでの編集内容を反映する
	 */
	function applyTextareaEditContent( $textarea, targetType ){
		if(mode != 'edit'){return;}
		mode = null;
		if( _this[targetType] == $textarea.val() ){
			// 変更なし
			$textarea.val('').remove();
			return;
		}

		incense.sendMessage(
			{
				'content': JSON.stringify({
					'command': 'update_' + targetType,
					'val': $textarea.val()
				}),
				'contentType': 'application/x-passiflora-widget-message',
				'targetWidget': $widget.attr('data-widget-id')
			},
			function(){
				console.log('issuetree change submited.');
			}
		);
		$textarea.val('').remove();
	}

	_this.$detailBodyIssue = _this.$detailBody.find('.issuetree__issue')
		.css({
			'position': 'relative',
			'top': 0,
			'left': 0,
			'width': '100%'
		})
	;
	_this.$detailBodyIssue_textarea = $('<textarea>')
		.css({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'width': '100%',
			'height': '100%'
		})
	;

	_this.$detailBodyAnswer = _this.$detailBody.find('.issuetree__answer')
		.css({
			'position': 'relative',
			'top': 0,
			'left': 0,
			'width': '100%'
		})
	;
	_this.$detailBodyAnswer_textarea = $('<textarea>')
		.css({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'width': '100%',
			'height': '100%'
		})
	;

	_this.$detailBodyStatus = _this.$detailBody.find('.issuetree__status');
	_this.$detailBodyParentIssue = _this.$detailBody.find('.issuetree__parent-issue');
	_this.$detailBodySubIssues = _this.$detailBody.find('.issuetree__sub-issues');

	/**
	 * 詳細画面を開く
	 */
	function openDetailWindow(){
		incense.widgetDetailModal.open({
			'title': 'Issue #widget.'+_this.id,
			'body': _this.$detailBody
		}, function(){

			updateView();
			updateRelations();

			_this.$detailBody.find('.issuetree__edit-button')
				.show()
				.on('click', function(e){
					var method = $(this).attr('data-issuetree-btn-function');
					switch(method){
						case 'editIssue':
							editIssue();
							break;
						case 'editAnswer':
							editAnswer();
							break;
					}
				})
			;

			_this.$detailBodyIssue
				.on('dblclick', function(e){
					editIssue();
				})
				.on('click', function(e){
					e.stopPropagation();
				})
			;
			_this.$detailBodyAnswer
				.on('dblclick', function(e){
					editAnswer();
				})
				.on('click', function(e){
					e.stopPropagation();
				})
			;

			var submitFnc = function(value){
				function sendComment(value, stance, callback){
					callback = callback || function(){};
					incense.sendMessage(
						{
							'content': JSON.stringify({
								'command': 'comment',
								'comment': value,
								'stance': stance
							}),
							'contentType': 'application/x-passiflora-widget-message',
							'targetWidget': _this.id
						},
						function(){
							console.log('issuetree chat-comment submited.');
							callback();
						}
					);
				}

				var myAnswer = _this.vote[incense.getUserInfo().id];
				var newAnswer = _this.$yourStanceSelector.val();
				if( newAnswer.length && newAnswer != myAnswer ){
					sendVoteMessage(newAnswer, function(){
						sendComment(value, newAnswer);
					});
				}else{
					sendComment(value, (myAnswer || ''));
				}
			}
			incense.setBehaviorChatComment(
				_this.$detailBody.find('.issuetree__discussion-timeline--form__inputform textarea.issuetree__discussion-timeline--chat-comment'),
				{
					'submit': function(value){
						submitFnc(value);
					}
				}
			);
			_this.$detailBody.find('.issuetree__discussion-timeline--form__inputform button')
				.on('click', function(e){
					var $textarea = _this.$detailBody.find('.issuetree__discussion-timeline--form__inputform textarea.issuetree__discussion-timeline--chat-comment');
					var value = $textarea.val();
					if( !value ){
						return;
					}
					$textarea.val('');
					submitFnc( value );
				})
			;

			_this.$detailBody.find('.issuetree__create-child-button')
				.on('click', function(e){
					incense.sendMessage(
						{
							'contentType': 'application/x-passiflora-command',
							'content': JSON.stringify({
								'operation':'createWidget',
								'widgetType': _this.widgetType,
								'x': incense.$fieldOuter.scrollLeft() + $widget.offset().left + $widget.outerWidth() + 10,
								'y': incense.$fieldOuter.scrollTop() + $widget.offset().top + 10,
								'parent': _this.id
							})
						} ,
						function(rtn){
							// console.log(rtn);
							incense.sendMessage(
								{
									'content': JSON.stringify({
										'command': 'update_relations'
									}),
									'contentType': 'application/x-passiflora-widget-message',
									'targetWidget': _this.id
								},
								function(){
									console.log('issuetree: update relations.');
								}
							);
						}
					);
				})
			;

			setTimeout(function(){
				incense.adjustTimelineScrolling( _this.$detailBodyTimeline );
			}, 200);
		});
	} // openDetailWindow()

	$widget
		.on('dblclick', function(){
			openDetailWindow();
		})
		.append( _this.$widgetBody
			.append( $('<div>')
				.append( $('<a>')
					.text('OPEN')
					.attr({'href':'javascript:;'})
					.on('click', function(){
						openDetailWindow();
					})
				)
			)
		)
	;

	/**
	 * 問を編集する
	 */
	function editIssue(){
		mode = 'edit';
		_this.$detailBodyIssue.append( _this.$detailBodyIssue_textarea.val( _this.issue ) );
		_this.$detailBody.find('.issuetree__edit-button').hide();
		incense.setBehaviorChatComment(
			_this.$detailBodyIssue_textarea,
			{
				'submit': function(value){
					applyTextareaEditContent( _this.$detailBodyIssue_textarea, 'issue' );
					_this.$detailBody.find('.issuetree__edit-button').show();
					setTimeout(function(){editAnswer();}, 100);
				}
			}
		);
		_this.$detailBodyIssue_textarea
			.on('change blur', function(e){
				applyTextareaEditContent( _this.$detailBodyIssue_textarea, 'issue' );
				_this.$detailBody.find('.issuetree__edit-button').show();
				setTimeout(function(){editAnswer();}, 100);
			})
		;
		_this.$detailBodyIssue_textarea.focus();
	}

	/**
	 * 答を編集する
	 */
	function editAnswer(){
		mode = 'edit';
		_this.$detailBodyAnswer.append( _this.$detailBodyAnswer_textarea.val( _this.answer ) );
		_this.$detailBody.find('.issuetree__edit-button').hide();
		incense.setBehaviorChatComment(
			_this.$detailBodyAnswer_textarea,
			{
				'submit': function(value){
					applyTextareaEditContent( _this.$detailBodyAnswer_textarea, 'answer' );
					_this.$detailBody.find('.issuetree__edit-button').show();
				}
			}
		);
		_this.$detailBodyAnswer_textarea
			.on('change blur', function(e){
				applyTextareaEditContent( _this.$detailBodyAnswer_textarea, 'answer' );
				_this.$detailBody.find('.issuetree__edit-button').show();
			})
		;
		_this.$detailBodyAnswer_textarea.focus();
	}

	/**
	 * 表示を更新する
	 */
	function updateView(callback){
		callback = callback || function(){};
		var optionValueList = {};
		var myAnswer = _this.vote[incense.getUserInfo().id];
		_this.$detailBodyAnswer.html( incense.detoxHtml( incense.markdown(_this.answer) ) || 'no-answer' );
		_this.$detailBodyAnswer.find('ol>li').each(function(){
			var $this = $(this);
			var optionValue = $this.html()+'';
			optionValueList[optionValue] = {
				'value': optionValue,
				'voteUsers': []
			};
			$this
				.attr({
					'data-passiflora-vote-option': optionValue
				})
				.css({
					'border': '1px solid #ddd',
					'padding': '0.5em 1em',
					'font-weight': ( optionValue==myAnswer ? 'bold' : 'normal' ),
					'background-color': ( optionValue==myAnswer ? '#f0f0f0' : '#f9f9f9' ),
					'list-style-position': 'inside',
					'cursor': 'pointer'
				})
			;

			if( myAnswer != optionValue ){
				$this.append( $('<div>')
					.css({
						'text-align': 'right'
					})
					.append( $('<button class="btn btn-default">')
						.text('vote')
						.attr({
							'data-passiflora-vote-option': optionValue
						})
						.unbind('click')
						.bind('click', function(e){
							var $this = $(this);
							if( $this.attr('data-passiflora-vote-option') == _this.vote[incense.getUserInfo().id] ){
								return false;
							}
							sendVoteMessage($this.attr('data-passiflora-vote-option'));
							return false;
						})
					)
				);
			}

			var $voteUserList = $('<ul class="issuetree__voteuser">')
			for( var userName in _this.vote ){
				// console.log(optionValue);
				if( _this.vote[userName] == optionValue ){
					var $li = $('<li>');
					$voteUserList.append( $li
						.text(userName)
					);
					// console.log( userName, incense.getUserInfo().id );
					if( userName == incense.getUserInfo().id ){
						$li.addClass('issuetree__voteuser--me');
					}
					optionValueList[optionValue].voteUsers.push( incense.getUserInfo().id );
				}
			}
			if( $voteUserList.find('>li').size() ){
				$this.append( $voteUserList );
			}
		});

		var $widgetAnser = $widget.find('.issuetree__answer');
		var maxAnswer = null;
		var maxVoteCount = 0;
		var maxAnswerCount = 0;
		var otherVoteCount = 0;
		for( var idx in optionValueList ){
			if(maxAnswer === null){
				maxAnswer = optionValueList[idx];
				maxVoteCount = optionValueList[idx].voteUsers.length;
				continue;
			}
			if(optionValueList[idx].voteUsers.length > maxAnswer.voteUsers.length){
				maxAnswer = optionValueList[idx];
				maxVoteCount = optionValueList[idx].voteUsers.length;
				continue;
			}
		}

		if( maxVoteCount > 0 ){
			var $answerList = $('<ul>');
			for( var idx in optionValueList ){
				if(optionValueList[idx].voteUsers.length == maxVoteCount){
					$answerList.append( $('<li>')
						.text( optionValueList[idx].value + ' : ' + optionValueList[idx].voteUsers.length + '票' )
					);
					maxAnswerCount ++;
				}else{
					otherVoteCount += optionValueList[idx].voteUsers.length;
				}
			}
			if( otherVoteCount ){
				$answerList.append( $('<li>')
				.text( 'その他 : ' + otherVoteCount + '票' )
			);
			}

			$widgetAnser
				.html('')
				.append( $answerList )
			;
		}else{
			$widgetAnser.html( incense.detoxHtml( incense.markdown(_this.answer) ) || 'no-answer' );
		}

		_this.$widgetBody
			.removeClass('issuetree--status-active')
			.removeClass('issuetree--status-fixed')
		;
		_this.$detailBody
			.removeClass('issuetree--status-active')
			.removeClass('issuetree--status-fixed')
		;
		if( _this.status == 'close' ){
			_this.$widgetBody.addClass('issuetree--status-fixed');
			_this.$detailBody.addClass('issuetree--status-fixed');
		}else{
			if( _this.commentCount >= 1 ){
				_this.$widgetBody.addClass('issuetree--status-active');
				_this.$detailBody.addClass('issuetree--status-active');
			}
		}

		_this.$yourStanceSelector.html('');
		if( !myAnswer ){
			_this.$yourStanceSelector.append( '<option value="">選択してください</option>' );
		}
		var selected = false;
		for( var idx in optionValueList ){
			var $option = $('<option>');
			$option
				.text(idx)
				.attr({
					'value': idx
				})
			;
			if( idx == myAnswer ){
				selected = true;
				$option.attr({
					'selected': true
				});
			}
			_this.$yourStanceSelector.append($option);
		}
		if( myAnswer && !selected ){
			// すでに立場を表明済みだが、選択した選択肢がなくなっている場合
			_this.$yourStanceSelector.append( $('<option>')
				.attr({
					'selected': true
				})
				.text(myAnswer)
			);
		}

		// updateStatus --------
		_this.$detailBodyStatus
			.html('')
			.append(
				$('<p>').text( (_this.status=='open' ? 'Opened' : 'Closed') )
			)
			.append(
				$('<p>').append( $('<button class="btn btn-default">')
					.text( (_this.status=='open' ? 'close' : 'reopen') )
					.attr({
						'data-issuetree-status-to': (_this.status=='open' ? 'close' : 'open')
					})
					.on('click', function(e){
						var $this = $(this);
						var statusTo = $this.attr('data-issuetree-status-to');
						incense.sendMessage(
							{
								'content': JSON.stringify({
									'command': 'changeStatusTo',
									'option': statusTo
								}),
								'contentType': 'application/x-passiflora-widget-message',
								'targetWidget': _this.id
							},
							function(){
								console.log('issuetree changing status to "'+statusTo+'" submited.');
								callback();
							}
						);
						return false;
					})
				)
			)
		;

	} // updateView()

	/**
	 * 投票操作のメッセージを送信する
	 */
	function sendVoteMessage(vote, callback){
		callback = callback || function(){};
		incense.sendMessage(
			{
				'content': JSON.stringify({
					'command': 'vote',
					'option': vote
				}),
				'contentType': 'application/x-passiflora-widget-message',
				'targetWidget': _this.id
			},
			function(){
				console.log('issuetree vote submited.');
				callback();
			}
		);
	} // sendVoteMessage()

	/**
	 * 親子関係欄を更新する
	 */
	function updateRelations(){
		_this.$detailBodyParentIssue.html('---');
		if( _this.parent && incense.widgetMgr.get(_this.parent) ){
			var $link = incense.widgetMgr.mkLinkToWidget( _this.parent );
			_this.$detailBodyParentIssue.html('')
				.append( $link
					.html('')
					.addClass('issuetree__issue-unit')
					.append( $('<div>').text(incense.widgetMgr.get(_this.parent).issue) )
					.append( $('<div class="issuetree__issue-unit--widget-id">').append( '#widget.'+_this.parent ) )
				)
			;
		}

		incense.widgetMgr.getChildren( _this.id, function(children){
			_this.$detailBodySubIssues.html('---');
			if( children.length ){
				_this.$detailBodySubIssues.html('');
				var $ul = $('<ul>');
				for( var idx in children ){
					var $li = $('<li>')
						.append( incense.widgetMgr.mkLinkToWidget( children[idx].id )
							.html('')
							.addClass('issuetree__issue-unit')
							.append( $('<div>').text(children[idx].issue) )
							.append( $('<div class="issuetree__issue-unit--widget-id">').append( '#widget.'+children[idx].id ) )
						)
					;
					$ul.append( $li );
				}
				_this.$detailBodySubIssues.append( $ul );
			}
		} );
		return;
	} // updateRelations()

	/**
	 * widget の内容を端的に説明するテキストを取得する
	 */
	this.getSummary = function(){
		var issue = incense.detoxHtml( incense.markdown(this.issue) );
		var answer = incense.detoxHtml( incense.markdown(this.answer) );
		var rtn = '問: ' + $(issue).text() + ' - 答: ' + $(answer).text();
		return rtn;
	}

	/**
	 * widget への配信メッセージを受信
	 */
	this.onMessage = function(message){
		// console.log(message);
		// var before = this.value;
		// this.value = message.content.val;
		// _this.$widgetBody.html( marked( _this.value ) );

		var $messageUnit = $('<div>');
		var user = incense.userMgr.get(message.owner);

		function mkTimelineElement( $messageContent ){
			var $rtn = $('<div class="incense__message-unit">');
			if( user.id == incense.getUserInfo().id ){
				$rtn.addClass('incense__message-unit--myitem');
			}
			$userIcon = $('<div class="incense__message-unit__owner-icon">');
			if( user.icon ){
				$userIcon
					.append( $('<img>')
						.attr({
							'src': user.icon
						})
						.css({
							'width': 30,
							'height': 30
						})
					)
				;
			}
			$rtn
				.append( $userIcon )
				.append( $('<div class="incense__message-unit__message-body">')
					.append( $('<div class="incense__message-unit__owner">')
						.append( $('<span class="incense__message-unit__owner-name">').text(user.name) )
						.append( $('<span class="incense__message-unit__owner-id">').text(user.id) )
					)
					.append( $messageContent )
				)
			;
			return $rtn;
		}

		switch( message.content.command ){
			case 'comment':
				// コメントの投稿
				userMessage = incense.detoxHtml( incense.markdown( message.content.comment ) );
				this.commentCount ++;
				updateView();

				var totalCommentCount = _this.$detailBodyTimeline.find('>div').size();
				_this.$widgetBody.find('.issuetree__comment-count').text( (this.commentCount) + '件のコメント' );

				// 詳細画面のディスカッションに追加
				_this.$detailBodyTimeline.append( mkTimelineElement(
					$('<div class="incense__message-unit__content incense-markdown">').html(userMessage)
				) );
				// 	.addClass( user.id == incense.getUserInfo().id ? 'issuetree--myitem' : '' )
				incense.adjustTimelineScrolling( _this.$detailBodyTimeline );

				// メインチャットに追加
				incense.insertTimeline( message, $messageUnit
					.append( $('<div class="incense__message-unit__content incense-markdown">').html(userMessage) )
					// .append( $('<div class="incense__message-unit__targetWidget">').append( incense.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
				);
				break;

			case 'update_issue':
				// 問の更新
				_this.issue = message.content.val;
				_this.$detailBodyIssue.html( incense.detoxHtml( incense.markdown(_this.issue) ) || 'no-set' );
				$widget.find('.issuetree__issue').html( incense.detoxHtml( incense.markdown(_this.issue) ) || 'no-set' );

				// 詳細画面のディスカッションに追加
				_this.$detailBodyTimeline.append( mkTimelineElement(
					$('<div class="incense__message-unit__operation">').html(message.owner + ' が、問を "' + _this.issue + '" に変更しました。')
				) );
				incense.adjustTimelineScrolling( _this.$detailBodyTimeline );

				// メインチャットに追加
				incense.insertTimeline( message, $messageUnit
					.append( $('<div class="incense__message-unit__operation">').html('問を "' + _this.issue + '" に変更しました。') )
					// .append( $('<div class="incense__message-unit__targetWidget">').append( incense.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
				);
				break;

			case 'update_answer':
				// 答の更新
				_this.answer = message.content.val;
				updateView();

				// 詳細画面のディスカッションに追加
				_this.$detailBodyTimeline.append( mkTimelineElement(
					$('<div class="incense__message-unit__operation">').html(message.owner + ' が、答を "' + _this.answer + '" に変更しました。')
				) );
				incense.adjustTimelineScrolling( _this.$detailBodyTimeline );

				// メインチャットに追加
				incense.insertTimeline( message, $messageUnit
					.append( $('<div class="incense__message-unit__operation">').html('答を "' + _this.answer + '" に変更しました。') )
					// .append( $('<div class="incense__message-unit__targetWidget">').append( incense.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
				);
				break;

			case 'changeStatusTo':
				// console.log(message.content);
				_this.status = message.content.option;
				updateView();

				var timelineMessage = user.name + ' は、問を' + (_this.status=='open'?'再び開きました':'完了しました') + '。';

				// 詳細画面のディスカッションに追加
				_this.$detailBodyTimeline.append( mkTimelineElement(
					$('<div class="incense__message-unit__operation">').text( timelineMessage )
				) );
				incense.adjustTimelineScrolling( _this.$detailBodyTimeline );

				// メインチャットに追加
				incense.insertTimeline( message, $messageUnit
					.append( $('<div class="incense__message-unit__operation">').text( timelineMessage ) )
					// .append( $('<div class="incense__message-unit__targetWidget">').append( incense.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
				);
				break;

			case 'vote':
				// 投票更新
				_this.vote[message.owner] = message.content.option;
				updateView();

				// 詳細画面のディスカッションに追加
				_this.$detailBodyTimeline.append( mkTimelineElement(
					$('<div class="incense__message-unit__operation">').text(user.name + ' が、 "' + message.content.option + '" に投票しました。')
				) );
				incense.adjustTimelineScrolling( _this.$detailBodyTimeline );

				// メインチャットに追加
				incense.insertTimeline( message, $messageUnit
					.append( $('<div class="incense__message-unit__operation">').text(message.owner + ' が、 "' + message.content.option + '" に投票しました。') )
					// .append( $('<div class="incense__message-unit__targetWidget">').append( incense.widgetMgr.mkLinkToWidget( message.targetWidget ) ) )
				);
				break;

			case 'update_relations':
				// 親子関係の表示を更新する
				updateRelations();
				break;

		}

		return;
	} // onMessage()

	/**
	 * widget へフォーカスした時の反応
	 */
	this.focus = function(){
		openDetailWindow();
	}

	return;
}
