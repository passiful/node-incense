/**
 * Markdown 変換する - _markdown.js
 */
module.exports = function( incense ){
	var $ = require('jquery');
	var detoxHtml = require('./_detoxHtml.js')(incense);

	return function( md ){
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

		// リンクは新規ウィンドウで開く
		$div.find('a').attr({'target': '_blank'});

		html = $div.html();

		// 解毒
		html = detoxHtml( html );

		return html;
	}
}
