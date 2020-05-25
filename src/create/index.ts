import program from 'commander';
import { exit, cwd } from 'process';
import { promptIfUndefined, printLogo } from '../helper/generalUtil';
import { javaPackageRegex, renameAction } from '../rename';
import { resolve, relative } from 'path';
import { readPubspec } from '../helper/flutterUtil';
import { execSync } from 'child_process';

export const createCommand = (program: program.Command) => {
	program
		.command('create')
		.description('Create Flutter project from flutter-factory template.')
		.option('-n --name <name>', 'The name of the Android & IOS App')
		.option('-ap --android-package <name>', 'The Android package name')
		.option('-ib --ios-bundle <name>', 'The Ios bundle name')
		.action(async (options) => {
			const directory = program.opts()['path'] !== undefined ? resolve(program.opts()['path']) : cwd();
			printLogo();

			const name: string = await promptIfUndefined({ message: 'Name:', value: options.name });
			const androidPackage = await promptIfUndefined({
				message: 'Android package name:',
				value: options.androidPackage,
				validate: (inp) => javaPackageRegex.test(inp),
			});
			const iosBundle = await promptIfUndefined({
				message: 'Ios Bundle identifier:',
				value: options.iosBundle,
			});

			const targetDirName = name.replace(new RegExp(/([^a-zA-Z0-9\-\_]+)/gi), '_').toLocaleLowerCase();
			const targetDir = resolve(directory, `./${targetDirName}`);
			const relativeTarget = resolve(relative(cwd(), directory), `./${targetDirName}`);

			process.stdout.write(`Cloning https://github.com/innFactory/flutter-factory-templates.git into ${relativeTarget} ...`);
			execSync(`git clone https://github.com/innFactory/flutter-factory-templates.git -b develop ${relativeTarget}`, { stdio: 'pipe' });
			console.log('Done');

			const pubspec = readPubspec(targetDir);

			await renameAction(targetDir, pubspec, {
				isRename: false,
				optionsName: name,
				optionsAndroidPackage: androidPackage,
				optionsIosBundle: iosBundle,
			});
		});
};
