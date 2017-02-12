/**
 * _updateRelations.js
 */
module.exports = function(incense, $fieldRelations){
	var $ = require('jquery');
	return function(callback){
		callback = callback || function(){};
		// <path stroke="black" stroke-width="2" fill="none" d="M120,170 180,170 150,230z" />

		function getCenterOfGravity($elm){
			var zoomRate = incense.getZoomRate();
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
		var widgets = incense.widgetMgr.getAll();
		for( var idx in widgets ){
			if( !widgets[idx].parent ){ continue; }
			var d = '';
			var parentWidget = incense.widgetMgr.get(widgets[idx].parent);
			if(parentWidget){
				var me = getCenterOfGravity(widgets[idx].$);
				var parent = getCenterOfGravity(parentWidget.$);
				$svg.get(0).innerHTML += '<path stroke="#333" stroke-width="3" fill="none" d="M'+me.x+','+me.y+' L'+parent.x+','+parent.y+'" style="opacity: 0.2;" />';
			}
		}

		callback();
		return;
	}

}
