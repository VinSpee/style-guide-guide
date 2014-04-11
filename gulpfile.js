var coffeeify = require('coffeeify');
var env       = require('minimist');
var express   = require('express');
var gulp      = require('gulp');
var http      = require('http');
var instant   = require('instant');
var open      = require('open');
var plugins   = require("gulp-load-plugins")();

//config
var serverport     = 5000;
var server         = express();

//Add static-middleware
server.use(instant(__dirname + '/build'));

var sources = {
	styles       : './app/styles/**/*.sass',
	scripts      : './app/scripts/**/*.coffee',
	main_scripts : './app/scripts/app.coffee',
	images       : './app/images/**',
	html         : './app/*.html',
	templates    : './app/templates/**/*.hbs'
};

var dests = {
	styles    : './build/styles/',
	scripts   : './build/scripts/',
	images    : './build/images/',
	html      : './build/',
	templates : './build/templates/'
};

gulp.task('scripts', function() {
	return gulp.src(sources.main_scripts, {read: false})
		.pipe(plugins.coffeelint())
		.pipe(plugins.coffeelint.reporter())
		.pipe(plugins.browserify({
			transform: ['coffeeify'],
			extensions: ['.coffee'],
			debug: !env.production
		}))
		.pipe(plugins.concat('app.js'))
		.pipe(env.production ? plugins.uglify() : plugins.util.noop())
		.pipe(gulp.dest(dests.scripts));
});

gulp.task('styles', function() {
	return gulp.src(sources.styles)
		.pipe(plugins.compass({
			require: ['singularitygs', 'modular-scale', 'toolkit', 'breakpoint'],
			sass: './app/styles/',
			css: './build/styles/',
			image: './images/',
			font: './fonts/'
		}))
		.pipe(plugins.autoprefixer("last 2 version", "> 1%"))
		/*.pipe(plugins.csslint({
			'compatible-vendor-prefixes': false
		}))
		.pipe(plugins.csslint.reporter()) */
		.pipe(env.production ? plugins.csso() : plugins.util.noop())
		.pipe(gulp.dest('./build/styles'));
});

gulp.task('html', function() {
	return gulp.src(sources.html)
		.pipe(plugins.htmlhint())
		.pipe(plugins.htmlhint.reporter())
		//.pipe(plugins.usemin)
		.pipe(plugins.htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('build/'));
});

gulp.task('images', function() {
	return gulp.src(sources.images)
		.pipe(plugins.imagemin())
		.pipe(plugins.svgmin)
		.pipe(gulp.dest('build/images'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
	gulp.watch(sources.styles, ['styles']);
	gulp.watch(sources.scripts, ['scripts']);
	gulp.watch(sources.images, ['images']);
	//gulp.watch(sources.templates, ['templates']);
	gulp.watch(sources.html, ['html']);
});

gulp.task('clean', function() {
	return gulp.src([dests.scripts, dests.styles, dests.images, dests.html, dests.templates], {read: false})
		.pipe(plugins.clean());
});

gulp.task('server', function() {
	//Set up your static fileserver, which serves files in the build dir
	server.listen(serverport);
});

// The default task (called when you run `gulp` from cli)
gulp.task('build', ['html', 'styles', 'scripts']);
gulp.task('default', ['build', 'server', 'watch']);
