const Discord = require("discord.js");
const package = require('../../package.json');
const si = require('systeminformation');
const fs = require("fs");
const path = require("path");
const wait = require("system-sleep");
const errors = require("../../utils/errors.js");
const config = require("../../config.json");
var commandsclass = config.commands.class;


module.exports.run = async (bot, message, args, logs_id, prefixes, footer, premium, language) => {
    if (message.guild.me.hasPermission("MANAGE_MESSAGES")) message.delete({
        timeout: 1
    });
    let aboutembed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(message.author.username, message.author.displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 1024
        }))
        .setThumbnail(bot.user.displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 1024
        }));
    si.osInfo().then(data1 => {
        si.mem().then(data2 => {
            si.cpu().then(data3 => {
                const promises = [
                    bot.shard.fetchClientValues('guilds.cache.size'),
                    bot.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)'),
                ];

                Promise.all(promises)
                    .then(async results => {
                        const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
                        const totalUsers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
                        var total_memory = data2.total;
                        var total_mem_in_kb = total_memory / 1024;
                        var total_mem_in_mb = total_mem_in_kb / 1024;
                        var total_mem_in_gb = total_mem_in_mb / 1024;

                        var free_memory = data2.free;
                        var free_mem_in_kb = free_memory / 1024;
                        var free_mem_in_mb = free_mem_in_kb / 1024;
                        var free_mem_in_gb = free_mem_in_mb / 1024;

                        let totalSeconds = (bot.uptime / 1000);
                        let days = Math.floor(totalSeconds / 86400);
                        let hours = Math.floor(totalSeconds / 3600);
                        totalSeconds %= 3600;
                        let minutes = Math.floor(totalSeconds / 60);
                        let seconds = totalSeconds % 60;
                        if (language == "fr") {
                            let values = await bot.shard.broadcastEval(`
          [
              this.guilds.cache.size
          ]
          `);
                            let shard = "";
                            let shard1 = 1;
                            values.forEach((value) => {
                                shard += "<:online:712908534400155729> Shard " + shard1 + " | Nombre de serveurs : " + value[0] + "\n";
                                shard1 = shard1 + 1;
                            });
                            aboutembed.setTitle("__**» Information sur le bot**__")
                                .addField("ID :id:", bot.user.id, true)
                                .addField("Pseudonyme :paperclip:", bot.user.username, true)
                                .addField("Hashtag :hash:", bot.user.discriminator, true)
                                .addField("Tag :paperclips:", bot.user.tag, true)
                                .addField("Crée le :calendar:", bot.timeConverter(bot.user.createdAt), true)
                                .addField("Serveurs :wrench:", totalGuilds, true)
                                .addField("Utilisateurs :busts_in_silhouette:", totalUsers, true)
                                .addField("Version du bot :regional_indicator_v:", package.version, true)
                                .addField("Nombre de commandes :1234:", `${bot.owner(message.author.id) ? bot.commands.size : (bot.staff(message.author.id) ? bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size : bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size - bot.commands.filter(x => x.help.class == 'staff').size + data.customCommands.commands.length)}`, true)
                                .addField("Nombre de shards :1234:", shard, true)
                                .addField("Version de Discord.JS :regional_indicator_v:", Discord.version, true)
                                .addField("Version de Node.JS :regional_indicator_v:", process.version, true)
                                .addField("Environnement/Architecture de notre machine :floppy_disk:", String(data1.platform).charAt(0).toUpperCase() + String(data1.platform).slice(1) + " - " + data1.arch, true)
                                .addField("Proccesseur :pager:", data3.manufacturer + " " + data3.brand + " - " + data3.cores + " coeurs, " + data3.speed + "Mhz", true)
                                .addField("RAM utilisé sur notre machine :battery:", parseInt(total_mem_in_gb - free_mem_in_gb) + "/" + parseInt(total_mem_in_gb) + " Go (" + parseInt((Number((total_mem_in_gb - free_mem_in_gb)) / Number(total_mem_in_gb)) * 100) + "%)", true)
                                .addField("Lancement depuis :clock1:", `${days} jour(s), ${hours} heure(s), ${minutes} minute(s) et ${parseInt(seconds)} seconde(s)`, true)
                                .addField("Lien du bot :paperclip:", "[cliquez ici](https://discord.com/oauth2/authorize?client_id=699534920271265812&scope=bot&permissions=1006108159)", true)
                                .addField("Site web :paperclips:", "[cliquez ici](https://voltbot.xyz)", true)
                                .addField("Serveur de support :speaking_head:", "[cliquez ici](https://discord.gg/aB8gEud)", true)
                                .addField("Développeur :bust_in_silhouette:", "[" + bot.users.cache.get("679559090741051393").tag + "](https://discord.com/users/679559090741051393/), [" + bot.users.cache.get("709534713500401685").tag + "](https://discord.com/users/709534713500401685/)", true);
                        }
                        if (language == "en") {

                            let values = await bot.shard.broadcastEval(`
[
    this.guilds.cache.size
]
`);
                            let shard = "";
                            let shard1 = 1;
                            values.forEach((value) => {
                                shard += "<:online:712908534400155729> Shard " + shard1 + " | Server count: " + value[0] + "\n";
                                shard1 = shard1 + 1;
                            });
                            aboutembed.setTitle("__**» Bot information**__")
                                .addField("ID :id:", bot.user.id, true)
                                .addField("Username :paperclip:", bot.user.username, true)
                                .addField("Hashtag :hash:", bot.user.discriminator, true)
                                .addField("Tag :paperclips:", bot.user.tag, true)
                                .addField("Created at :calendar:", bot.compileDate(bot.user.createdAt), true)
                                .addField("Servers :wrench:", totalGuilds, true)
                                .addField("Users :busts_in_silhouette:", totalUsers, true)
                                .addField("Bot version :regional_indicator_v:", package.version, true)
                                .addField("Number of commands :1234:", `${bot.owner(message.author.id) ? bot.commands.size : (bot.staff(message.author.id) ? bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size : bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size - bot.commands.filter(x => x.help.class == 'staff').size + data.customCommands.commands.length)}`, true)
                                .addField("Number of shards :1234:", shard, true)
                                .addField("Version of Discord.JS :regional_indicator_v:", Discord.version, true)
                                .addField("Version of Node.JS :regional_indicator_v:", process.version, true)
                                .addField("Environnement/Architecture on our server :floppy_disk:", String(data1.platform).charAt(0).toUpperCase() + String(data1.platform).slice(1) + " - " + data1.arch, true)
                                .addField("Proccessor :pager:", data3.manufacturer + " " + data3.brand + " - " + data3.cores + " cores, " + data3.speed + "Mhz", true)
                                .addField("RAM used on our server :battery:", parseInt(total_mem_in_gb - free_mem_in_gb) + "/" + parseInt(total_mem_in_gb) + " Gb (" + parseInt((Number((total_mem_in_gb - free_mem_in_gb)) / Number(total_mem_in_gb)) * 100) + "%)", true)
                                .addField("Launch at :clock1:", `${days} day(s), ${hours} hour(s), ${minutes} minute(s) and ${parseInt(seconds)} second(s)`, true)
                                .addField("Bot link :paperclip:", "[click here](https://discord.com/oauth2/authorize?client_id=699534920271265812&scope=bot&permissions=1006108159)", true)
                                .addField("Website :paperclips:", "[click here](https://voltbot.xyz)", true)
                                .addField("Support server :speaking_head:", "[click here](https://discord.gg/aB8gEud)", true)
                                .addField("Developer :bust_in_silhouette:", "[" + bot.users.cache.get("679559090741051393").tag + "](https://discord.com/users/679559090741051393/), [" + bot.users.cache.get("709534713500401685").tag + "](https://discord.com/users/709534713500401685/)", true);
                        }
                        aboutembed.attachFiles(['./animation.gif'])
                            .setImage('attachment://animation.gif')
                            .setTimestamp()
                            .setFooter(footer);

                        if (!message.guild.me.hasPermission("EMBED_LINKS")) return errors.nopermsend(message, language);
                        message.channel.send(aboutembed);

                    });
            });
        });
    });
}

module.exports.help = {
    name: "about",
    aliases: ['botinfo', 'info', 'information', 'botinformation'],
    descriptionfr: "Permets d'avoir les informations sur le robot",
    descriptionen: "Have the bot informations list",
    botPermissions: [],
    userPermissions: [],
    staffOnly: false,
    ownerOnly: false,
    requirePremium: false,
    disabled: false
}
