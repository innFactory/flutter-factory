import { resolve } from 'path';
import { exit } from 'process';
import { promptIfUndefined, promptConfirm } from '../helper/generalUtil';
import { createIosApp, downloadIosConfiguration, getApps, promptApp } from './firebaseUtil';

export const ios = async (projectId: string, directory: string, appName: string, _iosName?: string, _iosBundle?: string, _iosAppstore?: string) => {
	if (await promptConfirm('Do you want to create a new Firebase IOS App? (No to choose an existing one)')) {
		const iosName = await promptIfUndefined({ message: 'What is the name for the Ios app?', value: _iosName ?? '', def: appName });
		const iosBundle = await promptIfUndefined({ message: 'What is the Ios bundle identifier?', value: _iosBundle ?? '', def: 'com.example.app' });
		const iosAppstore = await promptIfUndefined({ message: 'What is the Ios Appstore identifier?', value: _iosAppstore ?? '', optional: true });

		process.stdout.write('Creating Ios app... ');
		const iosAppId = createIosApp(projectId, iosBundle, iosName, iosAppstore);
		if (iosAppId == 'error') {
			console.error('Failed to create Ios app.');
			exit();
		}
		console.log('Done');

		downloadGoogleServices(directory, iosAppId);
	} else {
		const apps = getApps(projectId);

		if (apps == null) {
			console.error('Failed to get Apps from Firebase. Make sure to have firebase-cli installed and authenticated.');
			exit(1);
		}

		const appId = await promptApp(apps, 'IOS');
		downloadGoogleServices(directory, appId);
	}
};

const downloadGoogleServices = (directory: string, appId: string) => {
	process.stdout.write('Downloading GoogleService-Info.plist... ');
	const iosConfiguration = downloadIosConfiguration(directory, appId);
	if (!iosConfiguration) {
		console.error('Failed to download GoogleService-Info.plist.');
		exit(1);
	}
	console.log('Done\n');
	console.log(
		`Downloaded GoogleService-Info.plist to ${resolve(
			directory,
			'./ios/Runner/'
		)} the directory. You have to drag this file into the Runner/Runner folder within XCode see https://firebase.google.com/docs/flutter/setup?platform=ios. This cannot be done automatically.`
	);
};
