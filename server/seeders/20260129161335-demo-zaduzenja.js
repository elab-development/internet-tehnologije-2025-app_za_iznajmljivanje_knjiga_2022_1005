'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Zaduzenjes', [
      {
        datumZaduzenja: new Date(),
        datumVracanja: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // Za 14 dana
        status: 'Aktivno',
        studentId: 1, // Student Tijana
        publikacijaId: 1, // Knjiga "Programiranje u JS"
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        datumZaduzenja: new Date(),
        datumVracanja: null,
        status: 'Vraceno',
        studentId: 2, // Student Marko
        publikacijaId: 2, // Knjiga "Na Drini ćuprija"
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Zaduzenjes', null, {});
  }
};