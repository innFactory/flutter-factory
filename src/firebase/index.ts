import { exit } from 'process';
import { initCli } from '../helper/generalUtil';
import { promptProject } from './firebaseUtil';
import { android } from './android';
import { ios } from './ios';
import program from 'commander';
// import { androidCommand } from ('./android')
// import { iosCommand } from ('./ios')

export const firebaseCommand = (program: program.Command) => {
	program
		.command('firebase')
		.description('Create Ios and Android Firebase app and download configuration files.')
		.option('-f --firebase <name>', 'The name of the Firebase project')
		.option('-sa --skip-android', 'Skip the Android app creation')
		.option('-an --android-name <name>', 'The name of the Android app in Firebase')
		.option('-ap --android-package <name>', 'The Android app package for Firebase')
		.option('-in --ios-name <name>', 'The name of the Ios app in Firebase')
		.option('-ib --ios-bundle <name>', 'The Ios bundle identifier for Firebase')
		.option('-ia --ios-appstore <name>', 'The Ios Appstore Id for Firebase')
		.option('-si --skip-ios', 'Skip the Ios app creation')
		.action(async (options) => {
			const { directory, pubspec } = initCli(program.opts()['path']);

			if (options.skipAndroid && options.skipIos) {
				console.error("You can't skip both the Ios and Android app creation.");
				exit();
			}

			console.log(`You're about to add a Firebase project to "${pubspec.name}".\n`);

			const projectId = options.firebase !== undefined ? options.firebase : await promptProject();

			if (!options.skipAndroid) {
				await android(projectId, directory, options.androidName, options.androidPackage, pubspec.name);
			}

			if (!options.skipIos) {
				await ios(projectId, directory, options.iosName, options.iosBundle, options.iosAppstore, pubspec.name);
			}
		});
};
