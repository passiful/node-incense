/**
 * API: incense
 */
module.exports = function( data, callback, main, socket ){
	delete(require.cache[require('path').resolve(__filename)]);
	var path = require('path');
	var it79 = require('iterate79');

	data = data||{};
	callback = callback||function(){};

	var Incense = require('./../../../../../libs/main.js');
	var incense = new Incense();

	it79.fnc(data, [
		function(it1, data){
			incense.init(
				{
					'documentRoot': path.resolve(__dirname, '../../../htdocs/')+'/',
					'customFields': {
					} ,
					'log': function(msg){
						console.error('[ERROR HANDLED]'+msg);
					}
				},
				function(){
					it1.next(data);
				}
			);
		} ,
		function(it1, data){
			if(data.api == 'gpiBridge'){
				incense.gpi(
					data.bridge.api,
					data.bridge.options,
					function(rtn){
						it1.next(rtn);
					}
				);
				return ;

			}

			setTimeout(function(){
				data.messageByBackend = 'Callbacked by backend API "incense".';
				it1.next(data);
			}, 0);
			return;

		} ,
		function(it1, data){
			callback(data);
			it1.next(data);
		}
	]);


	return;
}
