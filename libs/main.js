/**
 * incense.js
 */
module.exports = function(){
};
module.exports.getBifloraApi = function(){
    return require( require('path').resolve(__dirname, './apis/bifloraApi.js') );
}
module.exports.getBifloraMain = function( options ){
    return new (require( require('path').resolve(__dirname, './bifloraMain.js') ))(options);
}
