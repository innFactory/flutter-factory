import { green, red } from 'chalk';
import { execSync } from 'child_process';
import program from 'commander';
import { relative, resolve } from 'path';
import { cwd, exit } from 'process';
import { getAndroidPackage, getAndroidRenameInfo, renameAndroid } from '../helper/androidUtil';
import { getFlutterChangeFiles, renameFlutter, Pubspec } from '../helper/flutterUtil';
import { initCli, printPromotion, promptConfirm, promptIfUndefined } from '../helper/generalUtil';
import { getIosBundle, getIosRenameInfo, renameIos } from '../helper/iosUtil';

export interface RenameFile {
	oldPath: string;
	newPath: string;
}

export interface RenameInfo {
	oldName: string;
	newFlutterName: string;
	newName: string;
	oldAndroidPackage: string;
	newAndroidPackage: string;
	oldIosBundle: string;
	newIosBundle: string;
}

export const renameCommand = (program: program.Command) => {
	program
		.command('rename')
		.description('Rename Flutter project including Ios and Android app.')
		.option('-n --name <name>', 'The name of the Android & IOS App')
		.option('-fn --fluter-name <name>', 'The name of the Flutter App (Dart package)')
		.option('-ap --android-package <name>', 'The Android package name')
		.option('-ib --ios-bundle <name>', 'The Ios bundle name')
		.action(async (options) => {
			const { directory, pubspec } = initCli(program.opts()['path']);

			await renameAction(directory, pubspec, {
				isRename: true,
				optionsName: options.name,
				optionsFlutterName: options.flutterName,
				optionsAndroidPackage: options.androidPackage,
				optionsIosBundle: options.iosBundle,
			});
		});
};

