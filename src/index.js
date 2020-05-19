#!/usr/bin/env node

const { program } = require('commander');

const firebaseCommands = require('./firebase');

program.version('0.0.1').description('A CLI Helper utility for Flutter Projects.');
program.addImplicitHelpCommand = () => {};

firebaseCommands(program);

program.parse(process.argv);
