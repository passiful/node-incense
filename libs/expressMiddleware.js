/**
 * expressMiddleware.js
 */
module.exports = function(options){
	var url = require('url');
	var utils79 = require('utils79');
	var dbh = new (require('./dbh.js'))(options, this);

	return function(){
		return function(req, res, next){
			// console.log(req, res, next);
			// console.log(req.url);
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			// console.log(query);

			if( query.boardId && query.fileId ){
				dbh.getFile(query.boardId, query.fileId, function(fileInfo){
					// console.log(fileInfo);
					var base64 = fileInfo.base64;
					base64 = new Buffer(base64, 'base64');

					// 標準出力
					res.writeHead(
						200,
						{
							'Content-Type': fileInfo.type,
							'Content-Length': base64.length
						}
					);
					res.end(base64);
				});
				return;
			}

			// パラメータが不足している
			res
				.status(400)
				.set('Content-Type', 'text/html')
				.send( '<p>Bad Request</p>' )
				.end();

			return;

		}
	}
}
