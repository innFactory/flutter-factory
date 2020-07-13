import { red } from 'chalk';
import escapeStringRegexp from 'escape-string-regexp';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync, mkdir } from 'fs';
import { prompt } from 'inquirer';
import { resolve } from 'path';
import { exit } from 'process';
import rimraf from 'rimraf';
import { RenameFile, RenameInfo, shortPath } from '../rename';

export const getAndroidPackage = (androidDirectory: string): string | boolean => {
	const buildGradlePath = resolve(androidDirectory, './app/build.gradle');
	const buildGradle = readFileSync(buildGradlePath, 'utf-8');

	for (const line of buildGradle.split('\n')) {
		if (line.trim().startsWith('applicationId')) {
			return line.match(/"(.*)"/)?.[1] || false;
		}
	}
	return false;
};

export interface AndroidRenameInfo {
	renameFiles: RenameFile[];
	changeFiles: string[];

	javaFilesFound: boolean;
	kotlinFilesFound: boolean;
	oldJavaPath: string;
	newJavaPath: string;
	oldKotlinPath: string;
	newKotlinPath: string;
}

const getChangeFiles = async (androidDirectory: string, oldPackageName: string, newPackageName: string) => {
	const androidManifests = ['debug', 'main', 'profile'];
	const changeFiles: string[] = [];

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
			changeFiles.push(manifestPath);
		}
	}

	changeFiles.push(resolve(androidDirectory, `./app/build.gradle`));

	return changeFiles;
};

const getRenameFiles = async (androidDirectory: string, oldPackageName: string, newPackageName: string) => {
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
			const oldPath = resolve(oldJavaPath, file);
			const newPath = resolve(newJavaPath, file);

			if (oldPath !== newPath)
				renameFiles.push({
					oldPath,
					newPath,
				});
		}
	}

	let kotlinFilesFound = false;
	const oldKotlinPath = resolve(androidDirectory, './app/src/main/kotlin/', oldPackageAsPath);
	const newKotlinPath = resolve(androidDirectory, './app/src/main/kotlin/', newPackageAsPath);
	if (existsSync(oldKotlinPath)) {
		const kotlinFiles = readdirSync(resolve(androidDirectory, './app/src/main/kotlin/' + oldPackageName.replace(/\./g, '/')));
		kotlinFilesFound = true;

		for (const file of kotlinFiles) {
			const oldPath = resolve(oldKotlinPath, file);
			const newPath = resolve(newKotlinPath, file);

			if (oldPath !== newPath)
				renameFiles.push({
					oldPath,
					newPath,
				});
		}
	}

	return { renameFiles, javaFilesFound, kotlinFilesFound, oldJavaPath, newJavaPath, oldKotlinPath, newKotlinPath };
};

export const getAndroidRenameInfo = async (androidDirectory: string, renameInfo: RenameInfo): Promise<AndroidRenameInfo> => {
	const { renameFiles, javaFilesFound, kotlinFilesFound, oldJavaPath, newJavaPath, oldKotlinPath, newKotlinPath } = await getRenameFiles(
		androidDirectory,
		renameInfo.oldAndroidPackage,
		renameInfo.newAndroidPackage
	);
	const changeFiles = await getChangeFiles(androidDirectory, renameInfo.oldAndroidPackage, renameInfo.newAndroidPackage);

	return {
		renameFiles: renameFiles,
		changeFiles: changeFiles,
		javaFilesFound: javaFilesFound,
		kotlinFilesFound: kotlinFilesFound,
		oldJavaPath: oldJavaPath,
		newJavaPath: newJavaPath,
		oldKotlinPath: oldKotlinPath,
		newKotlinPath: newKotlinPath,
	};
};

export const renameAndroid = ({
	renameFiles,
	changeFiles,
	javaFilesFound,
	kotlinFilesFound,
	oldJavaPath,
	newJavaPath,
	oldKotlinPath,
	newKotlinPath,

	oldName,
	newName,
	oldAndroidPackage,
	newAndroidPackage,
}: AndroidRenameInfo & RenameInfo) => {
	// Java and Kotlin files
	if (javaFilesFound && !existsSync(newJavaPath)) mkdirSync(newJavaPath, { recursive: true });
	if (kotlinFilesFound && !existsSync(newKotlinPath)) mkdirSync(newKotlinPath, { recursive: true });

	const androidPackageRegexp = new RegExp(escapeStringRegexp(oldAndroidPackage), 'g');

	for (const renameFile of renameFiles) {
		// Move file
		renameSync(renameFile.oldPath, renameFile.newPath);

		// Replace package
		const file = readFileSync(renameFile.newPath, 'utf-8').replace(androidPackageRegexp, newAndroidPackage);
		writeFileSync(renameFile.newPath, file);
	}

	if (javaFilesFound && !(newJavaPath === oldJavaPath)) rimraf.sync(oldJavaPath);
	if (kotlinFilesFound && !(newKotlinPath === oldKotlinPath)) rimraf.sync(oldKotlinPath);

	for (const changeFile of changeFiles) {
		let file = readFileSync(changeFile, 'utf-8').replace(androidPackageRegexp, newAndroidPackage);

		if (changeFile.indexOf('main/AndroidManifest') != -1) {
			file = file.replace(`android:label="${oldName}"`, `android:label="${newName}"`);
		}

		writeFileSync(changeFile, file);
	}
};
