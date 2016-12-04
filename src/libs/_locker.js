/**
 * lockApi - locker.js
 */
module.exports = function( incense ){
	var userIndex = {};
	var widgetItemIndex = {};

	this.receive = function(data){
		// console.log(data);
		switch(data.method){
			case 'lock':
				userIndex[incense.getUserInfo().id] = {
					'widget': data.widget,
					'item': data.item
				};

				widgetItemIndex[data.widget] = widgetItemIndex[data.widget] || {};
				widgetItemIndex[data.widget][data.item] = incense.getUserInfo().id;
				console.log('locked.');
				break;

			case 'unlock':
				var lockInfo = userIndex[incense.getUserInfo().id];
				widgetItemIndex[lockInfo.widget][lockInfo.item] = undefined;
				delete(widgetItemIndex[lockInfo.widget][lockInfo.item]);
				userIndex[incense.getUserInfo().id] = undefined;
				delete(userIndex[incense.getUserInfo().id]);
				console.log('unlocked.');
				break;
		}
	}

	this.lock = function(widgetId, itemId, callback){
		callback = callback || function(){};

		if( this.isLocked(widgetId, itemId) ){
			callback(false);
			return false;
		}

		incense.biflora.send(
			'locker',
			{
				'boardId': incense.getBoardId(),
				'owner': incense.getUserInfo().id,
				'method': 'lock',
				'widget': widgetId,
				'item': itemId
			},
			function(rtn){
				callback(rtn);
			}
		);
		return true;
	}

	this.isLocked = function(widgetId, itemId){
		// console.log(userIndex);
		// console.log(widgetItemIndex);
		try {
			if(!widgetItemIndex[widgetId][itemId]){
				return false;
			}
			if(widgetItemIndex[widgetId][itemId] == incense.getUserInfo().id){
				return false;
			}
			return true;
		} catch (e) {
		}
		return false;
	}

	this.unlock = function(){
		incense.biflora.send(
			'locker',
			{
				'boardId': incense.getBoardId(),
				'owner': incense.getUserInfo().id,
				'method': 'unlock'
			},
			function(rtn){
				console.log('unlock command was sent.');
				// console.log(userIndex);
				// console.log(widgetItemIndex);
			}
		);
		return true;
	}

	return;
}
