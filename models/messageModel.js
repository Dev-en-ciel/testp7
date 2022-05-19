module.exports = (sequelize, Sequelize) => {
    let Message = sequelize.define('Message', {
        title: {
            type: Sequelize.STRING
        },
        content: {
            type: Sequelize.STRING
        },
        attachment: {
            type: Sequelize.STRING
        },
        likes: {
            type: Sequelize.INTEGER
        }
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here

                models.Message.belongsTo(models.User, {
                    foreignKey: {
                        allowNull: false
                    }
                })
            }
        }
    });
    return Message;
};