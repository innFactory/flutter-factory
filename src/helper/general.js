const { isFlutterProject, readPubspec } = require('./flutterUtil');
const chalk = require('chalk');
const figlet = require('figlet');
const { prompt } = require('inquirer');
const { exit, cwd } = require('process');
const { resolve } = require('path');

const printLogo = () => {
	console.log(chalk.white(figlet.textSync('FlutterFactory', { horizontalLayout: 'full' })));
	console.log(chalk.red('by innFactory\n'));
};
exports.printLogo = printLogo;

const promptIfUndefined = async (message, value, def, optional) => {
	if (value === undefined) {
		value = (
			await prompt([
				{
					name: 'value',
					message: message,
					default: def,
					when: () => !optional,
				},
			])
		)['value'];
	}

	return value;
};
exports.promptIfUndefined = promptIfUndefined;

const initCli = (path) => {
	const directory = path !== undefined ? resolve(path) : cwd();

	if (!isFlutterProject(directory)) {
		console.error('Must be run in a Flutter project directory.');
		exit();
	}

	const pubspec = readPubspec(directory);

	printLogo();

	return {
		directory: directory,
		pubspec: pubspec,
	};
};
exports.initCli = initCli;
