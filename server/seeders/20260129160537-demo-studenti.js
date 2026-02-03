'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Students', [
      {
        ime: 'Tijana',
        prezime: 'Tijanic',
        email: 'tijana@student.rs',
        password: '123', // Kasnije ćemo naučiti kako da ovo šifrujemo
        brojIndeksa: '2020/0001',
        godinaStudija: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ime: 'Marko',
        prezime: 'Markovic',
        email: 'marko@student.rs',
        password: '123',
        brojIndeksa: '2021/0042',
        godinaStudija: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Students', null, {});
  }
};