var gulp = require('gulp'),
	livereload,
	stylus,
	autoprefixer,
	webserver,
	cwd = process.cwd(),
	pkg = {},
	cfg,
	log = console.log;

try{
	pkg = require(cwd + '/package.json') || {};
}catch(e){};

// 默认配置
cfg = extend({

	// 根路径
	root: './',

	// http服务端口，关闭该项功能请设置false
	http: 3001,

	// 自动刷新服务端口，关闭该项功能请设置false
	livereload: {
		port: 4001,
		enable: true
	},

	// 自动补全css属性，关闭该项功能请设置false
	// 可指定具体浏览器和版本，如：
	//    ['last 2 versions', 'safari 4', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
	// 或指定浏览器的全球使用率，如：
	//    ['> 10%']
	// 如果要支持所有浏览器，则指定：['> 0%']
	// 参考：https://github.com/ai/browserslist
	autoprefixer: ['> 0%'],

	// 是否自动打开浏览器
	open: false,

	// 是否支持stylus
	stylus: false,

	// 要监控的各文件类型的路径
	// 包含的内容越少，工具的启动速度越快，CPU性能消耗也越少
	watch: {
		js: [
			'./**/*.js'
		],
		css: [
			'./**/*.css'
		],
		stylus: [
			'./**/*.styl'
		],
		html: [
			'./**/*.html'
		]
	}
}, pkg.pack);

// 监听代码
gulp.task('watch', function() {

	// 启动livereload服务
	if(cfg.livereload){

		if(!livereload){
			livereload = require('gulp-livereload');
		};

		livereload.listen(cfg.livereload);
	
		// 监听js和html，改动后刷新页面
		gulp.watch((cfg.watch.js || []).concat(cfg.watch.html || []), function(file) {
			livereload.reload(file.path);
		});

		log('监控js和html');

		// 监听css，改动后自动添加CSS前缀，然后刷新页面的link
		gulp.watch(cfg.watch.css, function(file) {
			//
			if(!autoprefixer){
				autoprefixer = require('gulp-autoprefixer');
			};
			//
			gulp.src([relative(file.path)], {
				base: cfg.root
			}).pipe(autoprefixer({
					browsers: cfg.autoprefixer,
					cascade: false
				}))
				.pipe(gulp.dest(cfg.root));
			//
			livereload.changed(file.path);
		});

		log('监控css');
	};

	if(cfg.stylus){
		// 监听styl文件，改动后自动编译为css文件
		gulp.watch([cfg.watch.stylus], function(file) {
			//
			if(!stylus){
				stylus = require('gulp-stylus');
			};
			//
			gulp.src([relative(file.path)], {
				base: cfg.root
			}).pipe(stylus())
				.pipe(gulp.dest(cfg.root));
		});

		log('开始监控stylus');
	};

});

// 启动一个Web服务器
gulp.task('server', function() {

	if(cfg.webserver === false){
		return;
	};

	webserver = require('gulp-webserver');

	gulp.src(cfg.root)
		.pipe(webserver({
			// 服务器端口
			port: cfg.http,
			// 是否为输出的页面添加livereload脚本标签
			livereload: cfg.livereload || false,
			// 是否自动打开浏览器
			open: cfg.open || false
		}));
});

// 默认任务，在命令行中输入gulp后回车
gulp.task('default', function(){
	gulp.start('server');
	gulp.start('watch');
});

// 取得相对路径
function relative(path){
	return '.' + path.replace(__dirname, '').replace(/\\/gm, '/');
}

function extend(dest, src){
	for(var n in src) if(src.hasOwnProperty(n)){
		dest[n] = src[n];
	};
	return dest;
}

exports.gulp = gulp;
