'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sluzbenik extends Model {
   
    static associate(models) {
     
    }
  }
  Sluzbenik.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    ime: DataTypes.STRING,
    prezime: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    aktiviran: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Sluzbenik',
  });
  return Sluzbenik;
};