# node-incense

## install

```
$ npm install --save incense
```

`incense` requires `biflora`, and `socket.io`.

```
$ npm install --save biflora
$ npm install --save socket.io
```

## Usage

### server side

```js
var express = require('express'),
	app = express();
var server = require('http').Server(app);
var biflora = require('biflora');

// middleware - biflora resources
app.use( biflora.clientLibs() );
biflora.setupWebSocket(
	server,
	require('incense').getBifloraApi() ,
	require('incense').getBifloraMain({
		'dataDir': '/path/to/datadir/' // <- data directory (Read/Write permission required)
	})
);

// middleware - frontend documents
app.use( express.static( '/path/to/htdocs/' ) );

server.listen( 3000, function(){
	console.log('message: server-standby');
} );
```

### client side

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>passiful/incense</title>

		<!-- incense -->
		<link rel="stylesheet" href="./common/dist/incense.css" />
	</head>
	<body>
		<h1>passiful/incense</h1>
		<div class="test-wrap">
			<div id="testBoardElement"></div>
			<div id="testTimelineElement"></div>
		</div>

		<!-- socket.io -->
		<script src="/socket.io/socket.io.js" type="text/javascript"></script>

		<!-- biflora -->
		<script src="/biflora/biflora.js" type="text/javascript"></script>

		<!-- incense -->
		<script src="./common/dist/incense.js" type="text/javascript"></script>

		<!-- initialize code -->
		<script>
			window.incense = new Incense();
			incense.init(
				{
					'elmBoard': document.getElementById('testBoardElement'),
					'elmTimeline': document.getElementById('testTimelineElement'),
					'boardId': 1234567890, // <- discussion board name
					'userInfo': {
						'id': 'tester', // <- login user id
						'name': 'Test User' // <- login user name
					}
				},
				function(){
					console.log('incense standby.');
				}
			);
		</script>
	</body>
</html>
```

#### API

- incense.init( options, callback ) : 初期化する
- incense.getUserInfo() : ログインユーザーの情報を取得する
- incense.getBoardId() : ボードIDを取得する
- incense.getWidgetList( callback ) : ウィジェットの一覧を取得する
- incense.sendMessage( msg, callback ) : メッセージを送信する


## 更新履歴 - Change log

### incense@0.0.2 (2017-??-??)

- ????????????????????

### incense@0.0.1 (2016-12-26)

- initial release.


## ライセンス - License

Copyright (c)2016 Tomoya Koyanagi, and Passiful Project<br />
MIT License https://opensource.org/licenses/mit-license.php


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <http://www.pxt.jp/>
- Twitter: @tomk79 <http://twitter.com/tomk79/>
