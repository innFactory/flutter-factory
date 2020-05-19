const { execSync } = require('child_process');
const { resolve } = require('path');
const { writeFileSync } = require('fs');
const { prompt } = require('inquirer');

const getProjects = () => {
	const projects = execSync(`firebase projects:list`, { stdio: 'pipe' }).toString();
	const matches = projects.matchAll(/^│ (?!Project Display Name)([\w\d\s-]*) │ (?!Project ID)([\w\d\s-]*) │/gm);

	const projectList = [];

	for (const match of matches) {
		const projectName = match[1].trim();
		const projectId = match[2].trim();

		projectList.push({
			id: projectId,
			name: projectName,
		});
	}

	return projectList;
};
exports.getProjects = getProjects;

const promptProject = async () => {
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
exports.promptProject = promptProject;

const createAndroidApp = (projectId, packageName, appName) => {
	try {
		const result = execSync(`firebase apps:create -a ${packageName} --project ${projectId} --non-interactive ANDROID ${appName}`, { stdio: 'pipe' });
		return result.toString().match(new RegExp(/\d:\d{12}:android:[a-z\d]{22}/))[0];
	} catch (error) {
		console.debug(error);
		return 0;
	}
};
exports.createAndroidApp = createAndroidApp;

const downloadAndroidConfiguration = (directory, appId) => {
	try {
		const googleServices = execSync(`firebase apps:sdkconfig ANDROID ${appId}`, { stdio: 'pipe' });
		writeFileSync(resolve(directory, './android/app/google-services.json'), googleServices);
	} catch (error) {
		console.debug(error);
		return 0;
	}
};
exports.downloadAndroidConfiguration = downloadAndroidConfiguration;

const createIosApp = (projectId, bundleIdentifier, appName, appStoreId) => {
	try {
		const result = execSync(
			`firebase apps:create -b ${bundleIdentifier} ${appStoreId != '' ? '-s ' + appStoreId : ''} --project ${projectId} --non-interactive IOS ${appName}`,
			{ stdio: 'pipe' }
		);
		return result.toString().match(RegExp(/\d:\d{12}:ios:[a-z\d]{22}/))[0];
	} catch (error) {
		console.debug(error);
		return 0;
	}
};
exports.createIosApp = createIosApp;

const downloadIosConfiguration = (directory, appId) => {
	try {
		const googleServices = execSync(`firebase apps:sdkconfig IOS ${appId}`, { stdio: 'pipe' });
		writeFileSync(resolve(directory, './GoogleService-Info.plist'), googleServices);
	} catch (error) {
		console.debug(error);
		return 0;
	}
};
exports.downloadIosConfiguration = downloadIosConfiguration;
