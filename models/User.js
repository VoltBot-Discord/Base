const chalk = require('chalk');

module.exports = async (Sequelize, volt) => {
    try {
        volt.database.define('users', {

            //CONFIGURATION
            userID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            botBlacklisted: {
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
