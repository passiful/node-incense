/**
 * bifloraMain.js
 */
module.exports = function(options){
	// delete(require.cache[require('path').resolve(__filename)]);

	options = options || {};
	// this.options = options || {};
	this.dbh = new (require('./dbh.js'))(options, this);
	this.board = new (require('./board.js'))(options, this);

	this.getUserInfo = function( socket, clientDefaultUserInfo, callback ){
		callback = callback || function(){};
		if( typeof(options.getUserInfo) == typeof(function(){}) ){
			options.getUserInfo( socket, clientDefaultUserInfo, callback );
		}else{
			// provide user info.
			// eg: {'id': 'user_id', 'name': 'User Name'}
			callback(clientDefaultUserInfo);
		}
		return;
	}
}
