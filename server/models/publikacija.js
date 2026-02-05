'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Publikacija extends Model {
   
   static associate(models) {

  Publikacija.belongsTo(models.Kategorija, {
    foreignKey: 'kategorijaId',
    as: 'kategorija'
  });
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
    kategorijaId: DataTypes.INTEGER
  }, {
  sequelize,
  freezeTableName: true,   
  tableName: 'publikacijas', 
  
  timestamps: false
  });
  return Publikacija;
};