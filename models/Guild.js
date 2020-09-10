const chalk = require('chalk');

module.exports = async (Sequelize, volt) => {
    try {
        volt.database.define('guilds', {

            // CONFIGURATION
            guildID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            prefix: {
                type: Sequelize.STRING(1),
                defaultValue: volt.config.settings.prefix,
                allowNull: false
            },
            language: {
                type: Sequelize.STRING(2),
                defaultValue: volt.config.settings.language
            },
            commandsMade: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            premium: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            footer: {
                type: Sequelize.TEXT,
                defaultValue: `VoltBot`,
                allowNull: false
            },
            botBlacklisted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        }, {
            timestamps: false
        });
        return volt.database.models;
    } catch (error) {
        console.log(error)
    }
}
