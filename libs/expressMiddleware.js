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
					res
						.status(200)
						.set('Content-Type', fileInfo.type)
						.set('Content-Length', fileInfo.size)
						.send( utils79.base64_decode( fileInfo.base64 ) )
						.end();

				});
				return;
			}

			res
				.status(400)
				.set('Content-Type', 'text/html')
				.send( '<p>Bad Request</p>' )
				.end();

			return;

		}
	}
}
