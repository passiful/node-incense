/**
 * _setBehaviorChatComment.js
 */
module.exports = function(incense){
	var $ = require('jquery');

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
			var rtn = '';
			if( file.type.indexOf("image/") === 0 ){
				rtn = '<a href="'+evt.target.result+'"><img src="'+evt.target.result+'" alt="'+file.name+'" /></a>';
			}else{
				rtn = '<a href="'+evt.target.result+'" download="'+file.name+'">添付ファイル '+file.name+' ('+file.size+' bytes)</a>';
			}
			callback( rtn );
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
