/**
 * bifloraMain.js
 */
module.exports = function(conf){
	delete(require.cache[require('path').resolve(__filename)]);

	this.dbh = new (require('./dbh.js'))(conf, this);
	this.board = new (require('./board.js'))(conf, this);

}
