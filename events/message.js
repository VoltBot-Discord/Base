const Discord = require('discord.js')

module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    async run(message) {
        let startAt = Date.now()
        var bot = this.bot
        var errors = this.bot.errors
        var authorization = this.bot.authorization
        var db = this.bot.db
        var blacklist = this.bot.blacklist
        var cooldown = this.bot.cooldown
        var config = this.bot.config
        var cdseconds = 4;

        if (message.type !== "DEFAULT") return;

        if (message.channel.id !== "712288768316538901") {
            let logs = bot.database.models.logs.create({
                type: "MSG",
                guild: message.guild ? message.guild.id : false,
                channel: message.channel ? message.channel.id : "DM",
                author: message.author.id,
                content: message.cleanContent,
                timeout: Date.now() - startAt,
                tts: message.tts,
                shard: bot.shard.id,
            });
        }
        if (message.channel.type === "dm") return;
        if (message.author.bot) return;
        if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

        let data = await bot.database.models.guilds.findOne({
            where: {
                guildID: message.guild.id
            }
        })
        if (!data) data = await bot.database.models.guilds.create({
            guildID: message.guild.id
        })

        let user = await bot.database.models.users.findOne({
            where: {
                userID: message.author.id
            }
        })
        if (!user) user = await bot.database.models.users.create({
            userID: message.author.id
        })

        let datauser = await bot.database.models.members.findOne({
            where: {
                userID: message.author.id,
                guildID: message.guild.id
            }
        })
        if (!datauser) datauser = await bot.database.models.members.create({
            userID: message.author.id,
            guildID: message.guild.id
        })

        datauser.messages++;
        let addExp = Math.floor(Math.random() * 10) + 50;

        let xp = datauser.xp;
        let levels = datauser.level;
        let nextLevel = 500 * Math.round(levels * (levels + 1) / 2);
        datauser.xp = Number(xp) + Number(addExp);
        if (nextLevel <= xp && message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
            datauser.xp = Number(xp) + Number(addExp);
            datauser.level = Number(levels) + Number(1);

            let channel;
            if (data.levels.channel = "default") {
                channel = message.channel
            } else if (data.levels.channel != null) {
                channel = message.guild.channels.cache.get(data.levels.channel)
            } else if (data.levels.channel = null) {
                return
            }

            if (data.language = "fr") {
                channel.send(`Bravo <@${message.author.id}>, tu passes maintenant niveau ${datauser.level} !`).then(msg => msg.delete({
                    timeout: 10000
                }))
            } else {
                channel.send(`GG ! <@${message.author.id}>, you are now level ${datauser.level} !`).then(msg => msg.delete({
                    timeout: 10000
                }))
            }

        }
        datauser.save();


        db.getSettings(message.guild.id, async function (result) {
            var prefixes = data.prefix || bot.config.settings.prefix;
            var footer = data.footer || bot.user.username
            var premium = data.premium || false
            var language = data.language || bot.config.settings.language
            //var logs_id = data.plugins.logs.bot || null
            var logs_id = null

            if (message.content == "<@!699534920271265812>") {
                if (language == "fr") message.channel.send("**Hey !** Pour m'utiliser, mon préfix sur le serveur est " + prefixes + " !");
                if (language == "en") message.channel.send("**Hey !** If you want use the bot, the prefix on this server is " + prefixes + " !");
            }
            if (message.content.startsWith(prefixes) || message.content.startsWith("v!") || message.content.toLowerCase().startsWith("volt")) {
                let messageArray = message.content.split(" ");
                const args1 = message.content.slice(prefixes.length).split(/ +/);
                const commandName = args1.shift().toLowerCase();
                let args = messageArray.slice(1);
                let commandfile = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
                if (commandfile) {

                    data.commandsMade++;
                    data.save()

                    message.channel.startTyping()

                    if (message.channel.permissionsFor(message.member).has("MENTION_EVERYONE") && message.content.includes("@everyone")) {
                        message.channel.stopTyping()
                        return errors.DoNotEveryone(message, footer, language);
                    }
                    if (!message.guild.me.hasPermission("EMBED_LINKS")) {
                        message.channel.stopTyping()
                        return errors.nopermsend(message, language);
                    }
                    if (config.status == "disabled" && !config.owners.find(x => x.id === message.author.id)) {
                        message.channel.stopTyping()
                        return errors.disabledBot(message, language, footer)
                    }
                    if (user.botBlacklisted && !config.owners.find(x => x.id === message.author.id)) {
                        message.channel.stopTyping()
                        return errors.blacklist(message, user.botBlacklisted.reason, language, footer);
                    }
                    if (commandfile.help.ownerOnly && !config.owners.find(x => x.id === message.author.id)) {
                        message.channel.stopTyping()
                        return errors.InsufficientAuthorisationLevel(message, authorization.owner, language, footer)
                    }
                    if (commandfile.help.staffOnly && !config.staffid.includes(message.author.id)) {
                        message.channel.stopTyping()
                        return errors.InsufficientAuthorisationLevel(message, authorization.staff, language, footer)
                    }
                    if (commandfile.help.requirePremium && !premium == true && !owner) {
                        message.channel.stopTyping()
                        return errors.notpremium(message, footer, language);
                    }
                    if (data.disabledCategories.includes(commandfile.help.class)) {
                        message.channel.stopTyping()
                        return errors.disabledCat(message, commandfile.help.class, language, footer)
                    }
                    if (commandfile.help.disabled && !config.owners.find(x => x.id === message.author.id)) {
                        message.channel.stopTyping()
                        return errors.disabledCommand(message, commandfile.help.name, language, footer)
                    }
                    if (commandfile.help.guildOwnerOnly && !config.owners.find(x => x.id === message.author.id)) {
                        message.channel.stopTyping()
                        return errors.noGuildOwner(message, footer, language);
                    }
                    //---------------------------


                    //à fix car quand la commande est fait dans une autre shard, ya une erreur

                    //var channel = bot.channels.cache.get("712288768316538901")
                    //channel.send(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] [CMD] Guild: ${message.guild.name} | Channel: ${message.channel.name} | Author: ${message.author.username}: ${message.content}`)


                    // FETCH DE PERMISSION & DETECTION DES CONDITIONS DE COMMANDES

                    if (commandfile.help.botPermissions) {
                        let neededPermissions = [];

                        commandfile.help.botPermissions.forEach((perm) => {
                            if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
                                neededPermissions.push(perm);
                            }
                        })

                        if (neededPermissions.length !== 0) {
                            if (neededPermissions.length > 1) {
                                message.channel.stopTyping()
                                return errors.botMultiPerms(message, neededPermissions.map((p) => `\`${p}\``).join(", "), footer, language)
                            } else {
                                message.channel.stopTyping()
                                return errors.botPerms(message, "`" + neededPermissions + "`", footer, language)
                            }
                        }
                    }
                    ///BYPASS DE PERMS OWNERS
                    if (commandfile.help.userPermissions && !config.owners.find(x => x.id === message.author.id) && !data.whitelist.includes(message.author.id)) {
                        let neededPermissions = [];

                        commandfile.help.userPermissions.forEach((perm) => {
                            if (!message.member.hasPermission(perm)) {
                                neededPermissions.push(perm);
                            }
                        })

                        if (neededPermissions.length !== 0) {
                            if (neededPermissions.length > 1) {
                                message.channel.stopTyping()
                                return errors.noMultiPerms(message, neededPermissions.map((p) => `\`${p}\``).join(", "), footer, language)
                            } else {
                                message.channel.stopTyping()
                                return errors.noPerms(message, "`" + neededPermissions + "`", footer, language)
                            }
                        }

                    }
                    //COOLDOWN DU BOT

                    commandfile.run(bot, message, args, logs_id, prefixes, footer, premium, language, data)
                        .then(async () => {
                            let logs2 = bot.database.models.logs.create({
                                type: "CMD",
                                guild: message.guild ? message.guild.id : false,
                                channel: message.channel ? message.channel.id : "DM",
                                author: message.author.id,
                                content: message.cleanContent,
                                timeout: Date.now() - startAt,
                                tts: message.tts,
                                shard: bot.shard.id,
                            })

                            message.channel.stopTyping()
                            console.log(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] [CMD] Guild: ${message.guild.name} | Channel: ${message.channel.name} | Author: ${message.author.username}: ${message.content}`)
                            bot.shard.broadcastEval(`
                        let channel = this.channels.cache.get("")
if(channel) {
                        channel.send(\`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] [CMD] Guild: ${message.guild.name} | Channel: ${message.channel.name} | Author: ${message.author.username}: ${message.content}\`)
}
                        `)
                        })
                        .catch(async (err) => {
                            let logs3 = bot.database.models.logs.create({
                                type: "ERR",
                                guild: message.guild ? message.guild.id : false,
                                channel: message.channel ? message.channel.id : "DM",
                                author: message.author.id,
                                content: message.cleanContent,
                                error: err.message,
                                timeout: Date.now() - startAt,
                                tts: message.tts,
                                shard: bot.shard.id,
                            })
                            errors.globalError(message, `${language == "en" ? `An error occured.` : `Une erreur s'est produite.`}`, footer, language);
                            message.channel.stopTyping()
                            console.log(err)
                            bot.shard.broadcastEval(`
                        var channel = this.channels.cache.get("")
                        channel.send(\`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] [ERROR] Guild: ${message.guild.name} | Channel: ${message.channel.name} | Author: ${message.author.username}: ${message.content}\n\nERROR: \`\`\`js\n${err}\`\`\`\`)
                        `)
                        })
                    if (cooldown.has(message.author.id)) {
                        let embed = new Discord.MessageEmbed()
                            .setAuthor(message.author.username, message.author.displayAvatarURL({
                                format: 'png',
                                dynamic: true,
                                size: 1024
                            }))
                            .setColor("RANDOM");
                        if (language == "fr") {
                            embed.setDescription("Vous devez attendre 4 secondes avant d'exécuter une nouvelle commande.")
                        }
                        if (language == "en") {
                            embed.setDescription("You have to wait 4 seconds between commands.")
                        }
                        embed.addField('\u200b', '\u200b')
                            .setTimestamp()
                            .setFooter(footer);
                        message.channel.send(embed).then(msg => msg.delete({
                            timeout: 2500,
                            reason: ''
                        }));
                        return;

                    }
                    cooldown.add(message.author.id);
                }
            }
            setTimeout(() => {

                message.channel.stopTyping()

                cooldown.delete(message.author.id)
            }, cdseconds * 1000)
        })
        message.channel.stopTyping()
        //})
    }
}
