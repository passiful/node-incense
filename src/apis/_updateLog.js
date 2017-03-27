/**
 * bifloraApi - updateLog.js
 */
module.exports = function( data, callback, main, socket ){
	// console.log(callback);
	main.messageUpdater.exec(data);
	callback(true);
	return;
}
