import { red } from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { prompt } from 'inquirer';
import { resolve } from 'path';
import plist from 'plist';
import { exit } from 'process';
import xml2js from 'xml2js';
import { promptConfirm } from '../helper/generalUtil';

const pushToArray = (arr: any, obj: any, find: (a: any, b: any) => boolean) => {
	const index = arr.findIndex((e: any) => find(e, obj));
	if (index === -1) arr.push(obj);
	else arr[index] = obj;
};

export const facebook = async (directory: string, facebookName: string, facebookId: string) => {
	/**
	 * Android
	 */
	const manifestPath = resolve(directory, './android/app/src/main/AndroidManifest.xml');
	if (!existsSync(manifestPath)) {
		console.error(red(`AndroidManifest.xml not found.`));
		exit(1);
	}
	const manifestXml = await xml2js.parseStringPromise(readFileSync(manifestPath, 'utf8')).catch(() => {
		console.error(`Failed to load ${manifestPath}.`);
		exit(1);
	});

	const androidNameCompare = (a: any, b: any) => a['$']['android:name'] === b['$']['android:name'];
	const activities = manifestXml['manifest']['application'][0]['activity'];
	pushToArray(
		activities,
		{
			$: {
				'android:name': 'com.facebook.FacebookActivity',
				'android:configChanges': 'keyboard|keyboardHidden|screenLayout|screenSize|orientation',
				'android:label': '@string/app_name',
			},
		},
		androidNameCompare
	);
	pushToArray(
		activities,
		{
			$: {
				'android:name': 'com.facebook.CustomTabActivity',
				'android:exported': 'true',
			},
			'intent-filter': [
				{
					action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
					category: [
						{
							$: { 'android:name': 'android.intent.category.DEFAULT' },
						},
						{
							$: { 'android:name': 'android.intent.category.BROWSABLE' },
						},
					],
					data: [
						{
							$: {
								'android:scheme': '@string/fb_login_protocol_scheme',
							},
						},
					],
				},
			],
		},
		androidNameCompare
	);
	manifestXml['manifest']['application'][0]['activity'] = activities;

	const metaData = manifestXml['manifest']['application'][0]['meta-data'];
	pushToArray(
		metaData,
		{
			$: {
				'android:name': 'com.facebook.sdk.ApplicationId',
				'android:value': '@string/facebook_app_id',
			},
		},
		androidNameCompare
	);
	manifestXml['manifest']['application'][0]['meta-data'] = metaData;

	writeFileSync(manifestPath, new xml2js.Builder().buildObject(manifestXml));

	const stringsPath = resolve(directory, './android/app/src/main/res/values/strings.xml');
	if (!existsSync(stringsPath)) {
		console.error(red(`strings.xml not found. Creating...`));
		writeFileSync(stringsPath, '<?xml version="1.0" encoding="utf-8" ?><resources></resources>');
	}
	const stringsXml = await xml2js.parseStringPromise(readFileSync(stringsPath, 'utf8')).catch(() => {
		console.error(`Failed to load ${stringsPath}.`);
		process.exit(1);
	});

	let strings = stringsXml['resources']['string'] || [];
	let existsAndroid = false;
	strings.forEach((str: any) => {
		if (str['$']['name'] == 'facebook_app_id') existsAndroid = true;
	});

	const nameCompare = (a: any, b: any) => a['$']['name'] === b['$']['name'];
	if (!existsAndroid) {
		pushToArray(strings, { _: facebookName, $: { name: 'app_name' } }, nameCompare);
		pushToArray(strings, { _: facebookId, $: { name: 'facebook_app_id' } }, nameCompare);
		pushToArray(strings, { _: `fb${facebookId}`, $: { name: 'fb_login_protocol_scheme' } }, nameCompare);
	} else {
		if (await promptConfirm('Facebook Auth already configured for Android. Overwrite?')) {
			pushToArray(strings, { _: facebookName, $: { name: 'app_name' } }, nameCompare);
			pushToArray(strings, { _: facebookId, $: { name: 'facebook_app_id' } }, nameCompare);
			pushToArray(strings, { _: `fb${facebookId}`, $: { name: 'fb_login_protocol_scheme' } }, nameCompare);
		}
	}

	/**
	 * IOS
	 */
	const infoPath = resolve(directory, './ios/Runner/Info.plist');
	if (!existsSync(infoPath)) {
		console.error(red(`${infoPath} not found.`));
		process.exit();
	}
	const infoPlist: any = plist.parse(readFileSync(infoPath, 'utf8'));

	let urlTypes = infoPlist['CFBundleURLTypes'] || [];
	let existsIos = false;
	urlTypes.map((urlType: any) => {
		if ((urlType['CFBundleURLSchemes'][0] || '').startsWith('fb')) {
			existsIos = true;
		}
	});

	if (!existsIos) {
		urlTypes.push({
			CFBundleURLSchemes: [`fb${facebookId}`],
		});
		infoPlist['CFBundleURLTypes'] = urlTypes;

		infoPlist['FacebookAppID'] = facebookId;
		infoPlist['FacebookDisplayName'] = facebookName;
	} else {
		if (await promptConfirm('Facebook Auth already configured for IOS. Overwrite?')) {
			urlTypes = urlTypes.map((urlType: any) => {
				if ((urlType['CFBundleURLSchemes'][0] || '').startsWith('fb')) {
					existsIos = true;
					return {
						CFBundleURLSchemes: [`fb${facebookId}`],
					};
				}
				return urlType;
			});
			infoPlist['CFBundleURLTypes'] = urlTypes;

			infoPlist['FacebookAppID'] = facebookId;
			infoPlist['FacebookDisplayName'] = facebookName;
		}
	}

	const querySchemes = infoPlist['LSApplicationQueriesSchemes'] || [];
	if (!querySchemes.includes('fbapi')) querySchemes.push('fbapi');
	if (!querySchemes.includes('fb-messenger-share-api')) querySchemes.push('fb-messenger-share-api');
	if (!querySchemes.includes('fbauth2')) querySchemes.push('fbauth2');
	if (!querySchemes.includes('fbshareextension')) querySchemes.push('fbshareextension');
	infoPlist['LSApplicationQueriesSchemes'] = querySchemes;

	writeFileSync(infoPath, plist.build(infoPlist));
};
