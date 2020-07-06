import fdir from 'fdir';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { safeLoad } from 'js-yaml';
import { resolve } from 'path';
import { RenameInfo } from '../rename';

export const isFlutterProject = (directory: string) => {
	return existsSync(resolve(directory, './pubspec.yaml'));
};

export interface Pubspec {
	name: string;
	description: string;
}

export const readPubspec = (directory: string): Pubspec => {
	const pubspecFile = readFileSync(resolve(directory, './pubspec.yaml'), 'utf-8');
	const pubspec = safeLoad(pubspecFile);

	const name = pubspec['name'];
	const description = pubspec['description'];

	return {
		name: name,
		description: description,
	};
};

export const getFlutterChangeFiles = (directory: string): string[] => {
	return [resolve(directory, './pubspec.yaml'), ...(new fdir().glob('./**/*.dart').withFullPaths().crawl(resolve(directory, './lib/')).sync() as string[])];
};

export const renameFlutter = (changeFiles: string[], renameInfo: RenameInfo) => {
	for (const path of changeFiles) {
		if (path.endsWith('.dart')) {
			const file = readFileSync(path, 'utf-8').replace(new RegExp(`package:${renameInfo.oldName}`, 'g'), `package:${renameInfo.newFlutterName}`);
			writeFileSync(path, file);
		}
		if (path.endsWith('pubspec.yaml')) {
			const file = readFileSync(path, 'utf-8').replace(new RegExp(`name: ${renameInfo.oldName}`, 'g'), `name: ${renameInfo.newFlutterName}`);
			writeFileSync(path, file);
		}
	}
};
