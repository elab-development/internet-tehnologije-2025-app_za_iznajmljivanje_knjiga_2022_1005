'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Publikacijas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      naziv: { type: Sequelize.STRING },
      isbn: { type: Sequelize.STRING },
      autor: { type: Sequelize.STRING },
      stanje: { type: Sequelize.INTEGER },
      // DODAJEMO SLIKU ODMAH
      slika_url: { type: Sequelize.STRING(500) } 
      // OBRISANO: kategorijaId (više nam ne treba ni na početku)
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Publikacijas');
  }
};