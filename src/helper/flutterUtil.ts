import { readFileSync, existsSync } from 'fs';
import { safeLoad } from 'js-yaml';
import { resolve } from 'path';

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
