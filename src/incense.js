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
		Keypress,
		userInfo = {
			'id': '',
			'name': ''
		};
	var $timeline,
		$timelineList,
		$timelineForm,
		$field,
		$fieldSelection,
		$fieldRelations,
		$fieldOuter,
		$fieldInner;
	var boardId;

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
							'<div class="incense__board-selection"></div>'+
							'<div class="incense__board-inner"></div>'+
							'<div class="incense__board-relations"></div>'+
						'</div>'
					)
					.on('click', function(e){
						_this.widgetMgr.unselect();
						return false;
					})
				;
				$fieldSelection = $field.find('.incense__board-selection');
				$fieldRelations = $field.find('.incense__board-relations');
				$fieldOuter = $field.find('.incense__board-outer');
				$fieldInner = $field.find('.incense__board-inner');

				_this.$field = $field;
				_this.$fieldInner = $fieldInner;
				$fieldRelations.append( $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 10000 10000">') );


				// functions Setup
				_this.fieldContextMenu = new (require('./libs/_fieldContextMenu.js'))(_this, $fieldInner);
				_this.messageOperator = new (require('./libs/_messageOperator.js'))(_this, $timelineList, $fieldInner);
				_this.widgetBase = require('./libs/_widgetBase.js');
				_this.widgetMgr = new (require('./libs/_widgetMgr.js'))(_this, $timelineList, $field, $fieldOuter, $fieldInner, $fieldSelection);
				_this.modal = new (require('./libs/_modal.js'))($field);
				_this.userMgr = new (require('./libs/_userMgr.js'))(_this, $timelineList, $field, $fieldInner);


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
							'receiveBroadcast': require('./apis/_receiveBroadcast.js')
						}
					)
				;
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				console.log('incense: setting on window resize event handler...');
				windowResized();
				$(window).resize(function(){
					windowResized();
				});
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

				if( !window.keypress ){
					console.error('incense: window.keypress is not exists.');
					rlv();
					return;
				}
				var cmdKeyName = (function(ua){
					// console.log(ua);
					var idxOf = ua.indexOf( 'Mac OS X' );
					if( idxOf >= 0 ){
						return 'cmd';
					}
					return 'ctrl';
				})(window.navigator.userAgent);
				// console.log(cmdKeyName);

				Keypress = new window.keypress.Listener();
				_this.Keypress = Keypress;
				Keypress.simple_combo("backspace", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
				});
				Keypress.simple_combo("delete", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
				});
				Keypress.simple_combo("escape", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
				});
				// Keypress.simple_combo(cmdKeyName+" x", function(e) {
				// 	px.message('cmd x');
				// 	e.preventDefault();
				// });
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// フィールドのイベントセット
				console.log('incense: setting board events...');
				var mkWidget = function(e){
					// console.log(e);
					_this.fieldContextMenu.open(e.offsetX, e.offsetY);
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
								var fromOffsetX = event.dataTransfer.getData("offset-x");
								var fromOffsetY = event.dataTransfer.getData("offset-y");
								// console.log(targetWidgetId, fromX, fromY);
								// console.log(e.offsetX, e.offsetY);
								// console.log(e);
								var toX = $fieldOuter.scrollLeft() + e.pageX - fromOffsetX - $fieldOuter.offset().left;
								if( toX < 0 ){ toX = 0; }
								var toY = $fieldOuter.scrollTop() + e.pageY - fromOffsetY - $fieldOuter.offset().top;
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
						rlv();
					}
				);
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
		return $textarea;
	} // setBehaviorChatComment()

	/**
	 * メインタイムラインにメッセージを表示する
	 */
	this.insertTimeline = function( $messageUnit ){
		$timelineList.append( $messageUnit );

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
	this.markdown = function(md){
		// md = md.replace(/(\r\n|\r|\n)/g, '<br />');

		var marked = require('marked');
		marked.setOptions({
			renderer: new marked.Renderer(),
			gfm: true,
			tables: true,
			breaks: false,
			pedantic: false,
			sanitize: false,
			smartLists: true,
			smartypants: false
		});
		var html = marked(md);
		var $div = $('<div>').html(html);
		$div.find('a').attr({'target': '_blank'});
		return $div.html();
	}

	/**
	 * ログインユーザー情報を取得
	 */
	this.getUserInfo = function(){
		return userInfo;
	}

	/**
	 * 親子関係の表現を更新する
	 */
	this.updateRelations = function( callback ){
		callback = callback || function(){};
		// <path stroke="black" stroke-width="2" fill="none" d="M120,170 180,170 150,230z" />

		function getCenterOfGravity($elm){
			var toX = 0 - $field.offset().left + $fieldOuter.scrollLeft() + $elm.offset().left + $elm.outerWidth()/2;
			if( toX < 0 ){ toX = 0; }
			var toY = 0 - $field.offset().top + $fieldOuter.scrollTop() + $elm.offset().top + $elm.outerHeight()/2;
			if( toY < 0 ){ toY = 0; }
			return {'x':toX, 'y':toY};
		}

		var $svg = $fieldRelations.find('>svg');
		$svg.html('');
		var widgets = this.widgetMgr.getAll();
		for( var idx in widgets ){
			if( !widgets[idx].parent ){ continue; }
			var d = '';
			var me = getCenterOfGravity(widgets[idx].$);
			var parent = getCenterOfGravity(_this.widgetMgr.get(widgets[idx].parent).$);
			$svg.get(0).innerHTML += '<path stroke="#333" stroke-width="3" fill="none" d="M'+me.x+','+me.y+' L'+parent.x+','+parent.y+'" style="opacity: 0.2;" />';
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
