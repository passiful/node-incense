/**
 * keypress.js
 */
module.exports = function( incense ){
	var Keypress;
	var cmdKeyName = (function(ua){
		// console.log(ua);
		var idxOf = ua.indexOf( 'Mac OS X' );
		if( idxOf >= 0 ){
			return 'cmd';
		}
		return 'ctrl';
	})(window.navigator.userAgent);
	// console.log(cmdKeyName);


	if( !window.keypress ){
		console.error('incense: window.keypress is not exists.');
		rlv();
		return;
	}

	Keypress = new window.keypress.Listener();
	incense.Keypress = Keypress;
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

	Keypress.simple_combo(cmdKeyName+" -", function(e) {
		var zoomRate = incense.getZoomRate();
		zoomRate = zoomRate - 0.2;
		if( zoomRate < 0.2 ){
			zoomRate = 0.2;
		}
		incense.zoom( zoomRate );
		e.preventDefault();
	});
	Keypress.simple_combo(cmdKeyName+" =", function(e) {
		var zoomRate = incense.getZoomRate();
		zoomRate = zoomRate + 0.2;
		if( zoomRate > 3 ){
			zoomRate = 3;
		}
		incense.zoom( zoomRate );
		e.preventDefault();
	});
	Keypress.simple_combo(cmdKeyName+" 0", function(e) {
		incense.zoom( 1 );
		e.preventDefault();
	});

	return;
}
