import { google } from './google';
import { initCli, promptIfUndefined, promptConfirm } from '../helper/generalUtil';
import { facebook } from './facebook';
import { prompt } from 'inquirer';
import program from 'commander';

export const authCommand = (program: program.Command) => {
	program
		.command('auth')
		.description('Configure Auth Settings')
		.option('-sg --skip-google', 'Skip google auth configuration')
		.option('-sf --skip-facebook', 'Skip facebook auth configuration')
		.option('-fi --facebook-id <id>', 'Facebook Auth id')
		.option('-fn --facebook-name <name>', 'Facebook Auth name')
		.action(async (options) => {
			const { directory, pubspec } = initCli(program.opts()['path']);

			if (!options.skipGoogle) {
				if (await promptConfirm('Do you want to configure Google Auth?')) {
					await google(directory);
					console.log('Google auth configured');
				}
			}

			if (!options.skipFacebook) {
				if (await promptConfirm('Do you want to configure Facebook Auth?')) {
					const facebookId = await promptIfUndefined(
						'Enter the FacebookId (https://developers.facebook.com/docs/facebook-login/ios): ',
						options.facebookId
					);
					const facebookName = await promptIfUndefined('Enter the FacebookAppName:', options.facebookName);

					await facebook(directory, facebookName, facebookId);

					console.log('Facebook auth configured');
				}
			}
		});
};
