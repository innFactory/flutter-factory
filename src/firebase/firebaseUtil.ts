import { execSync, spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import { prompt } from 'inquirer';
import { resolve } from 'path';

export const getProjects = () => {
	try {
		const projects = execSync(`firebase projects:list`, { stdio: 'pipe' }).toString();
		const regex = /^│ (?!Project Display Name)([\w\d\s-]*) │ (?!Project ID)([\w\d\s-]*) │/gm;

		const projectList = [];

		let match;
		while ((match = regex.exec(projects)) !== null) {
			const projectName = match[1].trim();
			const projectId = match[2].trim();

			projectList.push({
				id: projectId,
				name: projectName,
			});
		}

		return projectList;
	} catch (e) {
		return null;
	}
};

export interface FirebaseApp {
	displayName: string;
	appId: string;
	platform: string;
}

export const getApps = (projectId: string) => {
	try {
		const apps = execSync(`firebase apps:list --project ${projectId}`, { stdio: 'pipe' }).toString();
		const regex = /^│ (?!App Display Name)([\w\d\s\[\]]*) │ (?!App ID)([\w\d\s:]*) │ (?!Platform)(ANDROID|IOS)/gm;

		const appsList = [];

		let match;
		while ((match = regex.exec(apps)) !== null) {
			const displayName = match[1].trim();
			const appId = match[2].trim();
			const platform = match[3].trim();

			appsList.push({
				displayName: displayName,
				appId: appId,
				platform: platform,
			});
		}

		return appsList;
	} catch (e) {
		return null;
	}
};

export const promptProject = async () => {
	process.stdout.write('Loading Firebase projects...');
	const projects = getProjects();

	if (projects != null) {
		const { project } = await prompt([
			{
				type: 'list',
				name: 'project',
				message: 'Choose a Firebase project',
				choices: projects.map((p) => ({
					name: `${p.name} (${p.id})`,
					value: p.id,
				})),
			},
		]);

		return project;
	} else {
		console.error('Could not load Firebase projects. Please make sure to have the firebase-cli installed and authenticated.');
		return null;
	}
};

export const promptApp = async (apps: FirebaseApp[], platform: string) => {
	process.stdout.write('Loading Apps for ...');
	const _apps = [...apps].filter((app) => app.platform == platform);

	const { app } = await prompt([
		{
			type: 'list',
			name: 'app',
			message: `Choose an App for ${platform}`,
			choices: _apps.map((app) => ({
				name: `${app.displayName} (${app.appId})`,
				value: app.appId,
			})),
		},
	]);

	return app;
};

export const createAndroidApp = (projectId: string, packageName: string, appName: string) => {
	try {
		const result = execSync(`firebase apps:create -a ${packageName} --project ${projectId} --non-interactive ANDROID ${appName}`, {
			stdio: 'pipe',
		});
		return result.toString().match(new RegExp(/\d:\d{12}:android:[a-z\d]{22}/))?.[0] || 'error';
	} catch (error) {
		return 'error';
	}
};

export const downloadAndroidConfiguration = (directory: string, appId: string) => {
	try {
		const googleServices = execSync(`firebase apps:sdkconfig ANDROID ${appId}`, { stdio: 'pipe' });
		writeFileSync(resolve(directory, './android/app/google-services.json'), googleServices);
		return true;
	} catch (error) {
		return false;
	}
};

export const createIosApp = (projectId: string, bundleIdentifier: string, appName: string, appStoreId: string) => {
	try {
		const result = execSync(
			`firebase apps:create -b ${bundleIdentifier} ${appStoreId != '' ? '-s ' + appStoreId : ''} --project ${projectId} --non-interactive IOS ${appName}`,
			{ stdio: 'pipe' }
		);
		return result.toString().match(RegExp(/\d:\d{12}:ios:[a-z\d]{22}/))?.[0] || 'error';
	} catch (error) {
		return 'error';
	}
};

export const downloadIosConfiguration = (directory: string, appId: string) => {
	try {
		const googleServices = execSync(`firebase apps:sdkconfig IOS ${appId}`, { stdio: 'pipe' });
		writeFileSync(resolve(directory, './ios/Runner/GoogleService-Info.plist'), googleServices);
		return true;
	} catch (error) {
		return false;
	}
};
