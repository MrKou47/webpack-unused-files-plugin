/* eslint-disable consistent-this,no-console, no-sync */
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const chalk = require('chalk').default;
const { group } = require('../utils');

const defaultOptions = {
	context: '',
	patterns: [
		'!**/node_modules',
		'!**/(test|tests)/**',
	],
	sort: null, // 'ext', 'path'
	strict: false,
}

class WebpackUnusedFilePlugin {

	constructor (options) {
		options.patterns = defaultOptions.patterns.concat(options.patterns)
		this.options = Object.assign(defaultOptions, options)
	}

	filter (depFiles) {
		const files = new Set(depFiles)
		return totalFiles => totalFiles.filter(file => !files.has(file))
	}

	findFirstDir(context, targetPath) {
		const rel = path.relative(context, targetPath);
		const firstDir = rel.split('/')[0];
		const firstPath = path.join(context, firstDir);
		if (fs.existsSync(firstPath) && fs.statSync(firstPath).isDirectory()) {
			return firstDir;
		}
		return '';
	}

	findDir() {
		const { context, patterns } = this.options;
		const dirSet = (matchedFiles) => new Set(
			matchedFiles.map(f => this.findFirstDir(context, f)).filter(p => !!p)
		);
    return globby(patterns, {
			expandDirectories: true
		})
		.then(dirSet)
	}

	sort (unusedFiles) {
		const { sort } = this.options;
		const { context } = this.options;
		if (unusedFiles && unusedFiles.length) {
			console.log(chalk.red('you might have some unused files ⚠️'));
			if (sort === 'ext') {
				unusedFiles = unusedFiles.map(file => ({
					file,
					ext: path.extname(file).slice(1),
				}))
				const extSortRes = group(unusedFiles, 'ext');
				for (const ext in extSortRes) {
					console.log('\r');
					console.log(chalk.green(`${ ext }: `), '\r\n');
					if (extSortRes.hasOwnProperty(ext)) {
						const fileList = extSortRes[ext]
						fileList.forEach(f => console.log(chalk.yellow(f.file)))
					}
				}
			} else if (sort === 'path') {
				return this.findDir(context).then(dirSet => {
					const sortByDir = {};
					unusedFiles.forEach(f => {
						const firstDir = this.findFirstDir(context, f);
						if (dirSet.has(firstDir)) {
							sortByDir[firstDir] ? sortByDir[firstDir].push(f) : sortByDir[firstDir] = [f];
						} else {
							sortByDir.other ? sortByDir.other.push(f) : sortByDir.other = [f];
						}
					});
					for (const dir in sortByDir) {
						console.log(chalk.red(`${ dir }: `));
						if (sortByDir.hasOwnProperty(dir)) {
							const fileList = sortByDir[dir];
							fileList.forEach(f => console.log(chalk.yellow(f)))
						}
					}
					return unusedFiles;
				});
			}
		}
		return Promise.resolve(unusedFiles)
	}

	apply (compiler) {
		const _this = this;
		let context = this.options.context;
		if (!context) {
			context = this.options.context || compiler.context;
			this.options.context = context;
		}

		const { patterns } = this.options
		patterns.unshift(context)
		compiler.plugin('emit', (compilcation, callback) => {
			const dependFiles = compilcation.fileDependencies
			globby(patterns, {
				gitignore: true,
				cwd: context,
			})
				.then(_this.filter(dependFiles))
				.then(_this.sort.bind(_this))
				.then(unusedFiles => {
					if (_this.options.strict && unusedFiles && unusedFiles.length)
						compilcation.errors.push(new Error(`[webpack-unused-files-plugin]: your folder ${ context } contains unused files. Please remove or delete them.`))
					callback()
				})
		})
	}
}

module.exports = WebpackUnusedFilePlugin;
