import program from 'commander';
import { exit } from 'process';
import { initCli, printPromotion } from '../helper/generalUtil';
import { android } from './android';
import { promptProject } from './firebaseUtil';
import { ios } from './ios';
import { Pubspec } from '../helper/flutterUtil';
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

			await firebaseAction(directory, pubspec, {
				firebase: options.firebase,
				androidName: options.androidName,
				skipAndroid: options.skipAndroid,
				androidPackage: options.androidPackage,
				skipIos: options.skipIos,
				iosName: options.iosName,
				iosBundle: options.iosBundle,
				iosAppstore: options.iosAppstore,
			});
		});
};

export const firebaseAction = async (
	directory: string,
	pubspec: Pubspec,
	{
		firebase,
		skipAndroid,
		androidName,
		androidPackage,
		skipIos,
		iosName,
		iosBundle,
		iosAppstore,
	}: {
		firebase?: string;
		skipAndroid?: boolean;
		androidName: string;
		androidPackage?: string;
		skipIos?: boolean;
		iosName: string;
		iosBundle?: string;
		iosAppstore?: string;
	}
) => {
	if (skipAndroid && skipIos) {
		console.error("You can't skip both the Ios and Android app creation.");
		exit(1);
	}

	console.log(`You're about to add a Firebase project to "${pubspec.name}".\n`);

	const projectId = firebase !== undefined ? firebase : await promptProject();

	if (projectId == null) {
		console.error('Something went wrong while selecting a firebase project. Make sure you have the firebase-cli installed and authenticated.');
		exit(1);
	}

	if (!skipAndroid) {
		await android(projectId, directory, pubspec.name, androidName, androidPackage);
	}

	if (!skipIos) {
		await ios(projectId, directory, iosName, pubspec.name, iosBundle, iosAppstore);
	}

	printPromotion();
};
