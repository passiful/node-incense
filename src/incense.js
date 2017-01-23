window.Incense = function(){
	// app "board"
	var _this = this;
	var incense = this;
	var $ = require('jquery');
	var Promise = require('es6-promise').Promise;
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var twig = require('twig');
	var biflora,
		userInfo = {
			'id': '',
			'name': ''
		};
	var $timeline,
		$timelineList,
		$timelineForm,
		$field,
		$fieldContextMenu,
		$fieldSelection,
		$fieldRelations,
		$fieldOuter,
		$fieldInner;
	var boardId;
	var zoomRate = 1;

	/**
	 * 初期化
	 */
	this.init = function(options, callback){
		console.log('incense: initialize...');
		callback = callback || function(){};
		options = options || {};
		userInfo = options.userInfo;

		this.widgetsMaxZIndex = 1000;

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// BoardID を取得
				boardId = options.boardId;
				console.log('boardId = '+boardId);

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// DOM Setup
				console.log('incense: DOM Setup...');

				$timeline = $(options.elmTimeline);
				$timeline
					.addClass('incense')
					.addClass('incense__timeline')
					.html(
						'<div class="incense__timeline_list"></div>'+
						'<div class="incense__timeline_form"><textarea class="form-control board__main-chat-comment"></textarea></div>'
					)
				;
				$timelineList = $timeline.find('.incense__timeline_list');
				$timelineForm = $timeline.find('.incense__timeline_form');

				$field = $(options.elmBoard);
				$field
					.addClass('incense')
					.addClass('incense__board')
					.html(
						'<div class="incense__board-outer">'+
							'<div class="incense__board-contextmenu"></div>'+
							'<div class="incense__board-selection"></div>'+
							'<div class="incense__board-inner"></div>'+
							'<div class="incense__board-relations"></div>'+
						'</div>'
					)
					.on('click', function(e){
						_this.widgetMgr.unselect();
					})
				;
				$fieldContextMenu = $field.find('.incense__board-contextmenu');
				$fieldSelection = $field.find('.incense__board-selection');
				$fieldRelations = $field.find('.incense__board-relations');
				$fieldOuter = $field.find('.incense__board-outer');
				$fieldInner = $field.find('.incense__board-inner');

				_this.$field = $field;
				_this.$fieldInner = $fieldInner;
				$fieldRelations.append( $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 10000 10000">') );


				// functions Setup
				_this.fieldContextMenu = new (require('./libs/_fieldContextMenu.js'))(_this, $fieldContextMenu);
				_this.messageOperator = new (require('./libs/_messageOperator.js'))(_this, $timelineList, $fieldInner);
				_this.widgetBase = require('./libs/_widgetBase.js');
				_this.widgetMgr = new (require('./libs/_widgetMgr.js'))(_this, $timelineList, $field, $fieldOuter, $fieldInner, $fieldSelection);
				_this.modal = new (require('./libs/_modal.js'))($field);
				_this.widgetDetailModal = new (require('./libs/_widgetDetailModal.js'))($field);
				_this.userMgr = new (require('./libs/_userMgr.js'))(_this, $timelineList, $field, $fieldInner);
				_this.locker = new (require('./libs/_locker.js'))(_this);


				_this.widgetList = {
					'stickies': {
						'name': 'Stickies',
						'api': require('./widgets/stickies/stickies.js')
					},
					'issuetree': {
						'name': 'Issue Tree',
						'api': require('./widgets/issuetree/issuetree.js')
					}
				};

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// init biflora framework
				console.log('incense: initializing biflora framework...');
				biflora = _this.biflora = window.biflora
					.createSocket(
						_this,
						io,
						{
							'receiveBroadcast': require('./apis/_receiveBroadcast.js'),
							'locker': require('./apis/_locker.js')
						}
					)
				;
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// (biflora 送信テスト)
				console.log('incense: biflora test...');
				biflora.send(
					'ping',
					{} ,
					function(rtn){
						console.log(rtn);
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// boardId ルームに参加する
				console.log('incense: join to room: '+boardId);
				biflora.joinRoom(
					boardId,
					1,
					function(rtn){
						console.log(rtn);
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// ログインユーザー自身の情報を取得する
				console.log('incense: getting myself');
				biflora.send(
					'getMySelf',
					userInfo,
					function(_userInfo){
						// console.log(_userInfo);
						if( !_userInfo ){
							console.error('ERROR: failed to getting login userinfo:', _userInfo);
						}
						userInfo = _userInfo;
						rlv();
						return;
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// boardId のこれまでのメッセージを取得する
				console.log('incense: getting messages: '+boardId);
				biflora.send(
					'getMessageList',
					{'boardId': boardId},
					function(rtn){
						console.log(rtn);
						it79.ary(
							rtn.rows,
							function(it1, row1, idx1){
								_this.messageOperator.exec(row1);
								it1.next();
							},
							function(){
								rlv();
							}
						);
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// キーボードイベントセット
				console.log('incense: setting Keyboard events...');

				_this.setBehaviorChatComment(
					$timelineForm.find('textarea.board__main-chat-comment'),
					{
						'submit': function(value){
							var msg = {
								'content': value,
								'contentType': 'text/markdown'
							};
							_this.sendMessage(
								msg,
								function(rtn){
									console.log('Your message was sent.');
								}
							);

						}
					}
				);

				require('./libs/_keypress.js')(_this, function(){

				});

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// フィールドのイベントセット
				console.log('incense: setting board events...');
				var mkWidget = function(e){
					// console.log(e);
					_this.fieldContextMenu.open(
						{'x':e.offsetX, 'y':e.offsetY},
						(function(){
							var rtn = [];
							var widgets = _this.widgetList;
							for( var widgetName in widgets ){
								var menu = {};
								menu.label = widgets[widgetName].name;
								menu.data = {
									'widget-name': widgetName,
									'x': e.offsetX,
									'y': e.offsetY
								};
								menu.action = function(data){
									// console.log(data);
									var widgetName = data['widget-name'];
									incense.sendMessage(
										{
											'contentType': 'application/x-passiflora-command',
											'content': JSON.stringify({
												'operation':'createWidget',
												'widgetType': widgetName,
												'x': data.x,
												'y': data.y
											})
										} ,
										function(result){
											console.log(result);
										}
									);
								}
								rtn.push(menu);
							}
							return rtn;
						})()
					);
					e.preventDefault();
				};
				$fieldInner
					.bind('dblclick', mkWidget)
					.bind('contextmenu', mkWidget)
					.bind('dragover', function(e){
						e.stopPropagation();
						e.preventDefault();
						// console.log(e);
					})
					.bind('dragleave', function(e){
						e.stopPropagation();
						e.preventDefault();
						// console.log(e);
					})
					.bind('drop', function(e){
						e.stopPropagation();
						e.preventDefault();
						// console.log(e);
						var event = e.originalEvent;
						var method = event.dataTransfer.getData("method");
						switch(method){
							case 'moveWidget':
								var targetWidgetId = event.dataTransfer.getData("widget-id");
								var fromOffsetX = Number(event.dataTransfer.getData("offset-x"));
								var fromOffsetY = Number(event.dataTransfer.getData("offset-y"));
								var fromPageX = Number(event.dataTransfer.getData("page-x"));
								var fromPageY = Number(event.dataTransfer.getData("page-y"));

								var targetWidget = _this.widgetMgr.get(targetWidgetId);
								var beforeOffsetX = Number(targetWidget.$.attr('data-offset-x'));
								var beforeOffsetY = Number(targetWidget.$.attr('data-offset-y'));

								var toX = beforeOffsetX + (e.pageX - fromPageX)*(1/incense.getZoomRate());
								if( toX < 0 ){ toX = 0; }
								var toY = beforeOffsetY + (e.pageY - fromPageY)*(1/incense.getZoomRate());
								if( toY < 0 ){ toY = 0; }

								_this.sendMessage(
									{
										'contentType': 'application/x-passiflora-command',
										'content': JSON.stringify({
											'operation': method,
											'targetWidgetId': targetWidgetId,
											'moveToX': toX,
											'moveToY': toY
										})
									},
									function(rtn){
										console.log('command moveWidget was sent.');
									}
								);
								break;
						}
					})
				;

				$('body').on('click', function(){
					_this.fieldContextMenu.close();
					window.location.hash = '';

				});

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// ログインする
				console.log('incense: input your profile:');
				_this.sendMessage(
					{
						'content': JSON.stringify({
							'userInfo': userInfo,
							'operation': 'userLogin'
						}),
						'contentType': 'application/x-passiflora-command'
					},
					function(rtn){
						// console.log(rtn);
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				console.log('incense: setting on window resize event handler...');
				windowResized();
				$(window).on('resize', function(){
					windowResized();
				});
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				console.log('incense: setting on window hash change event handler...');
				var hash = window.location.hash;
				console.log(hash);
				if( hash.match( /^\#widget\.([0-9]+)$/ ) ){
					var widgetId = RegExp.$1;
					setTimeout(function(){
						_this.widgetMgr.unselect();
						_this.widgetMgr.select(widgetId);
						_this.widgetMgr.focus(widgetId);
					}, 1000);
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// 返却
				console.log('standby.');
				callback();
				rlv();
			}); })
		;

		return;
	}

	/**
	 * Window Resized
	 */
	function windowResized(callback){
		callback = callback || function(){};

		$timelineList.css({
			'height': $timeline.outerHeight() - $timelineForm.outerHeight()
		});

		_this.updateRelations();
		_this.widgetMgr.updateSelection();

		callback();
		return;
	}

	/**
	 * チャットコメントフォームを作成
	 */
	this.setBehaviorChatComment = function($textarea, callbacks){
		callbacks = callbacks || {};
		callbacks.submit = callbacks.submit || function(){};
		$textarea = $($textarea);
		$textarea.keypress(function(e){
			// console.log(e);
			if( e.which == 13 ){
				// alert('enter');
				var $this = $(e.target);
				if( e.shiftKey ){
					// SHIFTキーを押しながらなら、送信せず改行する
					return true;
				}
				if(!$this.val().length){
					// 中身が空っぽなら送信しない
					return false;
				}
				var fixedValue = $this.val();
				callbacks.submit( fixedValue );
				$this.val('').focus();
				return false;
			}
			return;
		});
		$textarea.on('dblclick', function(e){
			e.stopPropagation();
		});
		return $textarea;
	} // setBehaviorChatComment()

	/**
	 * メインタイムラインにメッセージを表示する
	 */
	this.insertTimeline = function( message, $messageContent ){
		$messageContent = $messageContent || $('<div>');
		var $message = $('<div>')
			.addClass('incense__message-unit')
			.attr({
				'data-message-id': message.id,
				'data-message-owner': message.owner
			})
		;
		if( userInfo.id == message.owner ){
			$message
				.addClass('incense__message-unit--myitem')
			;
		}
		// console.log( this.userMgr.getAll() );
		var ownerInfo = this.userMgr.get(message.owner);
		$userIcon = $('<div class="incense__message-unit__owner-icon">');
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
		$message
			.append( $userIcon )
			.append( $('<div class="incense__message-unit__message-body">')
				.append( $('<div class="incense__message-unit__owner">')
					.attr({'title': new Date(message.microtime)})
					.append( $('<span class="incense__message-unit__owner-name">').text(ownerInfo.name) )
					.append( $('<span class="incense__message-unit__owner-id">').text(ownerInfo.id) )
				)
				.append( $messageContent )
			)
		;

		$timelineList.append( $message );

		this.adjustTimelineScrolling($timelineList);

		return;
	}

	/**
	 * タイムラインのスクロール位置をあわせる
	 */
	this.adjustTimelineScrolling = function( $timeline ){
		var scrTop = $timeline.scrollTop();
		var oH = $timeline.outerHeight();
		var iH = $timeline.get(0).scrollHeight;
		$timeline.scrollTop(iH-oH);
		// console.log(scrTop, oH, iH);

		return;
	}

	/**
	 * Markdown 変換する
	 */
	this.markdown = require('./libs/_markdown.js');

	/**
	 * 投稿されたHTMLを無害化する
	 */
	this.detoxHtml = require('./libs/_detoxHtml.js');

	/**
	 * ログインユーザー情報を取得
	 */
	this.getUserInfo = function(){
		return userInfo;
	}

	/**
	 * ボードIDを取得
	 */
	this.getBoardId = function(){
		return boardId;
	}

	/**
	 * ウィジェットの一覧を取得する
	 */
	this.getWidgetList = function( callback ){
		_this.widgetMgr.getList(function(widgetList){
			callback( widgetList );
		});
		return;
	}

	/**
	 * ボードの拡大率を設定する
	 */
	this.zoom = function( rateTo ){
		var scrollInfo = {
			"width": $fieldOuter.width(),
			"height": $fieldOuter.height(),
			"scrollTop": $fieldOuter.scrollTop(),
			"scrollLeft": $fieldOuter.scrollLeft()
		};
		var currentRate = (1/zoomRate);
		var center = {
			"top": (scrollInfo.scrollTop + (scrollInfo.height/2)) * (1/zoomRate),
			"left": (scrollInfo.scrollLeft + (scrollInfo.width/2)) * (1/zoomRate)
		};

		zoomRate = rateTo;
		$fieldOuter.find('>div').css({
			'transform': 'scale('+zoomRate+','+zoomRate+')',
			'transform-origin': '0 0'
		});
		$fieldOuter.animate({
			'scrollTop': (center.top * zoomRate) - (scrollInfo.height/2),
			'scrollLeft': (center.left * zoomRate) - (scrollInfo.width/2)
		}, { 'duration': 200, 'easing': 'linear' });
	}

	/**
	 * ボードの拡大率を取得する
	 */
	this.getZoomRate = function(){
		return zoomRate;
	}

	/**
	 * 親子関係の表現を更新する
	 */
	this.updateRelations = function( callback ){
		callback = callback || function(){};
		// <path stroke="black" stroke-width="2" fill="none" d="M120,170 180,170 150,230z" />

		function getCenterOfGravity($elm){
			// console.log($elm.position().left, $elm.outerWidth());
			// console.log(($elm.position().left*(1/zoomRate)), $elm.outerWidth());
			var toX = 0 + ($elm.position().left*(1/zoomRate)) + $elm.outerWidth()/2;
			if( toX < 0 ){ toX = 0; }
			var toY = 0 + ($elm.position().top*(1/zoomRate)) + $elm.outerHeight()/2;
			if( toY < 0 ){ toY = 0; }
			return {'x':toX, 'y':toY};
		}

		var $svg = $fieldRelations.find('>svg');
		$svg.html('');
		var widgets = this.widgetMgr.getAll();
		for( var idx in widgets ){
			if( !widgets[idx].parent ){ continue; }
			var d = '';
			var parentWidget = _this.widgetMgr.get(widgets[idx].parent);
			if(parentWidget){
				var me = getCenterOfGravity(widgets[idx].$);
				var parent = getCenterOfGravity(parentWidget.$);
				$svg.get(0).innerHTML += '<path stroke="#333" stroke-width="3" fill="none" d="M'+me.x+','+me.y+' L'+parent.x+','+parent.y+'" style="opacity: 0.2;" />';
			}
		}

		callback();
		return;
	}

	/**
	 * メッセージを送信する
	 */
	this.sendMessage = function(msg, callback){
		callback = callback || function(){};
		if(typeof(msg) !== typeof({}) && msg === null){
			callback(false);
			return;
		}
		msg.boardId = boardId;
		msg.owner = userInfo.id;

		biflora.send(
			'message',
			msg,
			function(rtn){
				callback(rtn);
			}
		);
		return;
	}

};
