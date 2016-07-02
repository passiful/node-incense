/**
 * bifloraApi - receiveBroadcast.js
 */
module.exports = function( data, callback, main, socket ){
	// console.log(data);
	// console.log(callback);
	main.messageOperator.exec(data);
	callback(true);
	return;
}
