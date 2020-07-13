import program from 'commander';
import { initCli, printPromotion, promptConfirm, promptIfUndefined } from '../helper/generalUtil';
import { facebook } from './facebook';
import { google } from './google';

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
					const facebookId = await promptIfUndefined({
						message: 'Enter the FacebookId (https://developers.facebook.com/docs/facebook-login/ios): ',
						value: options.facebookId,
					});
					const facebookName = await promptIfUndefined({ message: 'Enter the FacebookAppName:', value: options.facebookName });

					await facebook(directory, facebookName, facebookId);

					console.log('Facebook auth configured');
				}
			}

			printPromotion();
		});
};
