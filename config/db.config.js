require("dotenv").config();

//Connexion BDD sequelize
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB,
    process.env.USER,
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        dialect: "mysql",
    }
);

try {
    sequelize.authenticate();
    console.log("Connexion etablie.");
} catch (error) {
    console.error("Erreur de connexion à la db", error);
}

module.exports = sequelize;
