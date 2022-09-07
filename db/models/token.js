const Sequelize = require('sequelize');
class Token extends Sequelize.Model {}

module.exports = async (sequelize) => {
    await Token.init({
            code: {type: Sequelize.STRING},
            token: {type: Sequelize.STRING},
            name: {type: Sequelize.STRING},
            image: {type: Sequelize.STRING},
            liquidity: {
                type: Sequelize.DOUBLE,
                defaultValue: 0
            },
            volume_24: {
                type: Sequelize.DOUBLE,
                defaultValue: 0
            },
            price: {
                type: Sequelize.DOUBLE,
                defaultValue: 0
            },
            price24: {
                type: Sequelize.DOUBLE,
                defaultValue: 0
            },
            status: {
                type: Sequelize.SMALLINT,
                defaultValue: 1
            },
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            }
        },
        {
            sequelize, modelName: 'Token', tableName: 'token', timestamps: true
        }
    )
    return Token
}