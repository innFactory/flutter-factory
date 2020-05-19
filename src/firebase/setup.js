const { exit } = require('process');
const { android } = require('./android');
const { initCli } = require('../helper/general');
const { promptProject } = require('./firebaseUtil');
const { ios } = require('./ios');

const setupCommand = (firebase) => {
	firebase
		.command('firebase:setup')
		.description('Create Ios and Android Firebase app and download configuration files.')
		.option('-p --path <path>', 'Path of the Flutter project to use')
		.option('-f --firebase <name>', 'The name of the Firebase project')
		.option('-sa --skip-android', 'Skip the Android app creation')
		.option('-an --android-name <name>', 'The name of the Android app in Firebase')
		.option('-ap --android-package <name>', 'The Android app package for Firebase')
		.option('-in --ios-name <name>', 'The name of the Ios app in Firebase')
		.option('-ib --ios-bundle <name>', 'The Ios bundle identifier for Firebase')
		.option('-ia --ios-appstore <name>', 'The Ios Appstore Id for Firebase')
		.option('-si --skip-ios', 'Skip the Ios app creation')
		.action(async (options) => {
			const { directory, pubspec } = initCli(options.path);

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
exports.setupCommand = setupCommand;
