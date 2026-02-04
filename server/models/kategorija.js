'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kategorija extends Model {
   
   static associate(models) {

  Kategorija.hasMany(models.Publikacija, {
    foreignKey: 'kategorijaId',
    as: 'publikacije'
  });
}
  }
  Kategorija.init({
    naziv: DataTypes.STRING
  }, {
    sequelize,
    timestamps: false,
    modelName: 'Kategorija',
  });
  return Kategorija;
};