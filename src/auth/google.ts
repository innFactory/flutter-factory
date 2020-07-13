import { red } from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import plist from 'plist';
import { exit } from 'process';
import { promptConfirm } from '../helper/generalUtil';

export const google = async (directory: string) => {
	const googleServicePath = resolve(directory, './ios/Runner/GoogleService-Info.plist');
	if (!existsSync(googleServicePath)) {
		console.error(red('GoogleService-Info.plist not found. Try running "flf setup" first.'));
		exit();
	}
	const googleSericePlist: any = plist.parse(readFileSync(googleServicePath, 'utf8'));
	const reverseClientId = googleSericePlist['REVERSED_CLIENT_ID'];

	const infoPath = resolve(directory, './ios/Runner/Info.plist');
	if (!existsSync(infoPath)) {
		console.error(red(`${infoPath} not found.`));
		exit();
	}
	const infoPlist: any = plist.parse(readFileSync(infoPath, 'utf8'));

	let urlTypes = infoPlist['CFBundleURLTypes'] || [];
	let exists = false;
	urlTypes.map((urlType: any) => {
		if ((urlType['CFBundleURLSchemes'][0] || '').startsWith('com.googleusercontent.apps')) {
			exists = true;
		}
	});

	if (!exists) {
		urlTypes.push({
			CFBundleTypeRole: 'Editor',
			'CFBundleURLSchemes:': [reverseClientId],
		});
		infoPlist['CFBundleURLTypes'] = urlTypes;
	} else {
		if (await promptConfirm('Google Auth already configured. Overwrite?')) {
			urlTypes = urlTypes.map((urlType: any) => {
				if ((urlType['CFBundleURLSchemes'][0] || '').startsWith('com.googleusercontent.apps')) {
					exists = true;
					return {
						CFBundleTypeRole: 'Editor',
						'CFBundleURLSchemes:': [reverseClientId],
					};
				}
				return urlType;
			});
			infoPlist['CFBundleURLTypes'] = urlTypes;
		}
	}

	writeFileSync(infoPath, plist.build(infoPlist));
};
