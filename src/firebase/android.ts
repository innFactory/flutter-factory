import chalk from 'chalk';
import { exit } from 'process';
import { promptIfUndefined } from '../helper/generalUtil';
import { createAndroidApp, downloadAndroidConfiguration } from './firebaseUtil';

export const android = async (projectId: string, directory: string, _androidName: string, _androidPackage: string, appName: string) => {
	const androidName = await promptIfUndefined({ message: 'What is the name for the Android app?', value: _androidName, def: appName });
	const androidPackage = await promptIfUndefined({ message: 'What is the Android package name?', value: _androidPackage, def: 'com.example.app' });

	process.stdout.write('Creating Android app... ');
	const androidAppId = createAndroidApp(projectId, androidPackage, androidName);
	if (androidAppId == 'error') {
		console.error(chalk.red('Failed to create Android app.'));
		exit();
	}
	console.log('Done');

	process.stdout.write('Downloading google-services.json... ');
	const androidConfiguration = downloadAndroidConfiguration(directory, androidAppId);
	if (!androidConfiguration) {
		console.error(chalk.red('Failed to download google-services.json. '));
		exit();
	}
	console.log('Done');
};
