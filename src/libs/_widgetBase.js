/**
 * widgets: base class
 */
module.exports = function( incense, $widget ){
	var _this = this;
	this.id = null; // <= widgetMgr.create() が自動的にセットする
	this.widgetType = null; // <= widgetMgr.create() が自動的にセットする

	/**
	 * widget への配信メッセージを受信
	 */
	this.onMessage = function(message){
	}

	/**
	 * widget へフォーカスした時の反応
	 */
	this.focus = function(){
	}

	/**
	 * widget の内容を端的に説明するテキストを取得する
	 */
	this.getSummary = function(){
		return '--- summary ---';
	}

	return;
}
