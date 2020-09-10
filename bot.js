const VoltBot = require("./base/VoltBot.js");
const bot = new VoltBot({
    disableEveryone: true,
    fetchAllMembers: true
});
if(bot.shard.ids.includes(0)) bot.init("models", "events", "commands")
else bot.init("models", "events", "commands");
bot.login(bot.config.connection.token);

module.exports = bot;
