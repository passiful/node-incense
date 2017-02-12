/**
 * incense.js
 */
module.exports = function(options){
	this.options = options;

	this.getBifloraApi = function(){
		return require( require('path').resolve(__dirname, './apis/bifloraApi.js') );
	}
	this.getBifloraMain = function(){
		return new (require( require('path').resolve(__dirname, './bifloraMain.js') ))(options);
	}

	this.getExpressMiddleware = (require(require('path').resolve(__dirname, './expressMiddleware.js')))(options);
};
