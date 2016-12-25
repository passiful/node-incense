/**
 * widgetMgr.js
 */
module.exports = function( incense, $timelineList, $field, $fieldOuter, $fieldInner, $fieldSelection ){
	var _this = this;
	var $ = require('jquery');
	var _ = require('underscore');
	var widgetIndex = [];
	var selected = [];

	/**
	 * ウィジェットを配置する
	 */
	this.create = function(id, content){
		// console.log(id, content);
		var $widget = $('<div class="incense-widget">');
		content = content || {};
		content.x = content.x || 0;
		content.y = content.y || 0;
		content.widgetType = content.widgetType || 'stickies';
		content.parent = content.parent || '';

		$fieldInner.append( $widget
			.css({
				'left': content.x,
				'top': content.y,
				'z-index': incense.widgetsMaxZIndex ++
			})
			.attr({
				'data-widget-id': id,
				'data-offset-x': content.x,
				'data-offset-y': content.y,
				'draggable': true
			})
			.bind('mousedown', function(e){
				$(this).css({
					'z-index': incense.widgetsMaxZIndex ++
				});
			})
			.on('dblclick', function(e){
				e.stopPropagation();
			})
			.on('contextmenu', function(e){
				var $this = $(this);
				var widgetId = $this.attr('data-widget-id');
				_this.unselect();
				_this.select( widgetId );
				incense.fieldContextMenu.open(
					{'x':Number($this.attr('data-offset-x')), 'y':Number($this.attr('data-offset-y'))},
					(function(){
						var rtn = [
							{
								"label": "親を変更",
								"data": {
									'widget-id': widgetId
								},
								"action": function(data){
									alert('開発中');
								}
							},
							{
								"label": "削除",
								"data": {
									'widget-id': widgetId
								},
								"action": function(data){
									var msg = {
										'content': JSON.stringify({
											'operation': 'deleteWidget',
											'targetWidgetId': data['widget-id']
										}),
										'contentType': 'application/x-passiflora-command'
									};
									incense.sendMessage(
										msg,
										function(result){
											console.log(result);
										}
									);
								}
							}
						];
						return rtn;
					})()
				);
				e.preventDefault();
				e.stopPropagation();
			})
			.on('click', function(e){
				var $this = $(this);
				_this.unselect();
				_this.select( $this.attr('data-widget-id') );
				incense.fieldContextMenu.close();
				return false;
			})
			.bind('dragstart', function(e){
				e.stopPropagation();
				var event = e.originalEvent;
				var $this = $(this);
				event.dataTransfer.setData("method", 'moveWidget' );
				event.dataTransfer.setData("widget-id", $this.attr('data-widget-id') );
				event.dataTransfer.setData("offset-x", e.offsetX );
				event.dataTransfer.setData("offset-y", e.offsetY );
				// console.log(e);
			})
		);
		// console.log(content);
		widgetIndex[id] = _.defaults( new incense.widgetList[content.widgetType].api(incense, $widget), new (incense.widgetBase)(incense, $widget) );
		widgetIndex[id].id = id;
		widgetIndex[id].widgetType = content.widgetType;
		widgetIndex[id].parent = content.parent;
		widgetIndex[id].$ = $widget;

		incense.updateRelations();
		this.updateSelection();
		return;
	}

	/**
	 * ウィジェットを移動する
	 */
	this.move = function(id, content){
		$targetWidget = $fieldInner.find('[data-widget-id='+content.targetWidgetId+']');
		$targetWidget
			.css({
				'left': content.moveToX,
				'top': content.moveToY
			})
			.attr({
				'data-offset-x': content.moveToX,
				'data-offset-y': content.moveToY
			})
		;
		incense.updateRelations();
		this.updateSelection();
	}

	/**
	 * ウィジェットにフォーカスする
	 */
	this.focus = function(widgetId){
		var widget = this.get(widgetId);

		$fieldOuter
			.animate({
				'scrollTop': $fieldOuter.scrollTop() + widget.$.offset().top - ($fieldOuter.innerHeight()/2) + (widget.$.outerHeight()/2) ,
				'scrollLeft': $fieldOuter.scrollLeft() + widget.$.offset().left - ($fieldOuter.innerWidth()/2) + (widget.$.outerWidth()/2)
			})
		;
		this.updateSelection();

		incense.modal.close(function(){
			widget.focus();
		});
		return;
	}

	/**
	 * ウィジェットを選択する
	 */
	this.select = function(id){
		// var widget = this.get(id);
		selected.push(id);
		// console.log(selected);

		$targetWidget = $fieldInner.find('[data-widget-id='+id+']');
		var $selected = $('<div>');
		$selected
			.css({
				'position': 'absolute',
				'top': $targetWidget.css('top'),
				'left': $targetWidget.css('left'),
				'width': $targetWidget.width(),
				'height': $targetWidget.height(),
				'background': 'rgba(255,0,0,0.2)',
				'border': '3px solid #f00',
				'opacity': '0.6'
			})
		;
		$fieldSelection.append( $selected );

		return;
	}

	/**
	 * ウィジェットの選択状態を更新
	 */
	this.updateSelection = function(){
		// var widget = this.get(id);

		$fieldSelection.html('');
		for( var i in selected ){
			$targetWidget = $fieldInner.find('[data-widget-id='+selected[i]+']');
			var $selected = $('<div>');
			$selected
				.css({
					'position': 'absolute',
					'top': $targetWidget.css('top'),
					'left': $targetWidget.css('left'),
					'width': $targetWidget.width(),
					'height': $targetWidget.height(),
					'background': 'rgba(255,0,0,0.2)',
					'border': '3px solid #f00',
					'opacity': '0.6'
				})
			;
			$fieldSelection.append( $selected );
		}

		return;
	}

	/**
	 * ウィジェットの選択を解除する
	 */
	this.unselect = function(){
		selected = [];
		$fieldSelection.html('');
		// console.log(selected);
		return;
	}

	/**
	 * ウィジェットを削除する
	 */
	this.delete = function(id, widgetId){
		this.unselect();
		try {
			widgetIndex[widgetId].$.remove();
			widgetIndex[widgetId] = undefined;
			delete(widgetIndex[widgetId]);
		} catch (e) {
		}
		incense.updateRelations();
		this.updateSelection();
		return;
	}

	/**
	 * ウィジェットの一覧を取得する
	 */
	this.getList = function( callback ){
		callback = callback || function(){};
		callback( widgetIndex );
		return;
	}

	/**
	 * ウィジェットの子ウィジェットの一覧を取得する
	 */
	this.getChildren = function(parentWidgetId, callback){
		callback = callback || function(){};
		var rtn = [];
		for( var idx in widgetIndex ){
			if( widgetIndex[idx].parent == parentWidgetId ){
				rtn.push( widgetIndex[idx] );
			}
		}
		callback(rtn);
		return;
	}

	/**
	 * ウィジェットを取得する
	 */
	this.get = function(widgetId){
		return widgetIndex[widgetId];
	}

	/**
	 * ウィジェットを一覧ごと取得する
	 */
	this.getAll = function(){
		return widgetIndex;
	}

	/**
	 * ウィジェットへのリンクを生成する
	 */
	this.mkLinkToWidget = function( targetWidget ){
		var $rtn = $('<a>')
			.attr({
				'href':'javascript:;',
				'data-widget-id': targetWidget
			})
			.text('#widget.'+targetWidget)
			.click(function(e){
				var widgetId = $(this).attr('data-widget-id');
				_this.unselect();
				_this.select(widgetId);
				_this.focus(widgetId);
				return false;
			})
		;
		return $rtn;
	}

	/**
	 * ウィジェットのメッセージを受け取る
	 */
	this.receiveWidgetMessage = function(message){
		// console.log(message);
		widgetIndex[message.targetWidget].onMessage(message);
	}

	return;
}
