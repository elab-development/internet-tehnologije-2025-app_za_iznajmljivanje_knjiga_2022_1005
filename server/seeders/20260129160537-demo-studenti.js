'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return await queryInterface.bulkInsert('Students', [
        {
          ime: 'Tijana',
          prezime: 'Tijanic',
          email: 'tijanaaaa@student.rs',
          password: '123',
          brojIndeksa: '2022/0001',
          telefon: '0641234567',
        
        },
        {
          ime: 'Marko',
          prezime: 'Markovic',
          email: 'markoo@student.rs',
          password: '123',
          brojIndeksa: '2021/0045',
          telefon: '0641234569',
      
        }
      ]);
    } catch (error) {
      console.error('--- DETALJI GREŠKE ---');
      // Ispisuje tačno koja kolona zeza (npr. "email must be unique")
      if (error.errors) {
        error.errors.forEach(e => console.log('Polje:', e.path, '| Poruka:', e.message));
      } else {
        console.log(error.message);
      }
      console.error('----------------------');
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Students', null, {});
  }
};