const {
	Client,
	Collection
} = require("discord.js");
const date = require('date-and-time');
const SelfReloadJSON = require('self-reload-json');
const fs = require('fs')
const chalk = require('chalk')
const readdir = require("util").promisify(fs.readdir);
const moment = require("moment");
const Sequelize = require('sequelize');

require('events').EventEmitter.prototype._maxListeners = 500;

moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("ss", 5);
moment.relativeTimeThreshold("m", 60);
moment.relativeTimeThreshold("h", 60);
moment.relativeTimeThreshold("d", 24);
moment.relativeTimeThreshold("M", 12);

/* Extending Discord Client as VoltBot */
class VoltBot extends Client {

	constructor(options) {
		super(options);

		this.on('ready', async () => {
			console.log(`${this.user.tag} is ready !`);
		});

		/* Setting up variables */
		this.config = new SelfReloadJSON(`${__dirname}/../config.json`);
		this.commands = new Collection();
		this.cmds = new Collection();
		this.categories = [];
		this.cooldown = new Set();
		this.wait = require("system-sleep");
		this.db = require("../utils/mysql.js");
		this.errors = require("../utils/errors.js");
		this.broadcast = this.voice.createBroadcast();
		this.authorization = this.config.settings.authorization;
		this.jsonCache = {};
		this.data = {};
		this.guildCache = [];
		this.spawned = false;
		/* ----- */


		this.database = new Sequelize(this.config.database.db, this.config.database.user, this.config.database.pass, {
			host: this.config.database.host,
			dialect: "mysql",
			define: {
				charset: "utf8",
				collate: "utf8_general_ci",
				timestamps: false
			},
			pool: {
				max: 200,
				min: 0,
				acquire: 60000,
				idle: 10000
			},
			logging: false
		});

		/* ----- Initialising Logs Events, Discord Player & Discord Giveaways */
		let logs = require('discord-logs');
		logs(this);

	}

	// Get default language from config
	get defaultLanguage() {
		return this.config.language
	};

	// Get default prefix from config
	get defaultPrefix() {
		return this.config.prefix
	};
	
	// Save config
	async saveConfig() {
		fs.writeFile(`${__dirname}/../config.json`, JSON.stringify(this.config, null, 3), function (err) {
			if (err) {
				console.log(err)
			}
		})
		return true;
	}

