'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Students', 'aktiviran', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
    await queryInterface.addColumn('Sluzbeniks', 'aktiviran', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Students', 'aktiviran');
    await queryInterface.removeColumn('Sluzbeniks', 'aktiviran');
  }
};
