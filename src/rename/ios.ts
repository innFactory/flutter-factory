import { resolve } from 'path';
import xml2js from 'xml2js';
import { readFileSync } from 'fs';

export const renameIos = (iosDirectory: string) => {};

export interface IosInfo {
	bundleName: string;
	bundleIdentifier: string;
}

export const getIosInfo = async (iosDirectory: string): Promise<IosInfo> => {
	const plistPath = resolve(iosDirectory, './Runner/Info.plist');
	const plistFile = readFileSync(plistPath, 'utf-8');
	const plistXml: any = await xml2js.parseStringPromise(plistFile).catch(() => {});

	const pbxprojPath = resolve(iosDirectory, './Runner.xcodeproj/project.pbxproj');
	const pbxprojFile = readFileSync(pbxprojPath, 'utf-8');
	const bundleIdentifier = pbxprojFile.search(/PRODUCT_BUNDLE_IDENTIFIER = (.*);/);

	console.log(bundleIdentifier);

	return {
		bundleName: plistXml['CFBundleName'],
		bundleIdentifier: '',
	};
};
