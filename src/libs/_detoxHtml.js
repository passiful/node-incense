/**
 * 投稿されたHTMLを無害化する - _detoxHtml.js
 */
module.exports = function( incense ){
	var $ = require('jquery');

	return function( html ){
		var $div = $('<div>').html(html);
		$div.find('script').remove();
		$div.find('style').remove();
		$div.find('form').remove();
		$div.find('link').remove();
		$div.find('meta').remove();
		$div.find('title').remove();
		$div.find('[href]')
			.each(function(){
				var $this = $(this);
				var href = $this.attr('href');
				if( href.match(/^javascript\:/) ){
					$this.attr({
						'href': 'javascript:alert(\'Invalidated.\');'
					}).removeAttr('target');
				}else{
					$this.attr({
						'target': '_blank'
					});
				}
			})
		;
		$div.find('*')
			.removeAttr('style')
			.removeAttr('class')
			.removeAttr('onabort')
			.removeAttr('onauxclick')
			.removeAttr('onbeforecopy')
			.removeAttr('onbeforecut')
			.removeAttr('onbeforepaste')
			.removeAttr('onbeforeunload')
			.removeAttr('onblur')
			.removeAttr('oncancel')
			.removeAttr('oncanplay')
			.removeAttr('oncanplaythrough')
			.removeAttr('onchange')
			.removeAttr('onclick')
			.removeAttr('onclose')
			.removeAttr('oncontextmenu')
			.removeAttr('oncopy')
			.removeAttr('oncuechange')
			.removeAttr('oncut')
			.removeAttr('ondblclick')
			.removeAttr('ondrag')
			.removeAttr('ondragend')
			.removeAttr('ondragenter')
			.removeAttr('ondragleave')
			.removeAttr('ondragover')
			.removeAttr('ondragstart')
			.removeAttr('ondrop')
			.removeAttr('ondurationchange')
			.removeAttr('onemptied')
			.removeAttr('onended')
			.removeAttr('onerror')
			.removeAttr('onfocus')
			.removeAttr('ongotpointercapture')
			.removeAttr('onhashchange')
			.removeAttr('oninput')
			.removeAttr('oninvalid')
			.removeAttr('onkeydown')
			.removeAttr('onkeypress')
			.removeAttr('onkeyup')
			.removeAttr('onlanguagechange')
			.removeAttr('onload')
			.removeAttr('onloadeddata')
			.removeAttr('onloadedmetadata')
			.removeAttr('onloadstart')
			.removeAttr('onlostpointercapture')
			.removeAttr('onmessage')
			.removeAttr('onmousedown')
			.removeAttr('onmouseenter')
			.removeAttr('onmouseleave')
			.removeAttr('onmousemove')
			.removeAttr('onmouseout')
			.removeAttr('onmouseover')
			.removeAttr('onmouseup')
			.removeAttr('onmousewheel')
			.removeAttr('onoffline')
			.removeAttr('ononline')
			.removeAttr('onpagehide')
			.removeAttr('onpageshow')
			.removeAttr('onpaste')
			.removeAttr('onpause')
			.removeAttr('onplay')
			.removeAttr('onplaying')
			.removeAttr('onpointercancel')
			.removeAttr('onpointerdown')
			.removeAttr('onpointerenter')
			.removeAttr('onpointerleave')
			.removeAttr('onpointermove')
			.removeAttr('onpointerout')
			.removeAttr('onpointerover')
			.removeAttr('onpointerup')
			.removeAttr('onpopstate')
			.removeAttr('onprogress')
			.removeAttr('onratechange')
			.removeAttr('onrejectionhandled')
			.removeAttr('onreset')
			.removeAttr('onresize')
			.removeAttr('onscroll')
			.removeAttr('onsearch')
			.removeAttr('onseeked')
			.removeAttr('onseeking')
			.removeAttr('onselect')
			.removeAttr('onselectstart')
			.removeAttr('onshow')
			.removeAttr('onstalled')
			.removeAttr('onstorage')
			.removeAttr('onsubmit')
			.removeAttr('onsuspend')
			.removeAttr('ontimeupdate')
			.removeAttr('ontoggle')
			.removeAttr('onunhandledrejection')
			.removeAttr('onunload')
			.removeAttr('onvolumechange')
			.removeAttr('onwaiting')
			.removeAttr('onwebkitfullscreenchange')
			.removeAttr('onwebkitfullscreenerror')
			.removeAttr('onwheel')
		;
		return $div.html();
	}
}
