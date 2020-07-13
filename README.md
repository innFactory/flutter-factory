# flutter-factory

## Getting started
flutter-factory provides a few useful commands to help you create, configure or refactor a Flutter project.

This cli requires [firebase-tools](https://www.npmjs.com/package/firebase-tools) to be installed and authenticated with a Firebase account.

To install the cli tool globally run

`$ npm i -g flutter-factory`

Now you can run the cli like so:
- `$ flutter-factory [options] [command]`
- `$ flf [options] [command]`

## Commands
Every command has an interactive mode as well as cli options.

There are also general options that can be used with every command:
  - `-p --path <path>` The Flutter project path
  - `-h, --help` display help for command
  - `-V --version` output the version number

___


### Creating a new Flutter project

`$ flf create [options]` Create Flutter project from [flutter-factory template](https://github.com/innfactory/flutter-factory-templates).

This command clones the [flutter-factory template](https://github.com/innfactory/flutter-factory-templates) repository and lets you configure the name, android package, ios bundle and firebase configuration through an interactive process.

Options:
  - `-n --name <name>` The name of the Android & IOS App
  - `-fn flutter-name <name>` The name of the Flutter App (Dart package)
  - `-ap --android-package <name>` The Android package name
  - `-ib --ios-bundle <name>` The Ios bundle name

___

### Other useful commands

`$ flf rename [options]` Rename Flutter project including Ios and Android app.

Options:
  - `-n --name <name>` The name of the Android & IOS App
  - `-ap --android-package <name>` The Android package name
  - `-ib --ios-bundle <name>` The Ios bundle name

___

`$ flf auth [options]` Configure Auth Settings for [google_sign_in](https://pub.dev/packages/google_sign_in) and [flutter_facebook_login](https://pub.dev/packages/flutter_facebook_login)

Options:
  - `-sg --skip-google` Skip google auth configuration
  - `-sf --skip-facebook` Skip facebook auth configuration
  - `-fi --facebook-id <id>` Facebook Auth id
  - `-fn --facebook-name <name>` Facebook Auth name

___

`$ flf firebase [options]` Create Ios and Android Firebase app and download configuration files.

Options:
  - `-f --firebase <name>` The name of the Firebase project
  - `-sa --skip-android` Skip the Android app creation
  - `-an --android-name <name>` The name of the Android app in Firebase
  - `-ap --android-package <name>` The Android app package for Firebase
  - `-si --skip-ios` Skip the Ios app creation
  - `-in --ios-name <name>` The name of the Ios app in Firebase
  - `-ib --ios-bundle <name>` The Ios bundle identifier for Firebase
  - `-ia --ios-appstore <name>` The Ios Appstore Id for Firebase

___

`$ flf help` Display help for command

___

## Contributing
To get started developing this cli clone the development branch.

`git clone https://https://github.com/innFactory/flutter-factory.git -b develop`

### Building
To build your current development version use `npm run build`

To build and watch your current development version use `npm run start`

### Globally link local development version

If you want to globally link your local development instance you first have to uninstall the release version with

`$ npm rm -g flutter-factory`

and then you can run the following command in the root directory of the cloned repository.

`$ npm link`

 This gives you access to the "flf" and "flutter-factory" commands globally linked to your current build of the cli

### Alternative

Otherwise you can also run the cli from its folder with

`$ ts-node src/index.ts [options] [command]`

___

## Contributors
<a href="https://github.com/DevNico"><img src="https://avatars1.githubusercontent.com/u/24965872?&v=3" title="DevNico" width="80" height="80"></a>

Powered by [innFactory](https://innfactory.de/)
