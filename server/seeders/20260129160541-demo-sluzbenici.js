'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Sluzbeniks', [
      {
        ime: 'Admin',
        prezime: 'Jovan',
        email: 'jovan@fon.bg.ac.rs',
        password: 'admin',
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ime: 'Službenik',
        prezime: 'Ana',
        email: 'ana@fon.bg.ac.rs',
        password: '123',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Sluzbeniks', null, {});
  }
};