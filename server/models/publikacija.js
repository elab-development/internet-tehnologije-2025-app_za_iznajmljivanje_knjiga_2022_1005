'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Publikacija extends Model {
    static associate(models) {
     
      Publikacija.hasMany(models.Zaduzenje, {
        foreignKey: 'publikacijaId',
        as: 'zaduzenja'
      });
    }
  }

  Publikacija.init({
    naziv: DataTypes.STRING,
    isbn: DataTypes.STRING,
    autor: DataTypes.STRING,
    stanje: DataTypes.INTEGER,
    
    slika_url: DataTypes.STRING 
   
  }, {
    sequelize,
    freezeTableName: true,
    tableName: 'Publikacijas',
    timestamps: false
  });

  return Publikacija;
};