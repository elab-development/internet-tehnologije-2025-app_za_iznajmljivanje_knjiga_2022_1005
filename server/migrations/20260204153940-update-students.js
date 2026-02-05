'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.changeColumn('Students', 'brojIndeksa', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    });

   
    await queryInterface.changeColumn('Students', 'email', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Students', 'brojIndeksa', {
      type: Sequelize.STRING,
      unique: false,
      allowNull: false
    });

    await queryInterface.changeColumn('Students', 'email', {
      type: Sequelize.STRING,
      unique: false,
      allowNull: false
    });
  }
};