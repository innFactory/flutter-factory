import { red, green } from 'chalk';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { prompt } from 'inquirer';
import { resolve } from 'path';
import { exit } from 'process';
import rimraf from 'rimraf';
import { promptConfirm } from '../helper/generalUtil';

export const getAndroidPackage = (androidDirectory: string) => {
	const buildGradlePath = resolve(androidDirectory, './app/build.gradle');
	const buildGradle = readFileSync(buildGradlePath, 'utf-8');

	for (const line of buildGradle.split('\n')) {
		if (line.trim().startsWith('applicationId')) {
			return line.match(/"(.*)"/)?.[1] || 'error';
		}
	}
	return 'error';
};

const shortPath = (path: string) => `android/app/${path.split('/app/')[1]}`;

const getManifestFiles = async (androidDirectory: string, oldPackageName: string, newPackageName: string) => {
	const androidManifests = ['debug', 'main', 'profile'];
	const files = [];

	for (const manifest of androidManifests) {
		const manifestPath = resolve(androidDirectory, `./app/src/${manifest}/AndroidManifest.xml`);

		if (!existsSync(manifestPath)) {
			console.error(red(`${shortPath(manifestPath)} not found.`));

			const { skip } = await prompt({
				name: 'skip',
				message: `${shortPath(manifestPath)} not found. Skip?`,
				type: 'confirm',
			});

			if (!skip) exit(1);
		} else {
			files.push(manifestPath);
		}
	}

	return files;
};

interface RenameFile {
	oldPath: string;
	newPath: string;
}

const getRenameAndroidAndKotlinFiles = async (androidDirectory: string, oldPackageName: string, newPackageName: string) => {
	const renameFiles: RenameFile[] = [];

	const oldPackageAsPath = `./${oldPackageName.replace(/\./g, '/')}`;
	const newPackageAsPath = `./${newPackageName.replace(/\./g, '/')}`;

	let javaFilesFound = false;
	const oldJavaPath = resolve(androidDirectory, './app/src/main/java/', oldPackageAsPath);
	const newJavaPath = resolve(androidDirectory, './app/src/main/java/', newPackageAsPath);
	if (existsSync(oldJavaPath)) {
		javaFilesFound = true;
		const javaFiles = readdirSync(oldJavaPath);

		for (const file of javaFiles) {
			renameFiles.push({
				oldPath: resolve(oldJavaPath, file),
				newPath: resolve(newJavaPath, file),
			});
		}
	}

	let kotlinFilesFound = false;
	const oldKotlinPath = resolve(androidDirectory, './app/src/main/kotlin/', oldPackageAsPath);
	const newKotlinPath = resolve(androidDirectory, './app/src/main/kotlin/', newPackageAsPath);
	if (existsSync(oldKotlinPath)) {
		kotlinFilesFound = true;
		const kotlinFiles = readdirSync(resolve(androidDirectory, './app/src/main/kotlin/' + oldPackageName.replace(/\./g, '/')));

		for (const file of kotlinFiles) {
			renameFiles.push({
				oldPath: resolve(oldKotlinPath, file),
				newPath: resolve(newKotlinPath, file),
			});
		}
	}

	return { renameFiles, javaFilesFound, kotlinFilesFound, oldJavaPath, newJavaPath, oldKotlinPath, newKotlinPath };
};

export const renameAndroid = async (androidDirectory: string, oldPackageName: string, newPackageName: string) => {
	const { renameFiles, javaFilesFound, kotlinFilesFound, oldJavaPath, newJavaPath, oldKotlinPath, newKotlinPath } = await getRenameAndroidAndKotlinFiles(
		androidDirectory,
		oldPackageName,
		newPackageName
	);
	const manifestFiles = await getManifestFiles(androidDirectory, oldPackageName, newPackageName);
	console.log(``);
	console.log(`Rename ${red(oldPackageName)} => ${green(newPackageName)}`);
	console.log(``);

	if (renameFiles.length > 0) {
		console.log('This will rename the following files and update their package declaration:');
		for (const renameFile of renameFiles) {
			const oldPath = shortPath(renameFile.oldPath);
			const newPath = shortPath(renameFile.newPath);
			console.log(`${red(oldPath)} => ${green(newPath)}`);
		}
	}

	console.log('');
	console.log('This will also update the package in:');
	console.log(green('android/app/build.gradle'));
	for (const manifestFilePath of manifestFiles) {
		console.log(green(shortPath(manifestFilePath)));
	}

	if (await promptConfirm('Continue')) {
		// Java and Kotlin files
		if (javaFilesFound) mkdirSync(newJavaPath);
		if (kotlinFilesFound) mkdirSync(newKotlinPath);

		for (const renameFile of renameFiles) {
			renameSync(renameFile.oldPath, renameFile.newPath);
			const file = readFileSync(renameFile.newPath, 'utf-8').replace(oldPackageName, newPackageName);
			writeFileSync(renameFile.newPath, file);
		}

		if (javaFilesFound) rimraf.sync(oldJavaPath);
		if (kotlinFilesFound) rimraf.sync(oldKotlinPath);

		// AndroidManifest files
		for (const manifestFilePath of manifestFiles) {
			const manifestFile = readFileSync(manifestFilePath, 'utf-8').replace(oldPackageName, newPackageName);
			writeFileSync(manifestFilePath, manifestFile);
		}

		// Build gradle
		const buildGradlePath = resolve(androidDirectory, `./app/build.gradle`);
		const buildGradleFile = readFileSync(buildGradlePath, 'utf-8').replace(oldPackageName, newPackageName);
		writeFileSync(buildGradlePath, buildGradleFile);
	}
};
