'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Kategorijas', [
      { naziv: 'Udžbenici', createdAt: new Date(), updatedAt: new Date() },
      { naziv: 'Beletristika', createdAt: new Date(), updatedAt: new Date() },
      { naziv: 'Naučni radovi', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Kategorijas', null, {});
  }
};