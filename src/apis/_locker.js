/**
 * bifloraApi - locker.js
 */
module.exports = function( data, callback, main, socket ){
	// console.log(data);
	// console.log(callback);
	main.locker.receive(data);
	callback(true);
	return;
}
