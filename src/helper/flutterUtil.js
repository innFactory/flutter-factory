const { readFileSync, existsSync } = require('fs');
const { safeLoad } = require('js-yaml');
const { resolve } = require('path');

const isFlutterProject = (directory) => {
	return existsSync(resolve(directory, './pubspec.yaml'));
};

const readPubspec = (directory) => {
	const pubspecFile = readFileSync(resolve(directory, './pubspec.yaml'), 'utf-8');
	const pubspec = safeLoad(pubspecFile);

	const name = pubspec['name'];
	const description = pubspec['description'];

	return {
		name: name,
		description: description,
	};
};

exports.isFlutterProject = isFlutterProject;
exports.readPubspec = readPubspec;
