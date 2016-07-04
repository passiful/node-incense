/**
 * bifloraMain.js
 */
module.exports = function(options){
	// delete(require.cache[require('path').resolve(__filename)]);

	this.options = options || {};
	this.dbh = new (require('./dbh.js'))(options, this);
	this.board = new (require('./board.js'))(options, this);

}
