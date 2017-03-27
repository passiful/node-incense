/**
 * bifloraApi - updateLog.js
 */
module.exports = function( data, callback, main, socket ){
	console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= _updateLog.js');
	console.log(data);
	console.info('TODO: delete message の配信を受けたら、過去の投稿の内容を改変する処理を実行します。');
	// console.log(callback);
	// main.locker.receive(data);
	callback(true);
	return;
}