	// Simple async foreach
	async asyncForEach(array, callback) {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array);
		}
	};
	async resolveGuildData(id) {
		let data = await this.database.models.guilds.findOrCreate({
			where: {
				guildID: id
			}
		});

		return data[0];
	};

	async resolveUserData(id) {
		let data = await this.database.models.users.findOrCreate({
			where: {
				userID: id
			}
		});

		return data[0];
	};

	// Check if id is bot owner function
	owner(id) {
		if (this.config.owners.find(x => x.id === id)) {
			return true;
		} else {
			return false;
		}
	};

	// Check if id is bot staff function
	staff(id) {
		if (this.config.staffid.includes(id)) {
			return true;
		} else {
			return false;
		}
	};

	// Time converter
	compileDate(a) {
		var time = date.format(a, date.compile('MMM D YYYY h:m:s A')) + " (UTC Hours)";
		return time;
	}

	// Time converter (French)
	timeConverter(a) {
		var months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var hour = a.getUTCHours();
		var min = a.getUTCMinutes();
		var sec = a.getUTCSeconds();
		var time = "Le " + date + ' ' + month + ' ' + year + ', à ' + hour + ':' + min + ':' + sec + " (Heure UTC)";
		return time;
	}

	// Generate a hex color and return it
	randomHexColor() {
		let n = (Math.random() * 0xfffff * 1000000).toString(16);
		return '#' + n.slice(0, 6);
	};

	// String reverser
	reverseString(str) {
		var splitString = str.split("");
		var reverseArray = splitString.reverse();
		var joinArray = reverseArray.join("");
		return joinArray;
	}

	// Bot initializer (events, dashboard & commands)
	async init(...args) {

		if (args.includes("models")) {

			const mdlFiles = await readdir(`${__dirname}/../models`);
			if (!mdlFiles) throw Error("No models was found, without the models, command cannot be loaded and database cannot be sync")

			this.database.authenticate().then(async () => {
				await require('../models/Guild.js')(Sequelize, this)
				console.log(chalk.yellow(`» ${chalk.underline("Model loaded !")} ${chalk.bold("Guild.js")}.`))
				await require('../models/Member.js')(Sequelize, this)
				console.log(chalk.yellow(`» ${chalk.underline("Model loaded !")} ${chalk.bold("Member.js")}.`))
				await require('../models/User.js')(Sequelize, this)
				console.log(chalk.yellow(`» ${chalk.underline("Model loaded !")} ${chalk.bold("User.js")}.`))
				await require('../models/Logs.js')(Sequelize, this)
				console.log(chalk.yellow(`» ${chalk.underline("Model loaded !")} ${chalk.bold("Logs.js")}.`))

				await this.database.sync({
					alter: true,
					force: false
				})
			}).catch(async (err) => {
				console.log(err)
			})
		}

		if (args.includes("events")) {

			const evtFiles = await readdir(`./events/`);
			if (!evtFiles) throw Error("No event was found, without the message event, command cannot be loaded")
			evtFiles.forEach((file) => {
				const eventName = file.split(".")[0];
				const event = new(require(`../events/${file}`))(this);
				console.log(chalk.yellow(`» ${chalk.underline("Event loaded !")} ${chalk.bold(file)}.`));
				this.on(eventName, (...args) => event.run(...args));
				delete require.cache[require.resolve(`../events/${file}`)];
			});
		}
		if (args.includes("commands")) {
			const directories = await readdir("./commands/");
			directories.filter(d => !d.endsWith("disabled")).forEach(async (dir) => {
				this.categories.push(dir)
				const commands = await readdir("./commands/" + dir + "/");
				commands.filter(f => f.endsWith(".js")).forEach((f, i) => {
					try {
						this.loadCommand(dir, f)
					} catch (error) {
						console.log(error)
					}
				});
			});
		}
	};

	// Command loader
	async loadCommand(commandClass, commandName) {
		try {
			delete require.cache[require.resolve(`../commands/${commandClass}/${commandName}`)];
			let props = require(`../commands/${commandClass}/${commandName}`);
			props.help.class = commandClass;

			this.cmds.set(props.help.name, props);
			this.commands.set(props.help.name, props);
			console.log(chalk.yellow(`» ${chalk.underline("Command loaded !")} ${chalk.bold(commandName)} in the category ${chalk.bold(commandClass)}.`));
			return;
		} catch (e) {
			console.log(e)
			return `Unable to load command ${commandName}: ${e}`;
		}
	}


	/*
	// Command unloader
	async unloadCommand(commandName) {
		let command = this.commands.get(commandName) || this.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
		if (!command) {
			return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		}

		if (command.shutdown) {
			await command.shutdown(this);
		}
		delete require.cache[require.resolve(`../commands/${command.help.class}/${commandName}`)];
		console.log(chalk.yellow(`» ${chalk.underline("Command unloaded !")} ${chalk.bold(commandName)} in the category ${chalk.bold(command.help.class)}.`));
		return;
	}*/

	// Command disabler
	async disableCommand(commandName) {
		let command = this.commands.get(commandName) || this.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
		if (!command) {
			return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		}
		command.help.disabled = true
		return `Successfully disabled !`
	}

	// Command enabler
	async enableCommand(commandName) {
		let command = this.commands.get(commandName) || this.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
		if (!command) {
			return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		}
		command.help.disabled = false
		return `Successfully enabled !`
	}

	// resolve a bot user fastly
	async resolveUser(search) {
		let user = null;
		if (!search || typeof search !== "string") return;

		if (search.match(/^<@!?(\d+)>$/)) {
			const id = search.match(/^<@!?(\d+)>$/)[1];
			user = this.users.fetch(id).catch(() => {});
			if (user) return user;
		}

		if (search.match(/^!?(\w+)#(\d+)$/)) {
			const username = search.match(/^!?(\w+)#(\d+)$/)[0];
			const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
			user = this.users.cache.find((u) => u.username === username && u.discriminator === discriminator);
			if (user) return user;
		}
		user = await this.users.fetch(search).catch(() => {});
		return user;
	}

	// resolve a guild member fastly 
	async resolveMember(search, guild) {
		let member = null;
		if (!search || typeof search !== "string") return;

		if (search.match(/^<@!?(\d+)>$/)) {
			const id = search.match(/^<@!?(\d+)>$/)[1];
			member = await guild.members.fetch(id).catch(() => {});
			if (member) return member;
		}

		if (search.match(/^!?(\w+)#(\d+)$/)) {
			guild = await guild.fetch();
			member = guild.members.cache.find((m) => m.user.tag === search);
			if (member) return member;
		}
		member = await guild.members.fetch(search).catch(() => {});
		return member;
	}

	// Resolve a guild role fastly
	async resolveRole(search, guild) {
		let role = null;
		if (!search || typeof search !== "string") return;

		if (search.match(/^<@&!?(\d+)>$/)) {
			const id = search.match(/^<@&!?(\d+)>$/)[1];
			role = guild.roles.cache.get(id);
			if (role) return role;
		}

		role = guild.roles.cache.find((r) => search === r.name);
		if (role) return role;
		role = guild.roles.cache.get(search);
		return role;
	}

}

module.exports = VoltBot;
