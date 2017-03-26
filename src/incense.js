/**
 * passiful/node-incense
 */
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
	var apiUrl;

	/**
	 * 初期化
	 */
	this.init = function(options, callback){
		console.log('incense: initialize...');
		callback = callback || function(){};
		options = options || {};
		userInfo = options.userInfo;
		apiUrl = options.apiUrl;

		this.widgetsMaxZIndex = 1000;

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// BoardID を取得
				boardId = options.boardId;
				console.log('boardId = '+boardId);

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
				// DOM Setup
				console.log('incense: DOM Setup...');

				$timeline = $(options.elmTimeline);
				$timeline
					.addClass('incense')
					.addClass('incense__timeline')
					.html(
						'<div class="incense__timeline_list"></div>'+
						'<div class="incense__timeline_form">'+
						'<textarea class="form-control incense__board__main-chat-comment"></textarea>'+
						'<button class="btn btn-primary">send</button>'+
						'</div>'
					)
					.on('dragover dragleave drop', function(e){
						e.stopPropagation();
						e.preventDefault();
					})
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
					.on('dragover dragleave drop', function(e){
						e.stopPropagation();
						e.preventDefault();
					})
				;
				$fieldContextMenu = $field.find('.incense__board-contextmenu');
				$fieldSelection = $field.find('.incense__board-selection');
				$fieldRelations = $field.find('.incense__board-relations');
				$fieldOuter = $field.find('.incense__board-outer');
				$fieldInner = $field.find('.incense__board-inner');

				_this.$field = $field;
				_this.$fieldOuter = $fieldOuter;
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
				_this.updateRelations = require( './libs/_updateRelations.js' )(_this, $fieldRelations);
				_this.setBehaviorChatComment = require('./libs/_setBehaviorChatComment.js')(_this);
				_this.insertTimeline = require('./libs/_insertTimeline.js')(_this, $timelineList);
				_this.markdown = require('./libs/_markdown.js')(_this);
				_this.detoxHtml = require('./libs/_detoxHtml.js')(_this);
				_this.lfm = new (require('./libs/_lfm.js'))(_this, biflora);


				_this.widgetList = {
					'stickies': {
						'name': 'Stickies',
						'api': require('./widgets/stickies/stickies.js')
					},
					'discussiontree': {
						'name': 'Discussion Tree',
						'api': require('./widgets/discussiontree/discussiontree.js')
					}
				};

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
				// ボードの中央へスクロール移動
				_this.scrollToBoardCenter(function(){
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// boardId のこれまでのメッセージを取得する
				console.log('incense: getting messages: '+boardId);
				biflora.send(
					'getMessageList',
					{'boardId': boardId},
					function(rtn){
						// console.log(rtn);
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

				var submitFnc = function( value ){
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
				_this.setBehaviorChatComment(
					$timelineForm.find('textarea.incense__board__main-chat-comment'),
					{
						'submit': function( value ){
							submitFnc( value );
						}
					}
				);
				$timelineForm.find('button')
					.on('click', function(e){
						var $textarea = $timelineForm.find('textarea.incense__board__main-chat-comment');
						var value = $textarea.val();
						if( !value ){
							return;
						}
						$textarea.val('');
						submitFnc( value );
					})
				;

				require('./libs/_keypress.js')(_this, function(){
				});

				rlv();

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// フィールドのイベントセット
				console.log('incense: setting board events...');
				var mkWidget = function(e){
					// console.log(e);
					var zoomRate = incense.getZoomRate();
					var position = {
						'x': ($fieldOuter.scrollLeft() + e.pageX)/zoomRate - $fieldOuter.offset().left/zoomRate,
						'y': ($fieldOuter.scrollTop() + e.pageY)/zoomRate - $fieldOuter.offset().top/zoomRate
					};
					_this.fieldContextMenu.open(
						position,
						(function(){
							var rtn = [];
							var widgets = _this.widgetList;
							for( var widgetName in widgets ){
								var menu = {};
								menu.label = widgets[widgetName].name;
								menu.data = {
									'widget-name': widgetName,
									'x': position.x,
									'y': position.y
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
	 * ファイルのURLを取得
	 */
	this.getFileUrl = function( fileId ){
		var rtn = apiUrl;
		rtn += '?boardId='+encodeURIComponent(boardId);
		rtn += '&fileId='+encodeURIComponent(fileId);
		return rtn;
	}

	/**
	 * ウィジェットの一覧を取得する
	 */
	this.getWidgetList = function( callback ){
		callback = callback||function(){};
		_this.widgetMgr.getList(function(widgetList){
			callback( widgetList );
		});
		return;
	}

	/**
	 * ボードの中央へスクロール
	 */
	this.scrollToBoardCenter = function( callback ){
		callback = callback||function(){};
		var zoomRate = this.getZoomRate();
		$fieldOuter.scrollTop( $fieldInner.height()/2*zoomRate - $fieldOuter.height()/2 );
		$fieldOuter.scrollLeft( $fieldInner.width()/2*zoomRate - $fieldOuter.width()/2 );
		callback();
		return;
	}

	/**
	 * ボードの拡大率を設定する
	 */
	this.zoom = function( rateTo ){
		_this.fieldContextMenu.close(); // コンテキストメニューを閉じる

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

	/**
	 * メッセージを削除する
	 */
	this.deleteMessage = function(messageId, callback){
		callback = callback || function(){};
		biflora.send(
			'deleteMessage',
			{
				'boardId': boardId,
				'messageId': messageId
			},
			function(rtn){
				callback(rtn);
			}
		);
		return;
	}

};
