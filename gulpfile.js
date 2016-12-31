var path = require('path');
var conf = require('config');
console.log(conf);

var gulp = require('gulp');
var sass = require('gulp-sass');//CSSコンパイラ
var sassInlineImage = require('sass-inline-image');//gulp-sass で inline-image を使えるようにする
var autoprefixer = require("gulp-autoprefixer");//CSSにベンダープレフィックスを付与してくれる
var uglify = require("gulp-uglify");//JavaScriptファイルの圧縮ツール
var concat = require('gulp-concat');//ファイルの結合ツール
var plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
var rename = require("gulp-rename");//ファイル名の置き換えを行う
var twig = require("gulp-twig");//Twigテンプレートエンジン
var browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換
var packageJson = require(__dirname+'/package.json');
var _tasks = [
	'.html',
	'.html.twig',
	'.css',
	'.css.scss',
	'.js',
	'replace-package-dist'
];


// broccoli-client (frontend) , bootstrap などを処理
gulp.task("replace-package-dist", function() {
	gulp.src(["node_modules/bootstrap/dist/fonts/**/*"])
		.pipe(gulp.dest( './dist/libs/bootstrap/dist/fonts/' ))
	;
	gulp.src(["node_modules/bootstrap/dist/js/**/*"])
		.pipe(gulp.dest( './dist/libs/bootstrap/dist/js/' ))
	;
});

// src 中の *.css.scss を処理
gulp.task('.css.scss', function(){
	gulp.src(["src/**/*.css.scss","!src/**/_*.css.scss"])
		.pipe(plumber())
		.pipe(sass({
			functions: sassInlineImage({ /* options */ })
		}))
		.pipe(autoprefixer())
		.pipe(rename({extname: ''}))
		.pipe(gulp.dest( './dist/' ))
	;
});

// src 中の *.css を処理
gulp.task('.css', function(){
	gulp.src(["src/**/*.css","!src/**/_*.css"])
		.pipe(plumber())
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.js を処理
gulp.task(".js", function() {
	gulp.src(["src/**/*.js","!src/**/_*.js"])
		.pipe(plumber())
		.pipe(browserify({
		}))
		// .pipe(uglify())
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.html を処理
gulp.task(".html", function() {
	gulp.src(["src/**/*.html", "src/**/*.htm"])
		.pipe(plumber())
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.html.twig を処理
gulp.task(".html.twig", function() {
	gulp.src(["src/**/*.html.twig"])
		.pipe(plumber())
		.pipe(twig({
			data: {
				packageJson: packageJson ,
				conf: conf
			}
		}))
		.pipe(rename({extname: ''}))
		.pipe(gulp.dest( './dist/' ))
	;
});


// 標準ブラウザを立ち上げてプレビューする
gulp.task("preview", function() {
	require('child_process').spawn('node', ['./libs/main.js']);
	require('child_process').exec('open '+conf.origin+'/');
});


// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	gulp.watch(["src/**/*"], _tasks);

	var svrCtrl = require( './tests/testdata/server/serverCtrl.js' );
	svrCtrl.boot(function(){
		require('child_process').spawn('open',[svrCtrl.getUrl()]);
	});

});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
