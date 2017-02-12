/**
 * _setBehaviorChatComment.js
 */
module.exports = function(incense){
	var $ = require('jquery');
	var utils79 = require('utils79');

	function applyFile(file, callback){
		callback = callback || function(){};
		file = file||{};

		file.name = file.name||'clipboard.'+(function(type){
			if(type.match(/png$/i)){return 'png';}
			if(type.match(/gif$/i)){return 'gif';}
			if(type.match(/(?:jpeg|jpg|jpe)$/i)){return 'jpg';}
			if(type.match(/svg/i)){return 'svg';}
			return 'txt';
		})(file.type);
		// console.log('applyFile', file);

		var reader = new FileReader();
		reader.onload = function(evt) {
			evt.target.result.match(/^data\:([\s\S]+?)\;base64\,([\s\S]*)$/);
			var type = RegExp.$1;
			var base64 = RegExp.$2;
			// console.log(type, base64);
			incense.lfm.reserve(function(newFileId){
				var rtn = '';
				// console.log(newFileId, file);
				if( file.type.indexOf("image/") === 0 ){
					rtn = '<a href="'+utils79.h( incense.getFileUrl(newFileId) )+'" data-incense-file-id="'+utils79.h( newFileId )+'"><img src="'+utils79.h( evt.target.result )+'" alt="'+utils79.h( file.name )+'" /></a>';
				}else{
					rtn = '<a href="'+utils79.h( incense.getFileUrl(newFileId) )+'" data-incense-file-id="'+utils79.h( newFileId )+'" download="'+utils79.h( file.name )+'">添付ファイル '+utils79.h( file.name )+' ('+utils79.h( utils79.toStr(file.size) )+' bytes)</a>';
				}
				callback( rtn );
			});
		}
		reader.readAsDataURL(file);
		return reader;
	}

	return function($textarea, options){
		options = options || {};
		options.submit = options.submit || function(){};
		$textarea = $($textarea);
		$textarea
			.on('keydown', function(e){
				// console.log(e);
				if(e.key.toLowerCase() == 'escape'){
					this.blur();
				}
			})
			.on('keypress', function(e){
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
					options.submit( fixedValue );
					$this.val('').focus();
					return false;
				}
				return;
			})
			.on('dblclick', function(e){
				e.stopPropagation();
			})
			.on('paste', function(e){
				// console.log(e);
				e.stopPropagation();
				var items = e.originalEvent.clipboardData.items;
				for (var i = 0 ; i < items.length ; i++) {
					var item = items[i];
					// console.log(item);
					if( item.type.indexOf("image/") === 0 ){
						var file = item.getAsFile();
						// console.log(file);
						e.preventDefault();
						applyFile(file, function(result){
							options.submit( result );
						});
					}
				}
			})
			.on('drop', function(e){
				e.stopPropagation();
				e.preventDefault();
				var event = e.originalEvent;
				var items = event.dataTransfer.files;
				for (var i = 0 ; i < items.length ; i++) {
					var item = items[i];
					applyFile(item, function(result){
						options.submit( result );
					});
				}
			})
		;
		return $textarea;
	}
}
