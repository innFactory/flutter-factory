const chalk = require('chalk');
const { promptIfUndefined, initCli } = require('../helper/general');
const { createAndroidApp, downloadAndroidConfiguration, promptProject } = require('./firebaseUtil');
const { exit } = require('process');

const androidCommand = (firebase) => {
	firebase
		.command('firebase:android', 'Create Android Firebase app and download configuration file.')
		.option('-p --path <path>', 'Path of the Flutter project to use')
		.option('-f --firebase <name>', 'The name of the Firebase project')
		.option('-an --android-name <name>', 'The name of the Android app in Firebase')
		.option('-ap --android-package <name>', 'The Android app package for Firebase')
		.action(async (options) => {
			const { directory, pubspec } = initCli(options.path);

			console.log(`You're about to add a Firebase project to "${pubspec.name}".\n`);

			const projectId = options.firebase !== undefined ? options.firebase : await promptProject();

			android(projectId, directory, options.androidName, options.androidPackage, pubspec.name);
		});
};
exports.androidCommand = androidCommand;

const android = async (projectId, directory, _androidName, _androidPackage, appName) => {
	const androidName = await promptIfUndefined('What is the name for the Android app?', _androidName, appName);
	const androidPackage = await promptIfUndefined('What is the Android package name?', _androidPackage, 'com.example.app');

	process.stdout.write('Creating Android app... ');
	const androidAppId = createAndroidApp(projectId, androidPackage, androidName);
	if (androidAppId == 0) {
		console.error(chalk.red('Failed to create Android app.'));
		exit();
	}
	console.log('Done');

	process.stdout.write('Downloading google-services.json... ');
	const androidConfiguration = downloadAndroidConfiguration(directory, androidAppId);
	if (androidConfiguration == 0) {
		console.error(chalk.red('Failed to download google-services.json. '));
		exit();
	}
	console.log('Done');
};
exports.android = android;