export const javaPackageRegex = /(?!^abstract$|^abstract\..*|.*\.abstract\..*|.*\.abstract$|^assert$|^assert\..*|.*\.assert\..*|.*\.assert$|^boolean$|^boolean\..*|.*\.boolean\..*|.*\.boolean$|^break$|^break\..*|.*\.break\..*|.*\.break$|^byte$|^byte\..*|.*\.byte\..*|.*\.byte$|^case$|^case\..*|.*\.case\..*|.*\.case$|^catch$|^catch\..*|.*\.catch\..*|.*\.catch$|^char$|^char\..*|.*\.char\..*|.*\.char$|^class$|^class\..*|.*\.class\..*|.*\.class$|^const$|^const\..*|.*\.const\..*|.*\.const$|^continue$|^continue\..*|.*\.continue\..*|.*\.continue$|^default$|^default\..*|.*\.default\..*|.*\.default$|^do$|^do\..*|.*\.do\..*|.*\.do$|^double$|^double\..*|.*\.double\..*|.*\.double$|^else$|^else\..*|.*\.else\..*|.*\.else$|^enum$|^enum\..*|.*\.enum\..*|.*\.enum$|^extends$|^extends\..*|.*\.extends\..*|.*\.extends$|^final$|^final\..*|.*\.final\..*|.*\.final$|^finally$|^finally\..*|.*\.finally\..*|.*\.finally$|^float$|^float\..*|.*\.float\..*|.*\.float$|^for$|^for\..*|.*\.for\..*|.*\.for$|^goto$|^goto\..*|.*\.goto\..*|.*\.goto$|^if$|^if\..*|.*\.if\..*|.*\.if$|^implements$|^implements\..*|.*\.implements\..*|.*\.implements$|^import$|^import\..*|.*\.import\..*|.*\.import$|^instanceof$|^instanceof\..*|.*\.instanceof\..*|.*\.instanceof$|^int$|^int\..*|.*\.int\..*|.*\.int$|^interface$|^interface\..*|.*\.interface\..*|.*\.interface$|^long$|^long\..*|.*\.long\..*|.*\.long$|^native$|^native\..*|.*\.native\..*|.*\.native$|^new$|^new\..*|.*\.new\..*|.*\.new$|^package$|^package\..*|.*\.package\..*|.*\.package$|^private$|^private\..*|.*\.private\..*|.*\.private$|^protected$|^protected\..*|.*\.protected\..*|.*\.protected$|^public$|^public\..*|.*\.public\..*|.*\.public$|^return$|^return\..*|.*\.return\..*|.*\.return$|^short$|^short\..*|.*\.short\..*|.*\.short$|^static$|^static\..*|.*\.static\..*|.*\.static$|^strictfp$|^strictfp\..*|.*\.strictfp\..*|.*\.strictfp$|^super$|^super\..*|.*\.super\..*|.*\.super$|^switch$|^switch\..*|.*\.switch\..*|.*\.switch$|^synchronized$|^synchronized\..*|.*\.synchronized\..*|.*\.synchronized$|^this$|^this\..*|.*\.this\..*|.*\.this$|^throw$|^throw\..*|.*\.throw\..*|.*\.throw$|^throws$|^throws\..*|.*\.throws\..*|.*\.throws$|^transient$|^transient\..*|.*\.transient\..*|.*\.transient$|^try$|^try\..*|.*\.try\..*|.*\.try$|^void$|^void\..*|.*\.void\..*|.*\.void$|^volatile$|^volatile\..*|.*\.volatile\..*|.*\.volatile$|^while$|^while\..*|.*\.while\..*|.*\.while$)(^(?:[a-z_]+(?:\d*[a-zA-Z_]*)*)(?:\.[a-z_]+(?:\d*[a-zA-Z_]*)*)*$)/;
export const renameAction = async (
	directory: string,
	pubspec: Pubspec,
	{
		isRename,
		optionsName,
		optionsFlutterName,
		optionsAndroidPackage,
		optionsIosBundle,
	}: {
		isRename: boolean;
		optionsName: string;
		optionsFlutterName: string;
		optionsAndroidPackage: string;
		optionsIosBundle: string;
	}
) => {
	const androidDirectory = resolve(directory, './android/');
	const androidPackage = getAndroidPackage(androidDirectory);

	if (typeof androidPackage === 'boolean') {
		console.error("Couldn't get android package name from android/app/build.gradle");
		exit(1);
	}

	const iosDirectory = resolve(directory, './ios/');
	const iosBundle = await getIosBundle(iosDirectory);

	if (typeof iosBundle === 'boolean') {
		console.error("Couldn't get ios info from ios/Runner/Info.plist");
		exit(1);
	}

	const newName = await promptIfUndefined({ message: 'New name:', value: optionsName, def: pubspec.name });
	const newFlutterName: string = await promptIfUndefined({
		message: 'New Flutter project name:',
		value: /[a-zA-Z0-9_]/.test(optionsFlutterName) ? optionsFlutterName : undefined,
		validate: (inp) => /[a-z0-9_]+/.test(inp),
		def: newName.toLowerCase().replace(' ', '_').replace(/\W/, ''),
	});
	const newAndroidPackage = await promptIfUndefined({
		message: 'New Android package name: (e.g. com.example.app)',
		value: optionsAndroidPackage,
		def: androidPackage,
		optional: false,
		validate: (inp) => javaPackageRegex.test(inp),
	});
	const newIosBundle = await promptIfUndefined({
		message: 'New Ios Bundle identifier: (e.g. com.example.app)',
		def: iosBundle,
		value: optionsIosBundle,
	});

	const renameInfo: RenameInfo = {
		oldName: pubspec.name,
		newFlutterName: newFlutterName,
		newName: newName,
		oldAndroidPackage: androidPackage,
		newAndroidPackage: newAndroidPackage,
		oldIosBundle: iosBundle,
		newIosBundle: newIosBundle,
	};
	if (isRename) {
		console.log(`You're about to rename "${red(renameInfo.oldName)}" to "${green(renameInfo.newName)}"`);
		console.log(`Android package: "${red(renameInfo.oldAndroidPackage)}" => "${green(renameInfo.newAndroidPackage)}".`);
		console.log(`IOS Bundle: "${red(renameInfo.oldIosBundle)}" => "${green(renameInfo.newIosBundle)}".`);
		console.log('');
	}

	const androidRenameInfo = await getAndroidRenameInfo(androidDirectory, renameInfo);
	const iosRenameInfo = getIosRenameInfo(iosDirectory);
	const flutterChangeFiles = getFlutterChangeFiles(directory);

	const renameFiles = [...iosRenameInfo.renameFiles, ...androidRenameInfo.renameFiles];
	const changeFiles = [...iosRenameInfo.changeFiles, ...androidRenameInfo.changeFiles, ...flutterChangeFiles];

	if (isRename) logChanges(renameFiles, changeFiles, directory);

	if (!isRename || (await promptConfirm('Continue?'))) {
		renameAndroid({ ...androidRenameInfo, ...renameInfo });
		renameIos(iosDirectory, { ...iosRenameInfo, ...renameInfo });
		renameFlutter(flutterChangeFiles, renameInfo);

		console.log('');

		let cmd = '';
		const currentDirectory = cwd();
		if (directory !== currentDirectory) {
			const toProject = relative(currentDirectory, directory);
			const toCwd = relative(directory, currentDirectory);

			cmd = `cd ${toProject} && flutter pub get && flutter clean && cd ${toCwd}`;
		} else {
			cmd = 'flutter pub get && flutter clean';
		}

		console.log(`Running "${cmd}" now.`);
		execSync(cmd, { stdio: 'inherit' });

		if (isRename) printPromotion();
	}
};

const logChanges = (renameFiles: RenameFile[], changeFiles: string[], directory: string) => {
	if (renameFiles.length > 0) {
		console.log(`This will rename the following file${renameFiles.length > 1 ? 's' : ''}:`);
		for (const renameFile of renameFiles) {
			const oldPath = shortPath(renameFile.oldPath, directory);
			const newPath = shortPath(renameFile.newPath, directory);

			console.log(`${red(oldPath)} => ${green(newPath)}`);
		}
	}
	if (changeFiles.length > 0) {
		console.log('');
		console.log(`This will update the following file${changeFiles.length > 1 ? 's' : ''}:`);
		for (const path of changeFiles) {
			console.log(`- ${green(shortPath(path, directory))}`);
		}
	}
};

export const shortPath = (path: string, directory: string = '') => {
	if (path.indexOf('android') != -1) return `android/app/${path.split('/app/')[1]}`;
	else if (path.indexOf('ios') != -1) return `ios/${path.split('/ios/')[1]}`;
	else return `${path.replace(directory, '')}`;
};
