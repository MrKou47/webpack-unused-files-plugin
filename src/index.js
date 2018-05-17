/* eslint-disable consistent-this,no-console */
const path = require('path');
const globby = require('globby');
const chalk = require('chalk').default;
const { group } = require('./utils');

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

	sort (unusedFiles) {
		const { sort } = this.options
		if (unusedFiles && unusedFiles.length) {
			console.log(chalk.bgGreen.white('** webpack-unused-plugin output **'), '\n')
			if (sort === 'ext') {
				console.log(chalk.green('sort unused file by extension'))
				unusedFiles = unusedFiles.map(file => ({
					file,
					ext: path.extname(file).slice(1),
				}))
				const extSortRes = group(unusedFiles, 'ext')
				for (const ext in extSortRes) {
					console.log('\n', chalk.red(`${ ext }: `, '\n'))
					if (extSortRes.hasOwnProperty(ext)) {
						const fileList = extSortRes[ext]
						fileList.forEach(f => console.log(chalk.yellow(f.file)))
					}
				}
			}
		}
		return unusedFiles
	}

	apply (compiler) {
		const _this = this
		const context = this.options.context || compiler.context
		const { patterns } = this.options
		patterns.unshift(context)
		compiler.plugin('emit', (compilcation, callback) => {
			const dependFiles = compilcation.fileDependencies
			globby(patterns, { gitignore: true })
				.then(_this.filter(dependFiles))
				.then(_this.sort.bind(_this))
				.then(unusedFiles => {
					console.log('\n', chalk.bgGreen.white('** finish webpack-unused-plugin output **'))
					if (_this.options.strict && unusedFiles && unusedFiles.length)
						compilcation.errors.push(new Error(`[webpack-unused-files-plugin]: your folder ${ context } contains unused files. Please remove or delete them.`))

					callback()
				})
		})
	}
}

module.exports = WebpackUnusedFilePlugin;
