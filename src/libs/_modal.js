/**
 * _modal.js
 */
module.exports = function($field){
	var _this = this;
	var $ = require('jquery');

	var tpl = '<div class="incense-modal">'+"\n"
			+ '  <div class="incense-modal__dialog">'+"\n"
			+ '    <div class="incense-modal__content">'+"\n"
			+ '      <div class="incense-modal__header">'+"\n"
			+ '        <button type="button" class="btn btn-default incense-modal__close" data-dismiss="modal">'+"\n"
			+ '          <span>&times;</span>'+"\n"
			+ '        </button>'+"\n"
			+ '        <h4 class="incense-modal__title"></h4>'+"\n"
			+ '      </div>'+"\n"
			+ '      <div class="incense-modal__body"></div>'+"\n"
			+ '      <div class="incense-modal__footer">'+"\n"
			+ '      </div>'+"\n"
			+ '    </div><!-- /.incense-modal__content -->'+"\n"
			+ '  </div><!-- /.incense-modal__dialog -->'+"\n"
			+ '<!-- /.incense-modal --></div>'
	;

	var $dialog;

	/**
	 * ダイアログを表示する
	 */
	this.open = function(opt, callback){
		callback = callback||function(){};
		this.close(function(){

			$dialog = $(tpl);
			$dialog.on('click', function(e){
				e.stopPropagation();
			});

			$field
				.append($dialog)
			;

			opt = opt||{};
			opt.title = opt.title||'command:';
			opt.body = opt.body||$('<div>');
			opt.buttons = opt.buttons||[
				$('<button class="btn btn-primary">').text('OK').click(function(){
					this.close();
				})
			];

			for( var i in opt.buttons ){
				var $btnElm = $(opt.buttons[i]);
				$btnElm.each(function(){
					if(!$(this).hasClass('btn')){
						$(this).addClass('btn').addClass('btn-secondary');
					}
				});
				opt.buttons[i] = $btnElm;
			}

			// var $dialogButtons = $('<div class="incense-modal__footer">').append(opt.buttons);

			$dialog.find('.incense-modal__title').append(opt.title);
			$dialog.find('.incense-modal__body').append(opt.body);
			$dialog.find('.incense-modal__footer').append(opt.buttons);
			$dialog.find('.incense-modal__header button.incense-modal__close').click(function(e){
				_this.close();
			});

			callback();
		});
		return $dialog;
	} // open()

	/**
	 * ダイアログを閉じる
	 */
	this.close = function(callback){
		callback = callback || function(){};
		if($dialog){
			$dialog.hide();
			setTimeout(function(){
				$dialog.remove();
				$dialog = undefined;
				callback();
			}, 110);
			return $dialog;
		}
		callback();
		return $dialog;
	} // close()

	/**
	 * modal dialog が開いているか確認する
	 */
	this.isOpened = function(){
		if($dialog){
			return true;
		}
		return false;
	}

}
