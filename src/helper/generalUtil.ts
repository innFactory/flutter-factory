import { red, white } from 'chalk';
import figlet from 'figlet';
import { prompt } from 'inquirer';
import { resolve } from 'path';
import { cwd, exit } from 'process';
import { isFlutterProject, readPubspec } from './flutterUtil';

export const printLogo = () => {
	console.log(white(figlet.textSync('FlutterFactory', { horizontalLayout: 'full' })));
	console.log(red('by innFactory\n'));
};

export const printPromotion = () => {
	console.log('');
	console.log(`❤️  If this cli helped you consider giving it a ⭐ on https://github.com/innfactory/flutter-factory`);
	console.log('');
};

export const promptIfUndefined = async ({
	message,
	value,
	def,
	optional = false,
	validate,
}: {
	message: string;
	value: string;
	def?: string;
	optional?: boolean;
	validate?: (inp: string) => boolean;
}) => {
	if (value === undefined) {
		return (
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
