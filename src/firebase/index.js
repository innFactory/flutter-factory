const { setupCommand } = require('./setup');
const { androidCommand } = require('./android');
const { iosCommand } = require('./ios');

module.exports = (program) => {
	setupCommand(program);
	androidCommand(program);
	iosCommand(program);
};
