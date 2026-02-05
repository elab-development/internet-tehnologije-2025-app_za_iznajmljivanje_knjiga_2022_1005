'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Kategorijas', [
      { naziv: 'Udžbenici'  },
      { naziv: 'Beletristika'  },
      { naziv: 'Naučni radovi'}
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Kategorijas', null, {});
  }
};