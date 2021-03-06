# node-incense

Discussion Board UI.

## Install

```
$ npm install --save incense
```

`incense` requires `biflora`, and `socket.io`.

```
$ npm install --save biflora
$ npm install --save socket.io
```

## Usage

### Server side

```js
var express = require('express'),
	app = express();
var server = require('http').Server(app);
var biflora = require('biflora');
var Incense = require('incense'),
	incense = new Incense({
		'dataDir': '/path/to/datadir/', // <- data directory (Read/Write permission required)
		'db': { // <- database setting
			"dbms": "sqlite",
			"storage": "/path/to/your/database.sqlite",
			"tablePrefix": "incense"
		} ,
		'getUserInfo': function( socket, clientDefaultUserInfo, callback ){
			// provide user info.
			// e.g. {
			//     'id': 'user_id',
			//     'name': 'User Name',
			//     'url': 'http://example.com/',
			//     'icon': 'http://example.com/sample.png'
			// }
			callback(clientDefaultUserInfo);
			return;
		}
	});


// middleware - biflora resources
app.use( biflora.clientLibs() );
biflora.setupWebSocket(
	server,
	incense.getBifloraApi() ,
	incense.getBifloraMain()
);

// middleware - Incense API for Express
app.use( '/path/to/incense/api', incense.getExpressMiddleware() );

// middleware - frontend documents
app.use( express.static( '/path/to/htdocs/' ) );

server.listen( 3000, function(){
	console.log('message: server-standby');
} );
```

MySQLを利用する場合は次のように書きます。

```js
var db_host = "your.dbhost",
	db_database = "your_scheme_name",
	db_user = "mysql_user_name",
	db_password = "mysql_password";

incense = new Incense({
	'dataDir': ......,
	'db': {
		"dbms": "mysql",
		"host": db_host,
		"database": db_database,
		"user": db_user,
		"password": db_password,
		"tablePrefix": "incense"
	} ,
	'getUserInfo': ......
});
```

### Client side

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
					'apiUrl': window.location.origin+'/path/to/incense/api', // <- URL of Incense API Express Middleware
					'userInfo': {
						'id': 'tester', // <- login user id
						'name': 'Test User', // <- login user name
						'url': 'https://example.com/', // <- login user profile page
						'icon': 'https://example.com/sample.png' // <- login user icon
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
- incense.zoom() : ボードの拡大率を設定する
- incense.getZoomRate() : ボードの拡大率を取得する
- incense.scrollToBoardCenter() : ボードの中央へスクロール移動する


## NodeJS version.

- NodeJS v6.x


## 更新履歴 - Change log

### incense v0.2.0 (2019-07-11)

- MySQLに対応した。
- zoom位置をboardの中心に合わせるようにした。
- `scrollToBoardCenter()` 追加
- textarea編集中のダブルクリックイベントを無効化。
- データベース構造に関する修正。複数のボードデータを1つのデータベースで管理できるようになった。
- issuetree を discussiontree に改名。
- discussiontree: 答の初期値を 空欄 に変更。
- discussiontree: 問と答の編集を連続的に行えるようにカーソル移動ロジックを調整した。
- discussiontree: Vote 機能を GOOD! 機能に改名。
- ボードの拡大・縮小をキーボードショートカットでできるようにした。(dmauro-Keypress が必要)
- データベースを統合した。ボードごとに別のDBを持つのではなく、共通のDBファイルを持つように変更。
- タイムラインにクリップボード上の画像をペーストして投稿できるようになった。
- タイムラインにファイルを投稿できるようになった。
- サーバーサイドに Express Middleware を追加。
- クライアントサイドのオプションに `apiUrl` を追加。
- 過去の投稿を削除する機能を追加。
- その他不具合などの修正。

### incense v0.1.1 (2017-01-01)

- ウィンドウサイズ変更時に、選択状態の表示を更新するようにした。
- `#widget.36` のようなハッシュをつけてアクセスすると、ウィジェットにフォーカスした画面からスタートできるようになった。
- ログイン、ログアウトまわりの処理を調整した。
- ユーザー情報に `url` と `icon` を追加。
- ズームAPI `zoom()` 、 `getZoomRate()` 追加。
- 他のウィジェット上にドロップする操作で、親ウィジェットを変更できるようになった。

### incense v0.1.0 (2016-12-29)

- サーバーサイドに `getUserInfo()` オプション追加
- ボードデータ格納ディレクトリパスの生成規則を変更。2文字ずつ分割してパスを生成するようになった。

### incense v0.0.1 (2016-12-26)

- initial release.


## ライセンス - License

Copyright (c)2016-2019 Tomoya Koyanagi, and Passiful Project<br />
MIT License https://opensource.org/licenses/mit-license.php


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
