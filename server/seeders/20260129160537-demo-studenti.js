'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Students', [
      {
        ime: 'Tijana',
        prezime: 'Tijanic',
        email: 'tijana@student.rs',
        password: '123', 
        brojIndeksa: '2020/0001'
        
      },
      {
        ime: 'Marko',
        prezime: 'Markovic',
        email: 'marko@student.rs',
        password: '123',
        brojIndeksa: '2021/0042',
        
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Students', null, {});
  }
};