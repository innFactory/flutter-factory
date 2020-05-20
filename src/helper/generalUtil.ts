import { isFlutterProject, readPubspec } from './flutterUtil';
import chalk from 'chalk';
import figlet from 'figlet';
import { prompt } from 'inquirer';
import { exit, cwd } from 'process';
import { resolve } from 'path';

export const printLogo = () => {
	console.log(chalk.white(figlet.textSync('FlutterFactory', { horizontalLayout: 'full' })));
	console.log(chalk.red('by innFactory\n'));
};

export const promptIfUndefined = async (message: string, value: string, def?: string, optional?: boolean, validate?: (inp: string) => boolean) => {
	if (value === undefined) {
		value = (
			await prompt([
				{
					name: 'value',
					message: message,
					default: def,
					when: () => !optional,
					validate: validate,
				},
			])
		)['value'];
	}

	return value;
};

export const promptConfirm = async (message: string) => {
	const { ok } = await prompt([
		{
			type: 'confirm',
			message: message,
			name: 'ok',
		},
	]);

	return ok;
};

export const initCli = (path: string) => {
	const directory = path !== undefined ? resolve(path) : cwd();

	console.log(directory);

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
