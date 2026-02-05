'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Sluzbeniks', [
      {
        ime: 'Jovan',
        prezime: 'Jovanovic',
        email: 'jovan@fon.bg.ac.rs',
        password: 'admin',
        isAdmin: true,
        
      },
      {
        ime: 'Ana',
        prezime: 'Maric',
        email: 'ana@fon.bg.ac.rs',
        password: '123',
        isAdmin: false,
        
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Sluzbeniks', null, {});
  }
};