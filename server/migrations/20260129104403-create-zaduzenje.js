'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Zaduzenjes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      datumZaduzenja: {
        type: Sequelize.DATE
      },
      datumVracanja: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      studentId: {
        type: Sequelize.INTEGER
      },
      publikacijaId: {
        type: Sequelize.INTEGER
      }
     
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Zaduzenjes');
  }
};