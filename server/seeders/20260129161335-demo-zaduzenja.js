'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Zaduzenjes', [
      {
        datumZaduzenja: new Date(),
        datumVracanja: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), 
        status: 'Aktivno',
        studentId: 1, 
        publikacijaId: 1, 
        datumZaduzenja: new Date(),
        datumVracanja: null,
        studentId: 2, 
        publikacijaId: 2, 
      
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Zaduzenjes', null, {});
  }
};