'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Publikacijas', [
      {
        naziv: 'Programiranje u JS',
        isbn: '123-456',
        autor: 'Brendan Eich',
        stanje: 5,
        slika_url: 'https://upload.wikimedia.org/wikipedia/en/6/6a/JavaScript-logo.png'  
     
        
      },
      {
        naziv: 'Na Drini ćuprija',
        isbn: '789-101',
        autor: 'Ivo Andrić',
        stanje: 2,
         slika_url: 'https://upload.wikimedia.org/wikipedia/en/6/6a/JavaScript-logo.png'  
       
       
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Publikacijas', null, {});
  }
};