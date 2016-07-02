/**
 * widgetMgr.js
 */
module.exports = function( app, $timelineList, $field, $fieldInner ){
	var _this = this;
	var _ = require('underscore');
	var widgetIndex = [];

	/**
	 * ウィジェットを配置する
	 */
	this.create = function(id, content){
		// console.log(id, content);
		var $widget = $('<div class="widget">');
		content = content || {};
		content.x = content.x || 0;
		content.y = content.y || 0;
		content.widgetType = content.widgetType || 'stickies';
		content.parent = content.parent || '';

		$fieldInner.append( $widget
			.css({
				'left': content.x,
				'top': content.y,
				'z-index': app.widgetsMaxZIndex ++
			})
			.attr({
				'data-widget-id': id,
				'data-offset-x': content.x,
				'data-offset-y': content.y,
				'draggable': true
			})
			.bind('mousedown', function(e){
				$(this).css({
					'z-index': app.widgetsMaxZIndex ++
				});
			})
			.on('dblclick contextmenu', function(e){
				e.stopPropagation();
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
		widgetIndex[id] = _.defaults( new app.widgetList[content.widgetType].api(app, $widget), app.widgetBase );
		widgetIndex[id].id = id;
		widgetIndex[id].widgetType = content.widgetType;
		widgetIndex[id].parent = content.parent;
		widgetIndex[id].$ = $widget;

		app.updateRelations();
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
		app.updateRelations();
	}

	/**
	 * ウィジェットにフォーカスする
	 */
	this.focus = function(widgetId){
		var widget = this.get(widgetId);
		// console.log( widget.$.offset() );

		// var offset = widget.$.offset();
		// $field.scroll( offset );
		// console.log( $field );
		// $field.eq(0).scrollTo(widget.$, 'normal');
		$field
			.animate({ 'scrollTop': $field.scrollTop() + widget.$.offset().top - ($field.innerHeight()/2) + (widget.$.outerHeight()/2) })
			.animate({ 'scrollLeft': $field.scrollLeft() + widget.$.offset().left - ($field.innerWidth()/2) + (widget.$.outerWidth()/2) })
		;

		window.main.modal.close(function(){
			widget.focus();
		});
		return;
	}

	/**
	 * ウィジェットの子ウィジェットの一覧を取得する
	 */
	this.getChildren = function(parentWidgetId){
		var rtn = [];
		for( var idx in widgetIndex ){
			if( widgetIndex[idx].parent == parentWidgetId ){
				rtn.push( widgetIndex[idx] );
			}
		}
		return rtn;
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
