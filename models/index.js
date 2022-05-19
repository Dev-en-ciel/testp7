// const dbConfig = require("../config/db.config.js");
// const Sequelize = require("sequelize");
// const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
//     host: dbConfig.HOST,
//     dialect: dbConfig.dialect,
//     operatorsAliases: false,
// });
// const db = {};
// db.Sequelize = Sequelize;
// db.sequelize = sequelize;
// //pour la creation des tables
// db.users = require("./userModel.js")(sequelize, Sequelize);
// db.messages = require("./messageModel.js")(sequelize, Sequelize);
// module.exports = db;

const Utilisateur = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');

Utilisateur.hasMany(Article);
Utilisateur.hasMany(Comment);
Article.hasMany(Comment);
Article.belongsTo(Utilisateur);
Comment.belongsTo(Utilisateur);
Comment.belongsTo(Article);

module.exports = {
    Utilisateur,
    Article,
    Comment,
};