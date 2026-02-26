'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Publikacijas', [
      {
        naziv: 'Programiranje u JS',
        isbn: '123-456',
        autor: 'Brendan Eich',
        stanje: 5,
     
        
      },
      {
        naziv: 'Na Drini ćuprija',
        isbn: '789-101',
        autor: 'Ivo Andrić',
        stanje: 2,
       
       
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Publikacijas', null, {});
  }
};