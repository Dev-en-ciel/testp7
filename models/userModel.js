const db = require("../config/db.config");
// const db = require("../config/config");
const { Sequelize, Model, DataTypes } = require("sequelize");

const Utilisateur = db.define(
    "Users",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(75),
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING(10),
            defaultValue: "0",
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(70),
            allowNull: false,
        },
        temp_psw: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        date_crea: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        date_mdp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        avatar: {
            type: DataTypes.STRING(75),
            defaultValue: "default.png",
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        poste: {
            type: DataTypes.STRING(25),
        },
        bureau: {
            type: DataTypes.STRING(15),
        },
    },
    {
        // Other model options go here
        db, // We need to pass the connection instance
        modelName: "Utilisateur", // We need to choose the model name
        tableName: "utilisateurs",
        timestamps: false,
    }
);

Utilisateur.associate = (models) => {
    // Utilisateur.hasMany(models.Comment, {onDelete: 'cascade'});
    // Utilisateur.hasMany(models.Article, {onDelete: 'cascade'});
    Utilisateur.hasMany(models.Comment, { foreignKey: 'id_user', onDelete: 'cascade' });
    Utilisateur.hasMany(models.Article, { foreignKey: 'id_article', onDelete: 'cascade' });
}

module.exports = Utilisateur;