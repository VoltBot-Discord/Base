const VoltBot = require("./base/VoltBot.js");
const bot = new VoltBot({
    disableEveryone: true,
    fetchAllMembers: true
});
bot.init("models", "events", "commands");
bot.login(bot.config.connection.token);

module.exports = bot;
