'use strict';
import { Sequelize } from 'sequelize';
import tokenModel from './models/token.js'
import conf from '../config.js';
let db = {};

const sequelize = new Sequelize(
	conf.database.database,
	conf.database.user,
	conf.database.password,
	{
		host: conf.database.host,
		dialect: conf.database.driver,
		operatorsAliases: 0,
		logging: false,
		pool: {
			max: conf.database.pool.max || 5,
			min: conf.database.pool.min || 0,
			acquire: conf.database.pool.acquire || 30000,
			idle: conf.database.pool.idle || 10000
		}
	}
);


const models = {
	User: tokenModel(sequelize, Sequelize.DataTypes)
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.models = models;

sequelize.sync({force: false});

export default db;


