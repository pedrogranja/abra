'use strict';

const gulp = require('gulp');

const spawn = require('child_process').spawn;
function run(command) {
	command = command.split(' ');
	const proc = spawn(command[0], command.slice(1), {
		stdio: 'inherit',
		shell: true
	});
	proc.on('close', (code) => {
		if (code) process.exit(code);
	});
}

gulp.task('less', function (done) {
	const input = 'less/main.less';
	const output = 'dist/style.min.css';
	const opt = [
		'--source-map',
		'--source-map-less-inline',
		'--clean-css',
		'--autoprefix="last 2 versions"'
	].join(' ');

	run(`lessc ${opt} ${input} ${output}`);
	done();
});

gulp.task('html', function (done) {
	const input_dir = 'html';
	const output_dir = 'dist';
	const opt = [
		'--remove-comments',
		'--sort-attributes',
		'--sort-class-name',
		'--remove-redundant-attributes',
		'--collapse-whitespace',
		'--conservative-collapse'
	].join(' ');

	run(`html-minifier ${opt} --input-dir=${input_dir} --output-dir=${output_dir}`);
	done();
});

// TODO: stupid browserify can't write sourcemaps to files and
// uglify can't read inline input sourcemaps...
// so for the time being this task will use the traditional stream approach.
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const browserify = require('browserify');
const uglify = require('gulp-uglify');
const pump = require('pump');

gulp.task('js', function (done) {
	const input = 'js/main.js';
	const output = 'abra.min.js';
	const opt = {
		debug: true,
		detectGlobals: false
	};

	pump([
		browserify(opt).add(input).bundle(),
		source(output),
		buffer(),
		sourcemaps.init({loadMaps: true}),
		uglify(),
		sourcemaps.write(''),
		gulp.dest('dist')
	], done);

	/*
	const input = 'js/main.js';
	const output = 'dist/abra.js';
	const opt = [
		'--debug'
	].join(' ');

	run(`browserify ${opt} --entry ${input} --outfile ${output}`);

	const u_input = b_output;
	const u_output = 'dist/abra.min.js';
	const u_opt = [
		`--in-source-map ${b_output}.map`,
		`--source-map ${u_output}.map`,
		'-m -r "require,exports"',
		'-c'
	].join(' ');

	run(`uglifyjs ${u_opt} --output ${u_output} ${u_input}`);
	*/
});

gulp.task('watch', () => {
	gulp.watch('less/*.less', ['less']);
	gulp.watch('html/*.html', ['html']);
	gulp.watch('js/*.js', ['js']);
});

gulp.task('default', ['less', 'html', 'js']);
