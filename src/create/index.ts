import program from 'commander';
import { cwd, exit } from 'process';
import { promptIfUndefined, printLogo } from '../helper/generalUtil';
import { javaPackageRegex, renameAction } from '../rename';
import { resolve, relative } from 'path';
import { readPubspec, isFlutterProject } from '../helper/flutterUtil';
import { execSync } from 'child_process';
import rimraf from 'rimraf';
import { existsSync } from 'fs';
import { firebaseAction } from '../firebase';

export const createCommand = (program: program.Command) => {
	program
		.command('create')
		.description('Create Flutter project from flutter-factory template.')
		.option('-n --name <name>', 'The name of the Android & IOS App')
		.option('-fn --fluter-name <name>', 'The name of the Flutter App (Dart package)')
		.option('-ap --android-package <name>', 'The Android package name')
		.option('-ib --ios-bundle <name>', 'The Ios bundle name')
		.action(async (options) => {
			let relativeTarget;

			try {
				const directory = program.opts()['path'] !== undefined ? resolve(program.opts()['path']) : cwd();
				printLogo();

				const name: string = await promptIfUndefined({ message: 'Name:', value: options.name });
				const flutterName: string = await promptIfUndefined({
					message: 'Flutter project name:',
					value: options.flutterName,
					validate: (inp) => /[a-z0-9_]+/.test(inp),
					def: name.toLowerCase().replace(' ', '_').replace(/\W/, ''),
				});
				const androidPackage = await promptIfUndefined({
					message: 'Android package name (com.example.app):',
					value: options.androidPackage,
					validate: (inp) => javaPackageRegex.test(inp),
				});
				const iosBundle = await promptIfUndefined({
					message: 'Ios Bundle identifier (com.example.app):',
					value: options.iosBundle,
					validate: (inp) => /^[a-z0-9-]+(.[a-z0-9-]+)*/i.test(inp),
					def: androidPackage,
				});

				const targetDirName = name.replace(new RegExp(/([^a-zA-Z0-9\-\_]+)/gi), '_').toLocaleLowerCase();
				const targetDir = resolve(directory, `./${targetDirName}`);
				relativeTarget = resolve(relative(cwd(), directory), `./${targetDirName}`);

				if (existsSync(relativeTarget)) {
					console.error(`Target directory '${relativeTarget}' already exists.`);
					exit(1);
				}

				process.stdout.write(`Cloning https://github.com/innFactory/flutter-factory-templates.git into ${relativeTarget}...`);
				try {
					execSync(`git clone https://github.com/innFactory/flutter-factory-templates.git -b develop ${relativeTarget}`, {
						stdio: 'pipe',
					});
					rimraf.sync(resolve(relativeTarget, './.git/'));
				} catch (e) {
					console.log();
					console.error('Git clone of flutter-factory-template failed.');
					exit(1);
				}
				console.log('Done');

				let pubspec = readPubspec(targetDir);
				if (!isFlutterProject(targetDir)) {
					console.error('pubspec.yaml not found. Something went wrong.');
					exit(1);
				}

				await renameAction(targetDir, pubspec, {
					isRename: false,
					optionsName: name,
					optionsFlutterName: flutterName,
					optionsAndroidPackage: androidPackage,
					optionsIosBundle: iosBundle,
				});

				pubspec = readPubspec(targetDir);

				await firebaseAction(targetDir, pubspec, {
					androidName: name,
					skipAndroid: false,
					androidPackage: androidPackage,
					skipIos: false,
					iosName: name,
					iosBundle: iosBundle,
				});
			} catch (e) {
				console.error('Something went wrong during the create process.');
				process.stdout.write('Cleaning up... ');
				if (relativeTarget !== undefined) {
					rimraf.sync(relativeTarget);
				}
				console.log('Done.');
			}
		});
};
