'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sluzbeniks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      ime: {
        type: Sequelize.STRING
      },
      prezime: {
        type: Sequelize.STRING
      },
      isAdmin: {
        type: Sequelize.BOOLEAN
      },
    
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sluzbeniks');
  }
};