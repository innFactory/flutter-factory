import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import plist from 'plist';
import { RenameFile, RenameInfo } from '../rename';

export interface IosRenameInfo {
	renameFiles: RenameFile[];
	changeFiles: string[];
}

export const getIosRenameInfo = (iosDirectory: string): IosRenameInfo => {
	const plistPath = resolve(iosDirectory, './Runner/Info.plist');
	const pbxprojPath = resolve(iosDirectory, './Runner.xcodeproj/project.pbxproj');

	return {
		renameFiles: [],
		changeFiles: [plistPath, pbxprojPath],
	};
};

export const renameIos = async (iosDirectory: string, { newName, oldIosBundle, newIosBundle }: RenameInfo) => {
	const infoPath = resolve(iosDirectory, './Runner/Info.plist');
	let infoPlist: any = plist.parse(readFileSync(infoPath, 'utf8'));
	infoPlist['CFBundleName'] = newName;
	writeFileSync(infoPath, plist.build(infoPlist));

	const pbxprojPath = resolve(iosDirectory, './Runner.xcodeproj/project.pbxproj');
	const pbxprojFile = readFileSync(pbxprojPath, 'utf-8').replace(new RegExp(oldIosBundle, 'g'), newIosBundle);
	writeFileSync(pbxprojPath, pbxprojFile);
};

export interface IosInfo {
	bundleName: string;
	bundleIdentifier: string;
}

export const getIosBundle = async (iosDirectory: string): Promise<string | boolean> => {
	const pbxprojPath = resolve(iosDirectory, './Runner.xcodeproj/project.pbxproj');
	const pbxprojFile = readFileSync(pbxprojPath, 'utf-8');
	const bundleIdentifier = pbxprojFile.match(/PRODUCT_BUNDLE_IDENTIFIER = (.*);/)?.[1];

	if (bundleIdentifier === undefined) return false;

	return bundleIdentifier;
};
