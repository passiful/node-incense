/**
 * _fieldContextMenu.js
 */
module.exports = function( app, $fieldContextMenu ){
	var _this = this;
	var $ = require('jquery');
	var $contextmenu = $('<div class="incense-contextmenu">');

	/**
	 * コンテキストメニューを開く
	 */
	this.open = function(position, menu){
		// alert(x, y);
		menu = menu || [];

		var $ul = $('<ul>');
		for( var idx in menu ){
			(function(menu){
				// console.log(menu);
				$ul
					.append( $('<li>')
						.append( $('<a>')
							.text(menu.label)
							.attr({
								'href': 'javascript:;',
								'data-widget-data': JSON.stringify(menu.data)
							})
							.on('click', function(e){
								e.stopPropagation();
								_this.close();
								try {
									var data = JSON.parse($(this).attr('data-widget-data'));
									menu.action(data);
								} catch (e) {
									console.log('ERROR on contextmenu');
								}
							})
						)
					)
				;
			})(menu[idx]);
		}

		var zoomRate = (1/incense.getZoomRate());
		$fieldContextMenu.append( $contextmenu
			.css({
				'position': 'absolute',
				'top': position.y - 5*zoomRate,
				'left': position.x - 5*zoomRate,
				'z-index': app.widgetsMaxZIndex ++,
				'transform': 'scale('+zoomRate+','+zoomRate+')',
				'transform-origin': '0 0'
			})
			.on('click', function(e){
				e.stopPropagation();
			})
			.on('dblclick', function(e){
				e.stopPropagation();
			})
			.on('contextmenu', function(e){
				e.stopPropagation();
			})
			.html('')
			.append( $ul )
		);
	}

	/**
	 * コンテキストメニューを閉じる
	 */
	this.close = function(){
		$contextmenu.remove();
		return;
	}
	return;
}
