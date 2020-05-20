import { initCli, promptIfUndefined } from '../helper/generalUtil';
import path, { resolve } from 'path';
import program from 'commander';
import { getAndroidPackage, renameAndroid } from './android';
import { exit } from 'process';
import { getIosInfo } from './ios';

export const renameCommand = (program: program.Command) => {
	program
		.command('rename')
		.description('Rename Flutter project including Ios and Android app.')
		.option('-n --name <name>', 'The name of the Android & IOS App')
		.option('-na --name-android <name>', 'The name of the Android App')
		.option('-ni --name-ios <name>', 'The name of the IOS App')
		.option('-ap --android-package <name>', 'The Android package name')
		.option('-ib --ios-bundle <name>', 'The Ios bundle name')
		.action(async (options) => {
			const { directory, pubspec } = initCli(program.opts()['path']);

			const androidDirectory = path.resolve(directory, './android/');
			const androidPackage = getAndroidPackage(androidDirectory);

			if (androidPackage == 'error') {
				console.error("Couldn't get android package name from android/app/build.gradle");
				exit(1);
			}

			const iosDirectory = resolve(directory, './ios/');
			const iosInfo = await getIosInfo(iosDirectory);

			console.log(`You're about to rename "${pubspec.name}" (Android: ${androidPackage}, IOS: ${iosInfo.bundleIdentifier}).\n`);

			const javaPackageRegex = /(?!^abstract$|^abstract\..*|.*\.abstract\..*|.*\.abstract$|^assert$|^assert\..*|.*\.assert\..*|.*\.assert$|^boolean$|^boolean\..*|.*\.boolean\..*|.*\.boolean$|^break$|^break\..*|.*\.break\..*|.*\.break$|^byte$|^byte\..*|.*\.byte\..*|.*\.byte$|^case$|^case\..*|.*\.case\..*|.*\.case$|^catch$|^catch\..*|.*\.catch\..*|.*\.catch$|^char$|^char\..*|.*\.char\..*|.*\.char$|^class$|^class\..*|.*\.class\..*|.*\.class$|^const$|^const\..*|.*\.const\..*|.*\.const$|^continue$|^continue\..*|.*\.continue\..*|.*\.continue$|^default$|^default\..*|.*\.default\..*|.*\.default$|^do$|^do\..*|.*\.do\..*|.*\.do$|^double$|^double\..*|.*\.double\..*|.*\.double$|^else$|^else\..*|.*\.else\..*|.*\.else$|^enum$|^enum\..*|.*\.enum\..*|.*\.enum$|^extends$|^extends\..*|.*\.extends\..*|.*\.extends$|^final$|^final\..*|.*\.final\..*|.*\.final$|^finally$|^finally\..*|.*\.finally\..*|.*\.finally$|^float$|^float\..*|.*\.float\..*|.*\.float$|^for$|^for\..*|.*\.for\..*|.*\.for$|^goto$|^goto\..*|.*\.goto\..*|.*\.goto$|^if$|^if\..*|.*\.if\..*|.*\.if$|^implements$|^implements\..*|.*\.implements\..*|.*\.implements$|^import$|^import\..*|.*\.import\..*|.*\.import$|^instanceof$|^instanceof\..*|.*\.instanceof\..*|.*\.instanceof$|^int$|^int\..*|.*\.int\..*|.*\.int$|^interface$|^interface\..*|.*\.interface\..*|.*\.interface$|^long$|^long\..*|.*\.long\..*|.*\.long$|^native$|^native\..*|.*\.native\..*|.*\.native$|^new$|^new\..*|.*\.new\..*|.*\.new$|^package$|^package\..*|.*\.package\..*|.*\.package$|^private$|^private\..*|.*\.private\..*|.*\.private$|^protected$|^protected\..*|.*\.protected\..*|.*\.protected$|^public$|^public\..*|.*\.public\..*|.*\.public$|^return$|^return\..*|.*\.return\..*|.*\.return$|^short$|^short\..*|.*\.short\..*|.*\.short$|^static$|^static\..*|.*\.static\..*|.*\.static$|^strictfp$|^strictfp\..*|.*\.strictfp\..*|.*\.strictfp$|^super$|^super\..*|.*\.super\..*|.*\.super$|^switch$|^switch\..*|.*\.switch\..*|.*\.switch$|^synchronized$|^synchronized\..*|.*\.synchronized\..*|.*\.synchronized$|^this$|^this\..*|.*\.this\..*|.*\.this$|^throw$|^throw\..*|.*\.throw\..*|.*\.throw$|^throws$|^throws\..*|.*\.throws\..*|.*\.throws$|^transient$|^transient\..*|.*\.transient\..*|.*\.transient$|^try$|^try\..*|.*\.try\..*|.*\.try$|^void$|^void\..*|.*\.void\..*|.*\.void$|^volatile$|^volatile\..*|.*\.volatile\..*|.*\.volatile$|^while$|^while\..*|.*\.while\..*|.*\.while$)(^(?:[a-z_]+(?:\d*[a-zA-Z_]*)*)(?:\.[a-z_]+(?:\d*[a-zA-Z_]*)*)*$)/;

			const newName = await promptIfUndefined('New name:', options.name, pubspec.name, false);
			const newOrganisation = await promptIfUndefined('New organisation domain:', options.domain, androidPackage, false, (inp) =>
				javaPackageRegex.test(inp)
			);

			await renameAndroid(androidDirectory, androidPackage, newOrganisation);
		});
};
