import chalk from 'chalk';
import { exit } from 'process';
import { promptIfUndefined, promptConfirm } from '../helper/generalUtil';
import { createAndroidApp, downloadAndroidConfiguration, getApps, promptApp } from './firebaseUtil';

export const android = async (projectId: string, directory: string, appName: string, _androidName?: string, _androidPackage?: string) => {
	if (await promptConfirm('Do you want to create a new Firebase Android App? (No to choose an existing one)')) {
		const androidName = await promptIfUndefined({ message: 'What is the name for the Android app?', value: _androidName ?? '', def: appName });
		const androidPackage = await promptIfUndefined({
			message: 'What is the Android package name?',
			value: _androidPackage ?? '',
			def: 'com.example.app',
		});

		process.stdout.write('Creating Android app... ');
		const androidAppId = createAndroidApp(projectId, androidPackage, androidName);
		if (androidAppId == 'error') {
			console.error(chalk.red('Failed to create Android app.'));
			exit();
		}
		console.log('Done');

		downloadGoogleServices(directory, androidAppId);
	} else {
		const apps = getApps(projectId);

		if (apps == null) {
			console.error('Failed to get Apps from Firebase. Make sure to have firebase-cli installed and authenticated.');
			exit(1);
		}

		const appId = await promptApp(apps, 'ANDROID');
		downloadGoogleServices(directory, appId);
	}
};

const downloadGoogleServices = (directory: string, appId: string) => {
	process.stdout.write('Downloading google-services.json... ');
	const androidConfiguration = downloadAndroidConfiguration(directory, appId);
	if (!androidConfiguration) {
		console.error(chalk.red('Failed to download google-services.json. '));
		exit(1);
	}
	console.log('Done');
};
