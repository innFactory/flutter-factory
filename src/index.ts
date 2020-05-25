#!/usr/bin/env node

import program from 'commander';
import { authCommand } from './auth';
import { firebaseCommand } from './firebase';
import { renameCommand } from './rename';
import { createCommand } from './create';

program
	.storeOptionsAsProperties(false)
	.passCommandToAction(false)
	.version('0.0.1')
	.description('A CLI Helper utility for Flutter Projects.')
	.option('-p --path <path>', 'The Flutter project path');

firebaseCommand(program);
authCommand(program);
renameCommand(program);
createCommand(program);

program.parse(process.argv);
