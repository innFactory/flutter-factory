const { promptIfUndefined, initCli } = require('../helper/general');
const { promptProject, createIosApp, downloadIosConfiguration } = require('./firebaseUtil');
const { exit } = require('process');

const iosCommand = (firebase) => {
	firebase
		.command('firebase:ios', 'Create Ios Firebase app and download configuration file.')
		.option('-p --path <path>', 'Path of the Flutter project to use')
		.option('-f --firebase <name>', 'The name of the Firebase project')
		.option('-in --ios-name <name>', 'The name of the Ios app in Firebase')
		.option('-ib --ios-bundle <name>', 'The Ios bundle identifier for Firebase')
		.option('-ia --ios-appstore <name>', 'The Ios Appstore Id for Firebase')
		.action(async (options) => {
			const { directory, pubspec } = initCli(options.path);

			console.log(`You're about to add a Firebase project to "${pubspec.name}".\n`);

			const projectId = options.firebase !== undefined ? options.firebase : await promptProject();

			await ios(projectId, directory, options.androidName, options.androidPackage, pubspec.name);
		});
};
exports.iosCommand = iosCommand;

const ios = async (projectId, directory, _iosName, _iosBundle, _iosAppstore, appName) => {
	const iosName = await promptIfUndefined('What is the name for the Ios app?', _iosName, appName);
	const iosBundle = await promptIfUndefined('What is the Ios bundle identifier?', _iosBundle, 'com.example.app');
	const iosAppstore = await promptIfUndefined('What is the Ios Appstore identifier?', _iosAppstore, undefined, true);

	process.stdout.write('Creating Ios app... ');
	const iosAppId = createIosApp(projectId, iosBundle, iosName, iosAppstore);
	if (iosAppId == 0) {
		console.error('Failed to create Ios app.');
		exit();
	}
	console.log('Done');

	process.stdout.write('Downloading GoogleService-Info.plist... ');
	const iosConfiguration = downloadIosConfiguration(directory, iosAppId);
	if (iosConfiguration == 0) {
		console.error('Failed to download GoogleService-Info.plist.');
		exit();
	}
	console.log('Done');
	console.log(
		'Downloaded GoogleService-Info.plist to the project root directory. You have to drag this file into the Runner/Runner folder within XCode see https://firebase.google.com/docs/flutter/setup?platform=ios. This cannot be done automatically.'
	);
};
exports.ios = ios;
