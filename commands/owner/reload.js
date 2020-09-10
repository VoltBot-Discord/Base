const Discord = require("discord.js");;
const fs = require("fs");
const config = require("../../config.json");
const errors = require("../../utils/errors.js");
const path = require("path");

module.exports.run = async (bot, message, args, logs_id, prefixes, footer, premium, language) => {

    if(!args[0]) return message.channel.send("Commande introuvable.")
    const commandName = args[0]
    let command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
    if (!command) return message.channel.send("Commande introuvable.")

    let commandn = command.help.name
    let commandc = command.help.class
    try {
        //let props = require(``);
        console.log(command)
        delete require.cache[require.resolve(`../${command.help.class}/${command.help.name}`)];
        let props = require(`../${command.help.class}/${command.help.name}`);
        bot.commands.delete(props)
       props.help.class = command.help.class

bot.commands.set(props.help.name, props)
message.channel.send("Command reloaded !").then(m => m.delete({timeout: 5000}));
    } catch (error) {
        message.channel.send("Impossible de reload cette commande: "+error)
        console.log(error)
    }

}

module.exports.help = {
    name: "reload",
    descriptionfr: "Recharge une commande du bot",
    descriptionen: "Reload a bot command",
    staffOnly: false,
    ownerOnly: true,
    requirePremium: false,
    userPermissions: [],
    botPermissions: ["EMBED_LINKS"]
}
