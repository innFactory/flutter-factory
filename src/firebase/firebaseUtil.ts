import { execSync } from 'child_process';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { prompt } from 'inquirer';

export const getProjects = () => {
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
};

export const promptProject = async () => {
	process.stdout.write('Loading Firebase projects...');
	const projects = getProjects();

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
};

export const createAndroidApp = (projectId: string, packageName: string, appName: string) => {
	try {
		const result = execSync(`firebase apps:create -a ${packageName} --project ${projectId} --non-interactive ANDROID ${appName}`, {
			stdio: 'pipe',
		});
		return result.toString().match(new RegExp(/\d:\d{12}:android:[a-z\d]{22}/))?.[0] || 'error';
	} catch (error) {
		console.debug(error);
		return 'error';
	}
};

export const downloadAndroidConfiguration = (directory: string, appId: string) => {
	try {
		const googleServices = execSync(`firebase apps:sdkconfig ANDROID ${appId}`, { stdio: 'pipe' });
		writeFileSync(resolve(directory, './android/app/google-services.json'), googleServices);
		return true;
	} catch (error) {
		console.debug(error);
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
		console.debug(error);
		return 'error';
	}
};

export const downloadIosConfiguration = (directory: string, appId: string) => {
	try {
		const googleServices = execSync(`firebase apps:sdkconfig IOS ${appId}`, { stdio: 'pipe' });
		writeFileSync(resolve(directory, './ios/Runner/GoogleService-Info.plist'), googleServices);
		return true;
	} catch (error) {
		console.debug(error);
		return false;
	}
};
