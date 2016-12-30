/**
 * Markdown 変換する - _markdown.js
 */
module.exports = function( md ){
    var $ = require('jquery');
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