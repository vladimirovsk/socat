'use strict';
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

let db = {}

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

fs.readdirSync(__dirname + '/models/').forEach(file => {
	let model = require(path.join(__dirname + /models/, file))(sequelize, Sequelize);
	db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


sequelize.sync({force: false});

module.exports = db;


