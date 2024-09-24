'use strict';
import {
  DataTypes
} from "sequelize";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Contacts', 'chatId', {
          type: DataTypes.INTEGER,
          references: {
              model: "Chats",
              key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Contacts', 'chatId');
    }
};