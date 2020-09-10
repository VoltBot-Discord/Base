const chalk = require('chalk');

module.exports = async (Sequelize, volt) => {
    try {
        volt.database.define('members', {

            //CONFIGURATION
            userID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            guildID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            xp: {
                type: Sequelize.TEXT,
                defaultValue: "0"
            },
            level: {
                type: Sequelize.TEXT,
                defaultValue: "0"
            },
            messages: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            guildBlacklisted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        }, {
            timestamps: true
        });
        return volt.database.models;
    } catch (error) {
        console.log(error)
    }
}
