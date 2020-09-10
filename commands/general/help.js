const Discord = require("discord.js");
const config = require("../../config.json");

module.exports.run = async (bot, message, args, logs_id, prefixes, footer, premium, language, data) => {

	const color = bot.randomHexColor()
	var owner = config.owners.find(x => x.id === message.author.id)

	if (args[0]) {
		const name = args[0].toLowerCase();
		const command = bot.commands.get(name) || bot.commands.find(c => c.help.aliases && c.help.aliases.includes(name));
		if (command) {
			if (data.language == "fr") {
				let embed = new Discord.MessageEmbed()
					.setColor(color)
					.setAuthor(message.author.username, message.author.displayAvatarURL({
						format: 'png',
						dynamic: true,
						size: 1024
					}))
					.setTitle('__**» Aide de la commande ' + String(command.help.name).charAt(0).toUpperCase() + String(command.help.name).slice(1) + '**__')
					.addField(`**Nom :abc:**`, `${command.help.name}`, true);
				if (command.help.aliases) embed.addField(`**Alias :infinity:**`, "``" + command.help.aliases.join('``, ``') + "``", true);
				if (!command.help.aliases) embed.addField(`**Alias :infinity:**`, "__Aucun :x:__", true);
				if (command.help.descriptionfr) embed.addField(`**Description :pencil:**`, command.help.descriptionfr, true);
				if (!command.help.descriptionfr) embed.addField(`**Description :pencil:**`, "__Aucun :x:__");
				if (!command.help.usagefr) embed.addField(`**Usage :writing_hand:**`, `\`\`${data.prefix}${command.help.name}\`\``, true);
				if (command.help.usagefr) embed.addField(`**Usage :writing_hand:**`, `${data.prefix}${command.help.name} \`\`${command.help.usagefr}\`\``, true);
				embed.addField(`\u200B`, `${bot.config.broadcast}[GitHub](https://github.com/VoltBot-Discord)・[Support](${bot.config.support.invitation})・[Site web](${bot.config.dashboard.link})・[Invitation](https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1006108159)`)
					.setTimestamp()
					.setFooter(data.footer);
				message.channel.send(embed);
			}

			if (data.language == "en") {
				let embed = new Discord.MessageEmbed()
					.setColor(color)
					.setAuthor(message.author.username, message.author.displayAvatarURL({
						format: 'png',
						dynamic: true,
						size: 1024
					}))
					.setTitle('__**» Help of ' + String(command.help.name).charAt(0).toUpperCase() + String(command.help.name).slice(1) + '\'s command**__')
					.addField(`**Name :abc:**`, `${command.help.name}`, true);
				if (command.help.aliases) embed.addField(`**Aliases :infinity:**`, "``" + command.help.aliases.join('``, ``') + "``", true);
				if (!command.help.aliases) embed.addField(`**Aliases :infinity:**`, "__Nothing :x:__", true);
				if (command.help.descriptionen) embed.addField(`**Description :pencil:**`, command.help.descriptionen, true);
				if (!command.help.descriptionen) embed.addField(`**Description :pencil:**`, "__Nothing :x:__", true);
				if (!command.help.usageen) embed.addField(`**Usage :writing_hand:**`, `\`\`${data.prefix}${command.help.name}\`\``, true);
				if (command.help.usageen) embed.addField(`**Usage :writing_hand:**`, `${data.prefix}${command.help.name} \`\`${command.help.usageen}\`\``, true);
				embed.addField(`\u200B`, `${bot.config.broadcast}[GitHub](https://github.com/VoltBot-Discord)・[Support](${bot.config.support.invitation})・[Site web](${bot.config.dashboard.link})・[Invitation](https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1006108159)`)
					.setTimestamp()
					.setFooter(data.footer);
				message.channel.send(embed);
			}
			return;
		}
	}

	if (data.language == `fr`) {
		let embed = new Discord.MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({
				format: 'png',
				dynamic: true,
				size: 1024
			}))
			.setColor(color)
			.setTitle('__**» Liste d\'aide :page_with_curl:**__')
			.setDescription(`Le préfix sur le serveur est \`${data.prefix}\`.\nNombre total de commandes : **${bot.owner(message.author.id) ? bot.commands.size : (bot.staff(message.author.id) ? bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size : bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size - bot.commands.filter(x => x.help.class == 'staff').size) + data.customCommands.commands.length}**.\nNombre total de catégories de commandes : **${bot.owner(message.author.id) ? bot.categories.length : (bot.staff(message.author.id) ? bot.categories.length - 1 : bot.categories.length - 2) + data.customCommands.commands.length > 0 ? 1 : 0}**\nUtilisez \`${data.prefix}help <commande>\` pour avoir la liste d'aide de cette dernière.\nExemple: \`${data.prefix}help ${bot.commands.filter(x => x.help.class !== "nsfw" && x.help.class !== "owner" && x.help.class !== "staff").random().help.name}\`\nInvite moi dans ton serveur en [cliquant ici](https://discord.com/oauth2/authorize?client_id=699534920271265812&scope=bot&permissions=1006108159)`)
		if (owner) {
			embed.addField(`<:crown:738745576870641714>・Créateur (${bot.commands.filter(x => x.help.class == 'owner').size})`, bot.commands.filter(x => x.help.class == 'owner').sort(async (a, b) => {
				if (a.help.name < b.help.name) {
					return -1;
				}
				if (a.help.name > b.help.name) {
					return 1;
				}
				return 0;
			}).map(x => `\`${x.help.name}\``).join(", "))
		}
		embed.addField(`:desktop_computer: ・Administration (${bot.commands.filter(x => x.help.class == 'admin').size})`, bot.commands.filter(x => x.help.class == 'admin').sort(async (a, b) => {
				if (a.help.name < b.help.name) {
					return -1;
				}
				if (a.help.name > b.help.name) {
					return 1;
				}
				return 0;
			}).map(x => `\`${x.help.name}\``).join(", "))
			//embed.addField(`:closed_lock_with_key: ・Configuration (${bot.subCommands.size})`, `${data.prefix}config ` + bot.subCommands.map(x => `\`${x.name}\``).join(", "))
			.addField(`:pushpin:・Général (${bot.commands.filter(x => x.help.class == 'general').size})`, bot.commands.filter(x => x.help.class == 'general').sort(async (a, b) => {
				if (a.help.name < b.help.name) {
					return -1;
				}
				if (a.help.name > b.help.name) {
					return 1;
				}
				return 0;
			}).map(x => `\`${x.help.name}\``).join(", "))
			embed.addField(`\u200B`, `${bot.config.broadcast}[GitHub](https://github.com/VoltBot-Discord)・[Support](${bot.config.support.invitation})・[Site web](${bot.config.dashboard.link})・[Invitation](https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1006108159)`)
			/*
			.attachFiles(['./animation.gif'])
			.setImage('attachment://animation.gif')
			*/
			.setTimestamp()
			.setFooter(data.footer);

		message.channel.send(embed);

	}
	if (data.language == `en`) {

		let embed = new Discord.MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({
				format: 'png',
				dynamic: true,
				size: 1024
			}))
			.setColor(color)
			.setTitle('__**» Help list :page_with_curl:**__')
			.setDescription(`The prefix on this server is \`${data.prefix}\`.\nNumber of commands : **${bot.owner(message.author.id) ? bot.commands.size : (bot.staff(message.author.id) ? bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size : bot.commands.size - bot.commands.filter(x => x.help.class == 'owner').size - bot.commands.filter(x => x.help.class == 'staff').size + data.customCommands.commands.length)}**.\nNumber of commands categories : **${data.customCommands.commands.length > 0 ? bot.owner(message.author.id) ? bot.categories.length : (bot.staff(message.author.id) ? bot.categories.length - 1 : bot.categories.length - 2) + 1 : bot.owner(message.author.id) ? bot.categories.length : (bot.staff(message.author.id) ? bot.categories.length - 1 : bot.categories.length - 2)}**.\nPlease use \`${data.prefix}help <command>\` to have the help list for that.\nExample: \`${data.prefix}help ${bot.commands.filter(x => x.help.class !== "nsfw" && x.help.class !== "owner" && x.help.class !== "staff").random().help.name}\`\nInvite me in your server by [clicking here](https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1006108159)`)
		if (owner) {
			embed.addField(`<:crown:738745576870641714>・Owner (${bot.commands.filter(x => x.help.class == 'owner').size})`, bot.commands.filter(x => x.help.class == 'owner').sort(async (a, b) => {
				if (a.help.name < b.help.name) {
					return -1;
				}
				if (a.help.name > b.help.name) {
					return 1;
				}
				return 0;
			}).map(x => `\`${x.help.name}\``).join(", "))
		}
		embed.addField(`:desktop_computer: ・Administration (${bot.commands.filter(x => x.help.class == 'admin').size})`, bot.commands.filter(x => x.help.class == 'admin').sort(async (a, b) => {
				if (a.help.name < b.help.name) {
					return -1;
				}
				if (a.help.name > b.help.name) {
					return 1;
				}
				return 0;
			}).map(x => `\`${x.help.name}\``).join(", "))
			.addField(`:pushpin:・General (${bot.commands.filter(x => x.help.class == 'general').size})`, bot.commands.filter(x => x.help.class == 'general').sort(async (a, b) => {
				if (a.help.name < b.help.name) {
					return -1;
				}
				if (a.help.name > b.help.name) {
					return 1;
				}
				return 0;
			}).map(x => `\`${x.help.name}\``).join(", "))
			embed.addField(`\u200B`, `${bot.config.broadcast}[GitHub](https://github.com/VoltBot-Discord)・[Support](${bot.config.support.invitation})・[Website](${bot.config.dashboard.link})・[Invitation](https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1006108159)`)
			/*
			.attachFiles(['./animation.gif'])
			.setImage('attachment://animation.gif')
			*/
			.setTimestamp()
			.setFooter(data.footer);

		message.channel.send(embed);
	}
}

module.exports.help = {
	name: `help`,
	aliases: ['helplist', 'h', 'aide'],
	descriptionfr: "Permets d'avoir la liste d'aide",
	descriptionen: "Have the help list",
	botPermissions: [],
	userPermissions: [],
	staffOnly: false,
	ownerOnly: false,
	requirePremium: false,
	disabled: false
}
